const mongoose = require('mongoose');

// Force delete any existing model to avoid caching
if (mongoose.models.GazeTracking) {
  delete mongoose.models.GazeTracking;
  console.log('🗑️ Deleted cached GazeTracking model');
}

const gazeTrackingSchema = new mongoose.Schema({
  // === STRING IDs ===
  sessionId: {
    type: String,
    required: [true, 'sessionId is required'],
    index: true
  },
  
  userId: {
    type: String, // CHANGED: String, not ObjectId
    required: [true, 'userId is required'],
    index: true
  },
  
  videoId: {
    type: String, // CHANGED: String, not ObjectId
    required: [true, 'videoId is required'],
    index: true
  },
  
  therapistId: {
    type: String, // CHANGED: String, not ObjectId
    index: true
  },
  
  // === Tracking Data ===
  videoTitle: String,
  videoTimestamp: Number,
  
  attentionScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  
  gazePoint: {
    x: Number,
    y: Number
  },
  
  isLookingAtScreen: {
    type: Boolean,
    default: true
  },
  
  blinkDetected: Boolean,
  
  emotion: {
    type: String,
    enum: ['neutral', 'happy', 'sad', 'angry', 'surprised', 'fearful', 'confused', 'focused'],
    default: 'neutral'
  },
  
  // === Session Metadata ===
  startTime: {
    type: Date,
    default: Date.now
  },
  
  endTime: Date,
  
  duration: Number,
  
  completionPercentage: Number,
  
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'abandoned'],
    default: 'active'
  },
  
  // === Additional Info ===
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
  
}, {
  timestamps: true,
  // Important: Disable version key and strict mode during transition
  versionKey: false,
  strict: false
});

// Create indexes
gazeTrackingSchema.index({ userId: 1, createdAt: -1 });
gazeTrackingSchema.index({ therapistId: 1, createdAt: -1 });
gazeTrackingSchema.index({ sessionId: 1, videoTimestamp: 1 });
gazeTrackingSchema.index({ videoId: 1, createdAt: -1 });

// Create the model
const GazeTracking = mongoose.model('GazeTracking', gazeTrackingSchema);

// Verify the schema
console.log('✅ GazeTracking Model Created');
console.log('📋 Schema verification:');
console.log('  sessionId type:', gazeTrackingSchema.path('sessionId').instance);
console.log('  videoId type:', gazeTrackingSchema.path('videoId').instance);
console.log('  userId type:', gazeTrackingSchema.path('userId').instance);
console.log('  therapistId type:', gazeTrackingSchema.path('therapistId').instance);

module.exports = GazeTracking;