const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalSessions: { type: Number, default: 0 },
  lastSession: { type: Date, default: Date.now },
  progressScore: { type: Number, default: 0 },
  skillsImproving: [{ type: String }],
  areasNeedingSupport: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

childSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Child', childSchema);
