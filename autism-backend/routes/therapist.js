// server/routes/therapist.js
const express = require('express');
const router = express.Router();
const GameAnalytics = require('../models/GameAnalytics');
const FaceCapture = require('../models/FaceCapture');
const User = require('../models/User');
const SessionVideo = require('../models/SessionVideo'); // You need this model

// Get all patients for a therapist
router.get('/patients/:therapistId', async (req, res) => {
  try {
    // In real app, you'd have a TherapistPatient relationship
    // For now, return all students as potential patients
    const patients = await User.find({ role: 'student' })
      .select('name email age lastLogin isActive')
      .sort({ lastLogin: -1 });
    
    // Add mock parent info for demo
    const enhancedPatients = patients.map(patient => ({
      ...patient.toObject(),
      parentName: `Parent of ${patient.name}`,
      parentEmail: `${patient.email.replace('@', '.parent@')}`,
      parentPhone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      diagnosis: 'Autism Spectrum Disorder',
      notes: 'Regular therapy sessions, responds well to visual cues',
      level: Math.floor(Math.random() * 5) + 1
    }));
    
    res.json({ patients: enhancedPatients });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new patient
router.post('/patients', async (req, res) => {
  try {
    const { name, age, parentName, parentEmail, parentPhone, diagnosis, therapistId } = req.body;
    
    // Create user account for patient
    const newPatient = new User({
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@neuroplay.com`,
      password: 'default123', // Temporary password
      role: 'student',
      age: parseInt(age),
      therapistId: therapistId,
      status: 'active'
    });
    
    await newPatient.save();
    
    // Store patient details in another collection
    const patientDetails = {
      patientId: newPatient._id,
      therapistId,
      parentName,
      parentEmail,
      parentPhone,
      diagnosis,
      notes: '',
      createdAt: new Date()
    };
    
    res.json({ 
      success: true, 
      patient: {
        _id: newPatient._id,
        name,
        age,
        parentName,
        parentEmail,
        parentPhone,
        diagnosis
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get game analytics for therapist's patients
router.get('/analytics/:therapistId', async (req, res) => {
  try {
    // Get all patients of this therapist
    const patients = await User.find({ therapistId: req.params.therapistId });
    const patientIds = patients.map(p => p._id);
    
    const analytics = await GameAnalytics.find({ 
      userId: { $in: patientIds } 
    }).sort({ createdAt: -1 });
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages for therapist
router.get('/messages/:therapistId', async (req, res) => {
  try {
    // Mock messages for now
    const messages = [
      {
        id: 1,
        from: 'Parent of Alex',
        subject: 'Progress update request',
        message: 'Could we schedule a meeting to discuss recent progress?',
        date: new Date(),
        read: false
      },
      {
        id: 2,
        from: 'Parent of Sarah',
        subject: 'Therapy session feedback',
        message: 'Sarah really enjoyed the emotion matching game this week!',
        date: new Date(Date.now() - 86400000),
        read: true
      }
    ];
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Schedule video conference
router.post('/schedule-conference', async (req, res) => {
  try {
    const { therapistId, patientId, patientName, parentEmail, scheduledTime } = req.body;
    
    // Generate unique conference link
    const conferenceId = Math.random().toString(36).substring(2, 15);
    const conferenceLink = `https://meet.neuroplay.com/${conferenceId}`;
    
    // In real app, send email to parent
    console.log(`Conference scheduled for ${patientName}`);
    console.log(`Link: ${conferenceLink}`);
    console.log(`Parent email: ${parentEmail}`);
    
    // Store conference details in database
    // await Conference.create({ conferenceId, therapistId, patientId, scheduledTime, link: conferenceLink });
    
    res.json({ 
      success: true, 
      conferenceLink,
      scheduledTime: scheduledTime || new Date(Date.now() + 24 * 60 * 60 * 1000),
      message: 'Conference scheduled and invitation sent to parent'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message to parent
router.post('/messages', async (req, res) => {
  try {
    const { therapistId, patientId, message, type } = req.body;
    
    // Store message in database
    // await Message.create({ therapistId, patientId, message, type, sentAt: new Date() });
    
    // In real app, send email/SMS to parent
    console.log(`Message sent to parent of patient ${patientId}: ${message}`);
    
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;