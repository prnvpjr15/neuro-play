require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const analyticsRoutes = require('./routes/analytics');
const faceDataRoutes = require('./routes/faceData');
const faceCaptureRoutes = require('./routes/faceCaptureRoutes');
const videoRoutes = require('./routes/videoRoutes');
const videoEyeTrackingRoutes = require('./routes/videoEyeTracking');

const app = express();

// 1. CORS Configuration: Allow only your Frontend on Port 3000
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"], // Support both localhost formats
  credentials: true
}));

// 2. Middleware to parse JSON bodies
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// 4. Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
// app.use('/api/face-data', faceDataRoutes);
app.use('/api/facecapture', faceCaptureRoutes);
app.use('/api/video-eye-tracking', videoEyeTrackingRoutes);
app.use('/api/videos', videoRoutes);


// Test Route
app.get('/api/protected', (req, res) => {
  res.json({ message: 'This is a protected route from the backend!' });
});

// 5. Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));