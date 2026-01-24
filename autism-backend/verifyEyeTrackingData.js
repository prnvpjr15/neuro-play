const mongoose = require('mongoose');
require('dotenv').config();

async function verifyData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const GazeTracking = require('./models/GazeTracking');
    
    console.log('\n📊 Eye Tracking Data Report');
    console.log('==========================\n');
    
    // Count total records
    const total = await GazeTracking.countDocuments();
    console.log(`Total eye tracking records: ${total}`);
    
    if (total === 0) {
      console.log('❌ No eye tracking data found!');
      console.log('Check if the save-gaze API is being called.');
      return;
    }
    
    // Get recent sessions
    const recentSessions = await GazeTracking.aggregate([
      {
        $group: {
          _id: "$sessionId",
          userId: { $first: "$userId" },
          videoId: { $first: "$videoId" },
          therapistId: { $first: "$therapistId" },
          count: { $sum: 1 },
          avgAttention: { $avg: "$attentionScore" },
          firstRecord: { $min: "$createdAt" },
          lastRecord: { $max: "$createdAt" }
        }
      },
      { $sort: { lastRecord: -1 } },
      { $limit: 5 }
    ]);
    
    console.log('\n🔍 Recent Eye Tracking Sessions:');
    console.log('==============================\n');
    
    recentSessions.forEach((session, index) => {
      console.log(`${index + 1}. Session: ${session._id}`);
      console.log(`   User: ${session.userId}`);
      console.log(`   Video: ${session.videoId}`);
      console.log(`   Therapist: ${session.therapistId}`);
      console.log(`   Data Points: ${session.count}`);
      console.log(`   Avg Attention: ${session.avgAttention.toFixed(1)}%`);
      console.log(`   Duration: ${session.firstRecord} to ${session.lastRecord}`);
      console.log('');
    });
    
    // Check for specific session from logs
    const targetSession = await GazeTracking.findOne({ 
      sessionId: "eye_1769182248355_81gztvwao" 
    });
    
    if (targetSession) {
      console.log('🎯 Found target session!');
      console.log(JSON.stringify(targetSession.toObject(), null, 2));
    } else {
      console.log('❌ Target session not found');
      
      // Show what sessions do exist
      const anySessions = await GazeTracking.find().limit(3);
      console.log('\n📋 Example of existing records:');
      anySessions.forEach(doc => {
        console.log(`- ${doc.sessionId} (${doc.createdAt})`);
      });
    }
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyData();