const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Video = require('../models/Video');
const jwt = require('jsonwebtoken');
// const auth = require('../middleware/auth'); // Uncomment if you have auth middleware

// --- Multer Storage Setup ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store uploads in the autism-backend/uploads directory (matches static serving)
    const uploadPath = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// @route   GET /api/videos
router.get('/', async (req, res) => {
  try {
    const { category, search, sort } = req.query;

    // Try to get the requesting user's ID from the auth token
    let requestingUserId = null;
    if (req.headers && req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        requestingUserId = decoded.id || decoded._id || null;
      } catch (e) {
        // Token invalid — show public videos only
      }
    }

    // Show public videos + the user's own private videos
    let query;
    if (requestingUserId) {
      query = { $or: [{ isPrivate: false }, { userId: requestingUserId }] };
    } else {
      query = { isPrivate: false };
    }

    if (category && category !== 'all') query.category = category;
    if (search) {
      const searchCondition = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
      query = { $and: [query, searchCondition] };
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'name_asc') sortOption = { title: 1 };

    const videos = await Video.find(query).sort(sortOption);

    res.json({
      success: true,
      count: videos.length,
      pagination: { totalPages: 1 },
      videos
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route   GET /api/videos/:id
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    res.json({ success: true, video });
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route   POST /api/videos/upload
router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No video file uploaded' });

    const { title, description, category, tags, isPrivate } = req.body;
    let { userId } = req.body || {};

    // If userId not provided, try to extract from Authorization bearer token
    if (!userId && req.headers && req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        userId = decoded.id || decoded._id || null;
      } catch (e) {
        console.warn('Could not decode upload JWT token:', e.message);
      }
    }

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId for upload' });
    }

    const newVideo = await Video.create({
      title: title || req.file.originalname,
      description,
      category: category || 'other',
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      filePath: req.file.path,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimetype: req.file.mimetype,
      isPrivate: isPrivate === 'true' || isPrivate === true,
      userId: userId
    });

    res.status(201).json({ success: true, video: newVideo });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Server Error during upload' });
  }
});

// @route   DELETE /api/videos/:id
router.delete('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    if (fs.existsSync(video.filePath)) {
      fs.unlinkSync(video.filePath);
    }

    await Video.deleteOne({ _id: req.params.id });
    res.json({ success: true, message: 'Video deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route   PUT /api/videos/:id
router.put('/:id', async (req, res) => {
  try {
    const { title, description, category, tags, isPrivate } = req.body;
    let updateData = { title, description, category, isPrivate };

    if (tags) {
      updateData.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    }

    const video = await Video.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!video) return res.status(404).json({ error: 'Video not found' });
    res.json({ success: true, video });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;