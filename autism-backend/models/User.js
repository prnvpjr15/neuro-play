// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true, minlength: 3, maxlength: 30 },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['parent', 'therapist', 'user', 'admin'], required: true },

  faceDescriptor: {
  type: [Number],   // stores 128-d embedding values
  default: null
},

  resetToken: String,
  resetTokenExpiry: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add middleware to update timestamp
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
