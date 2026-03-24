import jwt from 'jsonwebtoken';
import * as Y from 'yjs';
import { getYDoc, applyUpdate, encodeStateAsUpdate } from './yjs.js';

// Track active users per room
const roomUsers = new Map();

export const initSocket = (io) => {
  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.username} (${socket.id})`);

    // ─── Join Room ───
    socket.on('join-room', ({ roomId }) => {
      socket.join(roomId);
      socket.roomId = roomId;

      // Track user in room
      if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, new Map());
      }
      roomUsers.get(roomId).set(socket.id, {
        id: socket.user.id,
        username: socket.user.username,
        avatarColor: socket.user.avatarColor,
        socketId: socket.id,
      });

      // Send current Yjs doc state to the new joiner
      const doc = getYDoc(roomId);
      const stateUpdate = encodeStateAsUpdate(doc);
      socket.emit('yjs-sync', Buffer.from(stateUpdate).toString('base64'));

      // Broadcast updated user list
      const users = Array.from(roomUsers.get(roomId).values());
      io.to(roomId).emit('room-users', users);

      console.log(`📌 ${socket.user.username} joined room ${roomId} (${users.length} users)`);
    });

    // ─── Yjs Document Updates ───
    socket.on('yjs-update', ({ roomId, update }) => {
      const binaryUpdate = new Uint8Array(Buffer.from(update, 'base64'));
      applyUpdate(roomId, binaryUpdate);
      // Broadcast to everyone else in the room
      socket.to(roomId).emit('yjs-update', update);
    });

    // ─── Cursor Position Updates ───
    socket.on('cursor-update', ({ roomId, cursor }) => {
      socket.to(roomId).emit('cursor-update', {
        userId: socket.user.id,
        username: socket.user.username,
        avatarColor: socket.user.avatarColor,
        cursor,
      });
    });

    // ─── Selection Updates ───
    socket.on('selection-update', ({ roomId, selection }) => {
      socket.to(roomId).emit('selection-update', {
        userId: socket.user.id,
        username: socket.user.username,
        avatarColor: socket.user.avatarColor,
        selection,
      });
    });

    // ─── Code Execution Output Broadcast ───
    socket.on('code-output', ({ roomId, output, language, status }) => {
      io.to(roomId).emit('code-output', {
        userId: socket.user.id,
        username: socket.user.username,
        output,
        language,
        status,
      });
    });

    // ─── Language Change ───
    socket.on('language-change', ({ roomId, language }) => {
      socket.to(roomId).emit('language-change', { language });
    });

    // ─── Leave Room ───
    socket.on('leave-room', ({ roomId }) => {
      handleLeave(socket, roomId, io);
    });

    // ─── Disconnect ───
    socket.on('disconnect', () => {
      if (socket.roomId) {
        handleLeave(socket, socket.roomId, io);
      }
      console.log(`🔌 User disconnected: ${socket.user.username}`);
    });
  });
};

function handleLeave(socket, roomId, io) {
  socket.leave(roomId);

  if (roomUsers.has(roomId)) {
    roomUsers.get(roomId).delete(socket.id);

    const users = Array.from(roomUsers.get(roomId).values());
    io.to(roomId).emit('room-users', users);

    // Remove cursor
    io.to(roomId).emit('cursor-remove', { userId: socket.user.id });

    if (users.length === 0) {
      roomUsers.delete(roomId);
    }

    console.log(`📌 ${socket.user.username} left room ${roomId} (${users.length} users remaining)`);
  }
}
