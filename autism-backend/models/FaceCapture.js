const mongoose = require("mongoose");

const faceCaptureSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },

  // Add type field to distinguish between image and video
  type: {
    type: String,
    enum: ["image", "video"],
    default: "image",
  },
  therapistId: {
    type: String,
    required: false,
  },

  // For images
  imagePath: String,
  filename: String,

  // For videos
  videoPath: String,
  videoFilename: String,
  thumbnailPath: String,
  duration: Number, // in seconds

  // Video metadata
  startTime: Date,
  endTime: Date,
  framesPerSecond: Number,
  resolution: String,

  // Common fields
  emotion: String,
  confidence: Number,
  sessionId: String,

  gazeData: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  gazeSummary: {
    avgAttentionScore: { type: Number, default: 0 },
    faceDetectionRate: { type: Number, default: 0 },
    engagementLevel: { type: String, default: "Low" },
  },
  // Privacy — whether the video was recorded with face blur enabled
  faceBlurred: {
    type: Boolean,
    default: false,
  },
  // Therapist analysis
  therapistNotes: String,
  reviewed: {
    type: Boolean,
    default: false,
  },
  reviewedBy: String,
  reviewedAt: Date,

  // Highlights/Bookmarks
  highlights: [
    {
      timestamp: Number,
      emotion: String,
      confidence: Number,
      notes: String,
      bookmark: Boolean,
    },
  ],

  timestamp: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("FaceCapture", faceCaptureSchema);
