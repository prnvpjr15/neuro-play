const express = require('express');
const router = express.Router();
const GazeTracking = require('../models/GazeTracking');

// Simple health check
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Eye tracking API is working',
    timestamp: new Date().toISOString()
  });
});

// Start eye tracking session
router.post('/start', async (req, res) => {
  console.log('📥 POST /start received:', req.body);
  
  try {
    const { userId, therapistId, videoId, videoTitle } = req.body;
    
    // Validate required fields
    if (!userId || !videoId) {
      return res.status(400).json({
        success: false,
        error: 'userId and videoId are required'
      });
    }
    
    // Generate session ID
    const sessionId = `eye_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create the session document
    const sessionDoc = {
      sessionId: sessionId,
      userId: String(userId), // Force string
      videoId: String(videoId), // Force string
      videoTitle: videoTitle || 'Face Analysis Recording',
      therapistId: therapistId ? String(therapistId) : undefined,
      startTime: new Date(),
      status: 'active',
      metadata: {
        createdVia: 'eye_tracking_api',
        timestamp: Date.now()
      }
    };
    
    console.log('📝 Creating session document:', sessionDoc);
    
    // Save to database
    const session = await GazeTracking.create(sessionDoc);
    
    console.log('✅ Session created:', session._id);
    
    res.json({
      success: true,
      sessionId: session.sessionId,
      message: 'Eye tracking session started successfully'
    });
    
  } catch (error) {
    console.error('❌ Error creating session:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.errors ? Object.keys(error.errors) : 'Unknown error'
    });
  }
});

// Save gaze data point
router.post('/save-gaze', async (req, res) => {
  console.log('📥 POST /save-gaze received');
  
  try {
    const { sessionId, videoId, userId, therapistId, videoTimestamp, attentionScore, gazeData } = req.body;
    
    // Validate required fields
    if (!sessionId || !userId || !videoId) {
      return res.status(400).json({
        success: false,
        error: 'sessionId, userId, and videoId are required'
      });
    }
    
    const gazeDoc = {
      sessionId: String(sessionId),
      userId: String(userId),
      videoId: String(videoId),
      videoTimestamp: videoTimestamp || 0,
      attentionScore: attentionScore || 50,
      gazePoint: gazeData?.gazePoint || { x: 0, y: 0 },
      isLookingAtScreen: gazeData?.isLookingAtScreen || true,
      blinkDetected: gazeData?.blinkDetected || false,
      emotion: gazeData?.emotion || 'neutral',
      therapistId: therapistId ? String(therapistId) : undefined,
      timestamp: new Date()
    };
    
    console.log('💾 Saving gaze data point:', {
      sessionId: gazeDoc.sessionId.substring(0, 20) + '...',
      attentionScore: gazeDoc.attentionScore,
      videoTimestamp: gazeDoc.videoTimestamp
    });
    
    const gazePoint = await GazeTracking.create(gazeDoc);
    
    res.json({
      success: true,
      gazeId: gazePoint._id,
      message: 'Gaze data saved successfully',
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('❌ Error saving gaze data:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// End eye tracking session
router.post('/end', async (req, res) => {
  console.log('📥 POST /end received:', req.body);
  
  try {
    const { sessionId, userId, videoId, duration, completionPercentage, metadata } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'sessionId is required'
      });
    }
    
    // Update the session
    const update = {
      endTime: new Date(),
      status: 'completed',
      duration: duration || 0,
      completionPercentage: completionPercentage || 100,
      metadata: {
        ...metadata,
        endedAt: Date.now()
      }
    };
    
    // Find and update the session
    const result = await GazeTracking.findOneAndUpdate(
      { sessionId: String(sessionId) },
      update,
      { new: true }
    );
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    console.log('✅ Session ended:', sessionId);
    
    res.json({
      success: true,
      message: 'Eye tracking session ended successfully',
      sessionId: result.sessionId,
      duration: result.duration
    });
    
  } catch (error) {
    console.error('❌ Error ending session:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test endpoint to verify schema
router.get('/schema-test', async (req, res) => {
  try {
    // Create a test document with string IDs
    const testDoc = new GazeTracking({
      sessionId: 'test_session_string_123',
      userId: 'test_user_string_456',
      videoId: 'video_session_test_789',
      therapistId: 'test_therapist_string_999',
      videoTitle: 'Schema Test Video',
      attentionScore: 75,
      videoTimestamp: 0
    });
    
    await testDoc.save();
    
    // Verify it was saved
    const savedDoc = await GazeTracking.findOne({ sessionId: 'test_session_string_123' });
    
    res.json({
      success: true,
      message: 'Schema test successful',
      testDocument: {
        id: savedDoc._id,
        sessionId: savedDoc.sessionId,
        userId: savedDoc.userId,
        videoId: savedDoc.videoId,
        therapistId: savedDoc.therapistId,
        types: {
          sessionId: typeof savedDoc.sessionId,
          userId: typeof savedDoc.userId,
          videoId: typeof savedDoc.videoId,
          therapistId: typeof savedDoc.therapistId
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;