const express = require('express');
const router = express.Router();
const GameSession = require('../models/GameSession');
const User = require('../models/User');

// --- 1. SAVE GAME SESSION ---
// --- 1. SAVE GAME SESSION ---
router.post('/save', async (req, res) => {
  console.log("📥 Received game session save request:", req.body);
  
  const { userId, gameId, gameName, score, accuracy, duration, levelReached, metadata } = req.body;

  // Input validation
  if (!userId || !gameId || !gameName || score === undefined) {
    console.error("❌ Missing required fields:", { userId, gameId, gameName, score });
    return res.status(400).json({ 
      error: 'Missing required fields: userId, gameId, gameName, score' 
    });
  }

  try {
    console.log("🔍 Checking if user exists:", userId);
    
    // Check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      console.error("❌ User not found:", userId);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log("✅ User found:", userExists.name);

    const newSession = new GameSession({
      userId,
      gameId,
      gameName,
      score: Math.round(score),
      accuracy: accuracy || 0,
      duration: duration || 0,
      levelReached: levelReached || 1,
      metadata: metadata || {},
      playedAt: new Date()
    });

    console.log("💾 Saving to database:", {
      userId,
      gameId,
      gameName,
      score: Math.round(score)
    });

    const savedSession = await newSession.save();
    console.log("✅ Session saved to database with ID:", savedSession._id);

    // Update user's total points
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { 
        $inc: { totalPoints: Math.round(score) },
        $set: { lastActive: new Date() }
      },
      { new: true }
    );
    
    console.log("✅ User points updated:", updatedUser.totalPoints);
    
    res.status(201).json({ 
      message: 'Session saved successfully', 
      session: savedSession 
    });

  } catch (err) {
    console.error('❌ Error saving game session:', err);
    res.status(500).json({ 
      error: 'Failed to save game session', 
      details: err.message 
    });
  }
});

// --- 2. GET USER STATS (Aggregated) ---
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const sessions = await GameSession.find({ userId }).sort({ playedAt: 1 });

    const gameStats = {};
    const historyData = [];

    sessions.forEach(session => {
      if (!gameStats[session.gameId]) {
        gameStats[session.gameId] = {
          totalPlays: 0,
          highScore: 0,
          totalScore: 0
        };
      }

      const g = gameStats[session.gameId];
      g.totalPlays += 1;
      g.highScore = Math.max(g.highScore, session.score);
      g.totalScore += session.score;

      const day = new Date(session.playedAt)
        .toLocaleDateString('en-US', { weekday: 'short' });

      historyData.push({
        day,
        score: session.score,
        game: session.gameName
      });
    });

    res.json({ gameStats, historyData });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 3. CREATE MOCK DATA (For Demo User) ---
router.post('/seed/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    await GameSession.deleteMany({ userId });

    const games = [
      { id: 1, name: "Emotion Match" },
      { id: 2, name: "Reaction Test" },
      { id: 3, name: "Face Mimic" }
    ];

    const mockData = [];

    for (let i = 0; i < 10; i++) {
      const g = games[Math.floor(Math.random() * games.length)];

      mockData.push({
        userId,
        gameId: g.id,
        gameName: g.name,
        score: Math.floor(Math.random() * 50) + 50,
        accuracy: Math.floor(Math.random() * 30) + 70,
        playedAt: new Date(Date.now() - (10 - i) * 86400000)
      });
    }

    await GameSession.insertMany(mockData);

    res.json({ message: "Mock data created for user!" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
