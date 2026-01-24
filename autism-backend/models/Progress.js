const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  childId: { type: mongoose.Schema.Types.ObjectId, ref: 'Child' }, // Optional, for parent tracking
  skillType: { type: String, required: true }, // 'social-skills', 'cognitive-skills', 'motor-skills', etc.
  weekNumber: { type: Number, required: true },
  score: { type: Number, required: true }, // 0-100
  assessmentDate: { type: Date, required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for better query performance
progressSchema.index({ userId: 1, skillType: 1, weekNumber: 1 });
progressSchema.index({ childId: 1, skillType: 1, weekNumber: 1 });

module.exports = mongoose.model('Progress', progressSchema);
