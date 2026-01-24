const mongoose = require('mongoose');
require('dotenv').config();

async function detailedReport() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const GazeTracking = require('./models/GazeTracking');
    
    // Get ALL records (not just sessions)
    const allRecords = await GazeTracking.find()
      .sort({ createdAt: -1 })
      .limit(50);
    
    console.log('📊 DETAILED EYE TRACKING REPORT');
    console.log('================================\n');
    
    console.log(`Total records in database: ${allRecords.length}`);
    
    // Group by sessionId
    const sessions = {};
    allRecords.forEach(record => {
      if (!sessions[record.sessionId]) {
        sessions[record.sessionId] = {
          sessionId: record.sessionId,
          userId: record.userId,
          videoId: record.videoId,
          therapistId: record.therapistId,
          records: [],
          startTime: record.createdAt,
          endTime: record.createdAt
        };
      }
      sessions[record.sessionId].records.push(record);
      if (record.createdAt < sessions[record.sessionId].startTime) {
        sessions[record.sessionId].startTime = record.createdAt;
      }
      if (record.createdAt > sessions[record.sessionId].endTime) {
        sessions[record.sessionId].endTime = record.createdAt;
      }
    });
    
    console.log(`\n📋 Found ${Object.keys(sessions).length} unique sessions:\n`);
    
    Object.values(sessions).forEach((session, idx) => {
      const duration = (session.endTime - session.startTime) / 1000;
      const avgAttention = session.records.reduce((sum, r) => sum + (r.attentionScore || 50), 0) / session.records.length;
      
      console.log(`${idx + 1}. ${session.sessionId}`);
      console.log(`   👤 User: ${session.userId}`);
      console.log(`   🎬 Video: ${session.videoId?.substring(0, 20)}...`);
      console.log(`   👨‍⚕️ Therapist: ${session.therapistId}`);
      console.log(`   📊 Records: ${session.records.length}`);
      console.log(`   ⏱️ Duration: ${duration.toFixed(1)} seconds`);
      console.log(`   🎯 Avg Attention: ${avgAttention.toFixed(1)}%`);
      console.log(`   📅 ${session.startTime.toLocaleString()}`);
      console.log('');
    });
    
    // Check what types of records we have
    console.log('🔍 Record Types Analysis:');
    const recordTypes = allRecords.reduce((acc, record) => {
      const type = record.videoTitle ? 'Session Start' : 'Gaze Data';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(recordTypes).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} records`);
    });
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

detailedReport();