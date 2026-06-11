const express = require('express');
const router = express.Router();
const GameSession = require('../models/GameSession');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const gameplayStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join('uploads', 'game-sessions');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const gameId = req.body.gameId || 'game';
    const userId = req.body.userId || 'unknown';
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `${Date.now()}_${userId}_${gameId}${ext}`);
  }
});

const gameplayUpload = multer({
  storage: gameplayStorage,
  limits: { fileSize: 150 * 1024 * 1024 }
});

router.post('/upload-game-video', gameplayUpload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No video uploaded' });

    const normalizedPath = req.file.path.replace(/\\/g, '/');
    const publicPath = `/${normalizedPath}`;

    res.json({
      success: true,
      gameVideoUrl: publicPath,
      gameVideoFilename: req.file.filename,
    });
  } catch (err) {
    console.error('❌ Game video upload error:', err);
    res.status(500).json({ error: 'Failed to upload game video' });
  }
});

// --- 1. SAVE GAME SESSION ---
// --- 1. SAVE GAME SESSION ---
router.post('/save', async (req, res) => {
  console.log("📥 Received game session save request:", req.body);
  
  const { userId, therapistId, username, gameId, gameName, score, accuracy, duration, levelReached, metadata, gameVideoUrl, gameVideoFilename, faceBlurred } = req.body;

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
      therapistId,
      username,
      gameId,
      gameName,
      score: Math.round(score),
      accuracy: typeof accuracy === 'number' ? Math.round(accuracy) : undefined,
      duration: typeof duration === 'number' ? duration : undefined,
      levelReached: levelReached || 1,
      metadata: metadata || {},
      gameVideoUrl: gameVideoUrl || null,
      gameVideoFilename: gameVideoFilename || null,
      faceBlurred: faceBlurred === true || faceBlurred === "true",
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

    // Update user's last active timestamp
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { lastActive: new Date() } },
      { new: true }
    );
    
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
        game: session.gameName,
        metadata: session.metadata
      });
    });

    res.status(200).json({
      gameStats,
      historyData,
      sessions
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 2.5 GET THERAPIST GAMES ---
router.get('/therapist/:therapistId', async (req, res) => {
  try {
    const { therapistId } = req.params;

    // Filter by therapistId to ensure privacy and data segregation.
    // Fallback to empty if therapistId is missing to prevent global leak.
    const query = therapistId && therapistId !== 'Therapist_Main'
      ? { therapistId }
      : {};

    const sessions = await GameSession.find(query)
      .sort({ playedAt: -1 })
      .limit(200)
      .lean();

    // Collect unique userIds that need username lookup
    const userIdsNeedingLookup = [...new Set(
      sessions
        .filter(s => !s.username && s.userId)
        .map(s => String(s.userId))
    )];

    // Batch-lookup usernames
    let usernameMap = {};
    if (userIdsNeedingLookup.length > 0) {
      try {
        const users = await User.find(
          { _id: { $in: userIdsNeedingLookup } },
          { username: 1 }
        ).lean();
        users.forEach(u => { usernameMap[String(u._id)] = u.username; });
      } catch (lookupErr) {
        console.error('Username lookup error (non-fatal):', lookupErr.message);
      }
    }

    // Enrich sessions with username
    const enriched = sessions.map(s => ({
      ...s,
      userId: String(s.userId),
      username: s.username || usernameMap[String(s.userId)] || String(s.userId),
    }));

    console.log(`🎮 Found ${enriched.length} game sessions for therapist ${therapistId}`);
    res.json(enriched);
  } catch (err) {
    console.error('❌ Therapist games fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- 2.6 SAVE THERAPIST GAME REVIEW ---
router.post('/review/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { therapistNotes, reviewed, reviewedBy, reviewedAt } = req.body;

    const updated = await GameSession.findByIdAndUpdate(
      sessionId,
      {
        $set: {
          therapistNotes: therapistNotes || '',
          reviewed: reviewed || false,
          reviewedBy: reviewedBy || null,
          reviewedAt: reviewedAt ? new Date(reviewedAt) : new Date(),
        }
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Game session not found' });

    console.log(`✅ Game session ${sessionId} marked as reviewed by ${reviewedBy}`);
    res.json({ success: true, message: 'Game review saved', session: updated });
  } catch (err) {
    console.error('❌ Game review save error:', err);
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
