const FaceData = require('../models/FaceCapture');
const fs = require('fs');

async function cleanupOldFaceData(daysToKeep = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  try {
    const oldData = await FaceData.find({
      timestamp: { $lt: cutoffDate }
    });

    for (const data of oldData) {
      // Delete file
      if (fs.existsSync(data.imagePath)) {
        fs.unlinkSync(data.imagePath);
      }
      // Delete database record
      await FaceData.findByIdAndDelete(data._id);
    }

    console.log(`Cleaned up ${oldData.length} old face data records`);
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// Run cleanup daily
setInterval(() => {
  cleanupOldFaceData(30);
}, 24 * 60 * 60 * 1000);

module.exports = { cleanupOldFaceData };