const mongoose = require('mongoose');

const GameSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
    default: 0
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  levelReached: {
    type: Number,
    default: 1
  },
  metadata: {
    type: Object, // Flexible field for game-specific data (e.g., "emotions_missed": ["sad"])
    default: {}
  },
  playedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GameSession', GameSessionSchema);