const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  thumbnail: {
    type: String, // path to thumbnail image
    default: ''
  },
  category: {
    type: String,
    enum: ['therapy_session', 'progress_tracking', 'educational', 'exercise', 'other'],
    default: 'other'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPrivate: {
    type: Boolean,
    default: true
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
videoSchema.index({ userId: 1, uploadedAt: -1 });
videoSchema.index({ category: 1 });
videoSchema.index({ tags: 1 });

module.exports = mongoose.model('Video', videoSchema);