import * as Y from 'yjs';

// In-memory store of Yjs documents per room
const docs = new Map();

/**
 * Get or create a Yjs document for a room
 */
export function getYDoc(roomId) {
  if (!docs.has(roomId)) {
    const doc = new Y.Doc();
    // Initialize with a Y.Text type named "monaco"
    doc.getText('monaco');
    docs.set(roomId, doc);
    console.log(`📄 Created Yjs doc for room ${roomId}`);
  }
  return docs.get(roomId);
}

/**
 * Apply a binary update to the room's Yjs document
 */
export function applyUpdate(roomId, update) {
  const doc = getYDoc(roomId);
  Y.applyUpdate(doc, update);
}

/**
 * Encode the full state of a room's Yjs document
 */
export function encodeStateAsUpdate(doc) {
  return Y.encodeStateAsUpdate(doc);
}

/**
 * Get the current text content of a room's document
 */
export function getDocText(roomId) {
  const doc = getYDoc(roomId);
  return doc.getText('monaco').toString();
}

/**
 * Destroy a room's Yjs document (cleanup)
 */
export function destroyDoc(roomId) {
  if (docs.has(roomId)) {
    docs.get(roomId).destroy();
    docs.delete(roomId);
    console.log(`🗑️ Destroyed Yjs doc for room ${roomId}`);
  }
}
