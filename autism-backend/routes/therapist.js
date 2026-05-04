// server/routes/therapist.js
const express = require('express');
const router = express.Router();
const GameAnalytics = require('../models/GameAnalytics');
const FaceCapture = require('../models/FaceCapture');
const User = require('../models/User');
const SessionVideo = require('../models/SessionVideo'); // You need this model
const GameSession = require('../models/GameSession');

// Get all patients for a therapist
router.get('/patients/:therapistId', async (req, res) => {
  try {
    // In real app, you'd have a TherapistPatient relationship
    // For now, return all students as potential patients
    const patients = await User.find({ role: 'student' })
      .select('name email age lastLogin isActive')
      .sort({ lastLogin: -1 });
    
    // Add mock parent info for demo
    const enhancedPatients = patients.map(patient => ({
      ...patient.toObject(),
      parentName: `Parent of ${patient.name}`,
      parentEmail: `${patient.email.replace('@', '.parent@')}`,
      parentPhone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      diagnosis: 'Autism Spectrum Disorder',
      notes: 'Regular therapy sessions, responds well to visual cues',
      level: Math.floor(Math.random() * 5) + 1
    }));
    
    res.json({ patients: enhancedPatients });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new patient
router.post('/patients', async (req, res) => {
  try {
    const { name, age, parentName, parentEmail, parentPhone, diagnosis, therapistId } = req.body;
    
    // Create user account for patient
    const newPatient = new User({
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@neuroplay.com`,
      password: 'default123', // Temporary password
      role: 'student',
      age: parseInt(age),
      therapistId: therapistId,
      status: 'active'
    });
    
    await newPatient.save();
    
    // Store patient details in another collection
    const patientDetails = {
      patientId: newPatient._id,
      therapistId,
      parentName,
      parentEmail,
      parentPhone,
      diagnosis,
      notes: '',
      createdAt: new Date()
    };
    
    res.json({ 
      success: true, 
      patient: {
        _id: newPatient._id,
        name,
        age,
        parentName,
        parentEmail,
        parentPhone,
        diagnosis
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get game analytics for therapist's patients
router.get('/analytics/:therapistId', async (req, res) => {
  try {
    // Get all patients of this therapist
    const patients = await User.find({ therapistId: req.params.therapistId });
    const patientIds = patients.map(p => p._id);
    
    const analytics = await GameAnalytics.find({ 
      userId: { $in: patientIds } 
    }).sort({ createdAt: -1 });
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get game sessions for a specific user (for therapist dashboard)
router.get('/games/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const mongoose = require("mongoose");

    // Convert string userId to ObjectId if needed
    let userObjectId;
    try {
      userObjectId = mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : userId;
    } catch (e) {
      userObjectId = userId;
    }

    // Verify the user exists
    const user = await User.findById(userObjectId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all game sessions for this user
    const gameSessions = await GameSession.find({ userId: userObjectId })
      .sort({ playedAt: -1 })
      .limit(50); // Limit to prevent too much data

    // Group by game type for summary
    const gameStats = {};
    gameSessions.forEach(session => {
      if (!gameStats[session.gameId]) {
        gameStats[session.gameId] = {
          gameName: session.gameName,
          totalPlays: 0,
          highScore: 0,
          avgScore: 0,
          totalScore: 0,
          avgAccuracy: 0,
          totalAccuracy: 0,
          recentSessions: []
        };
      }

      const stats = gameStats[session.gameId];
      stats.totalPlays += 1;
      stats.highScore = Math.max(stats.highScore, session.score);
      stats.totalScore += session.score;
      stats.totalAccuracy += session.accuracy || 0;

      // Keep track of recent 5 sessions for each game
      if (stats.recentSessions.length < 5) {
        stats.recentSessions.push({
          score: session.score,
          accuracy: session.accuracy,
          duration: session.duration,
          levelReached: session.levelReached,
          playedAt: session.playedAt,
          metadata: session.metadata
        });
      }
    });

    // Calculate averages
    Object.keys(gameStats).forEach(gameId => {
      const stats = gameStats[gameId];
      stats.avgScore = Math.round(stats.totalScore / stats.totalPlays);
      stats.avgAccuracy = Math.round(stats.totalAccuracy / stats.totalPlays);
    });

    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email
      },
      gameStats,
      recentSessions: gameSessions.slice(0, 20), // Most recent 20 sessions
      totalSessions: gameSessions.length
    });

  } catch (error) {
    console.error('Error fetching game sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get messages for therapist
router.get('/messages/:therapistId', async (req, res) => {
  try {
    // Mock messages for now
    const messages = [
      {
        id: 1,
        from: 'Parent of Alex',
        subject: 'Progress update request',
        message: 'Could we schedule a meeting to discuss recent progress?',
        date: new Date(),
        read: false
      },
      {
        id: 2,
        from: 'Parent of Sarah',
        subject: 'Therapy session feedback',
        message: 'Sarah really enjoyed the emotion matching game this week!',
        date: new Date(Date.now() - 86400000),
        read: true
      }
    ];
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Schedule video conference
router.post('/schedule-conference', async (req, res) => {
  try {
    const { therapistId, patientId, patientName, parentEmail, scheduledTime } = req.body;
    
    // Generate unique conference link
    const conferenceId = Math.random().toString(36).substring(2, 15);
    const conferenceLink = `https://meet.neuroplay.com/${conferenceId}`;
    
    // In real app, send email to parent
    console.log(`Conference scheduled for ${patientName}`);
    console.log(`Link: ${conferenceLink}`);
    console.log(`Parent email: ${parentEmail}`);
    
    // Store conference details in database
    // await Conference.create({ conferenceId, therapistId, patientId, scheduledTime, link: conferenceLink });
    
    res.json({ 
      success: true, 
      conferenceLink,
      scheduledTime: scheduledTime || new Date(Date.now() + 24 * 60 * 60 * 1000),
      message: 'Conference scheduled and invitation sent to parent'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message to parent
router.post('/messages', async (req, res) => {
  try {
    const { therapistId, patientId, message, type } = req.body;
    
    // Store message in database
    // await Message.create({ therapistId, patientId, message, type, sentAt: new Date() });
    
    // In real app, send email/SMS to parent
    console.log(`Message sent to parent of patient ${patientId}: ${message}`);
    
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/therapist/games/all   ← Perfect for folder overview
router.get('/games/all', async (req, res) => {
  try {
    const gameSessions = await GameSession.aggregate([
      {
        $group: {
          _id: "$userId",
          totalSessions: { $sum: 1 },
          games: {
            $push: {
              gameName: "$gameName",
              score: "$score",
              accuracy: "$accuracy",
              playedAt: "$playedAt"
            }
          }
        }
      }
    ]);

    const result = {};

    for (const item of gameSessions) {
      const userId = item._id.toString();
      const gameMap = {};

      item.games.forEach(gs => {
        if (!gameMap[gs.gameName]) {
          gameMap[gs.gameName] = {
            gameName: gs.gameName,
            totalPlays: 0,
            highScore: 0,
            totalScore: 0,
            totalAccuracy: 0
          };
        }
        const g = gameMap[gs.gameName];
        g.totalPlays++;
        g.highScore = Math.max(g.highScore, gs.score);
        g.totalScore += gs.score;
        g.totalAccuracy += gs.accuracy || 0;
      });

      // Calculate averages
      Object.values(gameMap).forEach(g => {
        g.avgScore = Math.round(g.totalScore / g.totalPlays);
        g.avgAccuracy = Math.round(g.totalAccuracy / g.totalPlays);
      });

      result[userId] = {
        totalSessions: item.totalSessions,
        gameStats: gameMap,
        lastPlayed: item.games.reduce((latest, g) => 
          new Date(g.playedAt) > new Date(latest.playedAt) ? g : latest
        ).playedAt
      };
    }

    res.json(result);   // ← { "userId1": {totalSessions, gameStats, lastPlayed}, ... }

  } catch (error) {
    console.error("Failed to fetch all game data:", error);
    res.status(500).json({ error: "Failed to load game overview" });
  }
});

module.exports = router;