// src/api/profile.js
import express from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
BigInt.prototype.toJSON = function () {
  return this.toString();
};

// GET /profile/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const profile = await prisma.user_profiles.findUnique({
      where: { user_id: BigInt(req.user.id) }
    });
    res.json(profile);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed to fetch profile' });
  }
});

// PUT /profile
router.put('/', requireAuth, async (req, res) => {
  try {
    const { display_name, bio, role, avatar_url } = req.body;
    const userId = BigInt(req.user.id);
    const updated = await prisma.user_profiles.upsert({
      where: { user_id: userId },
      update: { display_name, bio, role, avatar_url },
      create: {
        user_id: userId,
        display_name,
        bio,
        role,
        avatar_url
      },
    });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'failed to update profile', detail: e.message });
  }
});

export default router;
