require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const GameSession = require('./models/GameSession');
  const result = await GameSession.updateMany({}, {
    $set: { therapistId: '69d9941c138abf6cb83d309d' }
  });
  console.log("Migration complete:", result);
  process.exit(0);
});
