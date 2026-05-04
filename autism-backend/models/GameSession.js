const mongoose = require('mongoose');

const GameSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  therapistId: {
    type: String,
    required: false
  },
  username: {
    type: String,
    required: false
  },
  gameId: {
    type: Number, // 1: Emotion, 2: Pattern, 3: Face, 4: Imitation, 5: Sound
    required: true
  },
  gameName: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  accuracy: {
    type: Number,
    required: false
  },
  duration: {
    type: Number, // in seconds
    required: false
  },
  levelReached: {
    type: Number,
    default: 1
  },
  metadata: {
    type: Object,
    default: {}
  },
  gameVideoUrl: {
    type: String,
    default: null
  },
  gameVideoFilename: {
    type: String,
    default: null
  },
  faceBlurred: {
    type: Boolean,
    default: false
  },
  playedAt: {
    type: Date,
    default: Date.now
  },
  // Therapist review fields
  reviewed: {
    type: Boolean,
    default: false
  },
  therapistNotes: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: String,
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('GameSession', GameSessionSchema);