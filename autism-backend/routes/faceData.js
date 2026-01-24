const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FaceData = require('../models/FaceCapture');

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/face_data';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.params.userId;
    const userDir = path.join(uploadDir, userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    cb(null, `${timestamp}_${randomString}_${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// POST endpoint to save face data
router.post('/upload/:userId', upload.single('faceImage'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { emotion, confidence, timestamp, sessionId } = req.body;
    
    const faceData = new FaceData({
      userId,
      imagePath: req.file.path,
      filename: req.file.filename,
      emotion: emotion || 'neutral',
      confidence: confidence || 0,
      timestamp: timestamp || new Date(),
      sessionId: sessionId || 'default'
    });

    await faceData.save();
    
    res.status(201).json({
      success: true,
      message: 'Face data saved successfully',
      data: {
        id: faceData._id,
        filename: faceData.filename,
        path: faceData.imagePath,
        emotion: faceData.emotion,
        timestamp: faceData.timestamp
      }
    });
  } catch (error) {
    console.error('Error saving face data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save face data'
    });
  }
});

// GET endpoint to fetch user's face data
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, emotion } = req.query;
    
    let query = { userId };
    
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (emotion) {
      query.emotion = emotion;
    }
    
    const faceData = await FaceData.find(query)
      .sort({ timestamp: -1 })
      .limit(100);
    
    res.json({
      success: true,
      count: faceData.length,
      data: faceData
    });
  } catch (error) {
    console.error('Error fetching face data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch face data'
    });
  }
});

// DELETE endpoint to remove face data
router.delete('/:faceDataId', async (req, res) => {
  try {
    const { faceDataId } = req.params;
    const faceData = await FaceData.findById(faceDataId);
    
    if (!faceData) {
      return res.status(404).json({
        success: false,
        error: 'Face data not found'
      });
    }
    
    // Delete file from disk
    if (fs.existsSync(faceData.imagePath)) {
      fs.unlinkSync(faceData.imagePath);
    }
    
    // Delete from database
    await FaceData.findByIdAndDelete(faceDataId);
    
    res.json({
      success: true,
      message: 'Face data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting face data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete face data'
    });
  }
});

module.exports = router;