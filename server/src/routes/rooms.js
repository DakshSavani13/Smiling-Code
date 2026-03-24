import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Room from '../models/Room.js';
import Session from '../models/Session.js';
import auth from '../middleware/auth.js';

const router = Router();

// POST /api/rooms — create a new room
router.post('/', auth, async (req, res) => {
  try {
    const { name, language } = req.body;

    const room = await Room.create({
      roomId: uuidv4(),
      name: name || 'Untitled Room',
      language: language || 'javascript',
      createdBy: req.user.id,
      participants: [req.user.id],
    });

    res.status(201).json(room);
  } catch (err) {
    console.error('Create room error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/rooms — list user's rooms
router.get('/', auth, async (req, res) => {
  try {
    const rooms = await Room.find({
      $or: [
        { createdBy: req.user.id },
        { participants: req.user.id },
      ],
    })
      .populate('createdBy', 'username avatarColor')
      .sort({ updatedAt: -1 });

    res.json(rooms);
  } catch (err) {
    console.error('List rooms error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/rooms/:roomId — get room by roomId
router.get('/:roomId', auth, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId })
      .populate('createdBy', 'username avatarColor')
      .populate('participants', 'username avatarColor');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Add user to participants if not already there
    if (!room.participants.some(p => p._id.toString() === req.user.id)) {
      room.participants.push(req.user.id);
      await room.save();
    }

    res.json(room);
  } catch (err) {
    console.error('Get room error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/rooms/:roomId/sessions — get session history
router.get('/:roomId/sessions', auth, async (req, res) => {
  try {
    const sessions = await Session.find({ roomId: req.params.roomId })
      .populate('userId', 'username avatarColor')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(sessions);
  } catch (err) {
    console.error('Get sessions error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
