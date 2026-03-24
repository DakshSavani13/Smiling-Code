import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  code: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: 'javascript',
  },
  output: {
    type: String,
    default: '',
  },
}, { timestamps: true });

export default mongoose.model('Session', sessionSchema);
