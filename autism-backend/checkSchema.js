const mongoose = require('mongoose');
require('dotenv').config();

async function checkSchema() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Import the model
    const GazeTracking = require('./models/GazeTracking');
    
    console.log('\n📋 Current Schema Paths:');
    console.log('=======================');
    
    // Check videoId type
    const videoIdPath = GazeTracking.schema.path('videoId');
    console.log('videoId type:', videoIdPath?.instance || 'Not found');
    console.log('videoId options:', videoIdPath?.options);
    
    // Check sessionId type
    const sessionIdPath = GazeTracking.schema.path('sessionId');
    console.log('\nsessionId type:', sessionIdPath?.instance || 'Not found');
    console.log('sessionId options:', sessionIdPath?.options);
    
    // Check therapistId type
    const therapistIdPath = GazeTracking.schema.path('therapistId');
    console.log('\ntherapistId type:', therapistIdPath?.instance || 'Not found');
    console.log('therapistId options:', therapistIdPath?.options);
    
    console.log('\n🔍 Full schema tree:');
    console.log(JSON.stringify(GazeTracking.schema.tree, null, 2));
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSchema();