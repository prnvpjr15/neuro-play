const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const GameSession = require('../models/GameSession');

// GET /api/dashboard/sessions - list sessions (simple original behavior)
router.get('/sessions', auth, async (req, res) => {
  try {
    const sessions = await GameSession.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(20);
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/dashboard/session - save a game session
router.post('/session', auth, async (req, res) => {
  try {
    const session = new GameSession({
      user: req.user.id,
      game: req.body.game,
      score: req.body.score,
      duration: req.body.duration
    });
    await session.save();
    res.json({ message: 'Session saved', session });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
