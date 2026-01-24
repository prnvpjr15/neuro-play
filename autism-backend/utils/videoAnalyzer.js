// utils/videoAnalyzer.js
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { Canvas, Image } = require('canvas');
const faceapi = require('face-api.js');

async function analyzeVideoEmotions(videoPath) {
  return new Promise((resolve, reject) => {
    const framesDir = path.join(__dirname, '../temp_frames');
    if (!fs.existsSync(framesDir)) {
      fs.mkdirSync(framesDir, { recursive: true });
    }

    // Extract frames from video (1 frame per second)
    ffmpeg(videoPath)
      .output(path.join(framesDir, 'frame-%04d.jpg'))
      .fps(1) // 1 frame per second
      .on('end', async () => {
        try {
          const frames = fs.readdirSync(framesDir)
            .filter(file => file.endsWith('.jpg'))
            .sort();

          const emotions = [];
          const highlights = [];

          // Load face-api models
          await faceapi.nets.tinyFaceDetector.loadFromDisk('./models');
          await faceapi.nets.faceExpressionNet.loadFromDisk('./models');

          // Analyze each frame
          for (let i = 0; i < frames.length; i++) {
            const framePath = path.join(framesDir, frames[i]);
            const img = await Canvas.loadImage(framePath);
            const canvas = Canvas.createCanvas(img.width, img.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const detections = await faceapi
              .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions())
              .withFaceExpressions();

            if (detections.length > 0) {
              const expressions = detections[0].expressions;
              const sorted = Object.entries(expressions)
                .sort((a, b) => b[1] - a[1]);

              const dominantEmotion = sorted[0][0];
              const confidence = sorted[0][1];

              emotions.push({
                timestamp: i, // seconds
                emotion: dominantEmotion,
                confidence: confidence * 100
              });

              // Add highlight for significant emotions
              if (confidence > 0.8) {
                highlights.push({
                  timestamp: i,
                  emotion: dominantEmotion,
                  confidence: Math.round(confidence * 100),
                  notes: `Strong ${dominantEmotion} detected`,
                  bookmark: confidence > 0.9
                });
              }
            }

            // Clean up frame file
            fs.unlinkSync(framePath);
          }

          // Clean up directory
          fs.rmdirSync(framesDir);

          // Calculate summary
          const emotionCounts = emotions.reduce((acc, curr) => {
            acc[curr.emotion] = (acc[curr.emotion] || 0) + 1;
            return acc;
          }, {});

          const dominantEmotion = Object.entries(emotionCounts)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

          const averageConfidence = emotions.length > 0
            ? emotions.reduce((sum, e) => sum + e.confidence, 0) / emotions.length
            : 0;

          resolve({
            dominantEmotion,
            averageConfidence,
            emotionTimeline: emotions,
            highlights,
            totalFramesAnalyzed: emotions.length
          });

        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject)
      .run();
  });
}

module.exports = { analyzeVideoEmotions };