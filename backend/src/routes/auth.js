// src/routes/auth.js
import express from 'express';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email/password required' });

    const exists = await prisma.users.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email already exists' });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.users.create({
      data: { email, password_hash, ...(name ? { profile: { create: { display_name: name } } } : {}) },
      include: { profile: true }
    });

    res.json({ id: user.user_id.toString(), email: user.email });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'register failed' });
  }
});


// login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email/password required' });

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.user_id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      token,
      user: {
        id: user.user_id.toString(),
        email: user.email
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'login failed' });
  }
});


// get current user endpoint
router.get('/me', async (req, res) => {
  try {
    const header = req.headers.authorization || '';
    const [, token] = header.split(' ');
    if (!token) return res.status(401).json({ error: 'No token' });
    const payload = jwt.verify(token, process.env.JWT_SECRET); // { id, email }

    const me = await prisma.users.findUnique({
      where: { user_id: BigInt(payload.id) },
      select: { user_id: true, email: true, create_time: true, update_time: true }
    });
    if (!me) return res.status(404).json({ error: 'User not found' });

    res.json({
      id: me.user_id.toString(),
      email: me.email,
      create_time: me.create_time,
      update_time: me.update_time
    });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});


// logout endpoint
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

export default router;
