import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const router = Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id, username: user.username, avatarColor: user.avatarColor },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarColor: user.avatarColor,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, avatarColor: user.avatarColor },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarColor: user.avatarColor,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  console.log('Received /api/auth/google request');
  try {
    const { token } = req.body;
    if (!token) {
      console.log('No token provided');
      return res.status(400).json({ message: 'Token is required' });
    }

    console.log('Verifying token with audience:', process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    console.log('Token verified successfully');
    
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;
    console.log('Payload extracted:', { email, name, googleId });

    let user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('Generating username for new user');
      // Auto-generate username from Google name
      let baseUsername = (name || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'user';
      let username = baseUsername;
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      console.log('Creating new user in DB:', username);
      user = await User.create({
        username,
        email,
        googleId,
      });
      console.log('User created');
    } else if (!user.googleId) {
      console.log('Linking Google ID to existing user');
      user.googleId = googleId;
      await user.save();
      console.log('User saved');
    }

    console.log('Signing JWT');
    const jwtToken = jwt.sign(
      { id: user._id, username: user.username, avatarColor: user.avatarColor },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log('Returning response');

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarColor: user.avatarColor,
      },
    });
  } catch (err) {
    console.error('Google login error details:', err.message, err.stack);
    res.status(500).json({ message: 'Google authentication failed' });
  }
});

export default router;
