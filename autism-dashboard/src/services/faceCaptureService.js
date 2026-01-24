import axios from 'axios';

class FaceCaptureService {
  constructor() {
    this.isCapturing = false;
    this.captureInterval = null;
    this.captureIntervalMs = 5000; // Capture every 5 seconds
    this.sessionId = this.generateSessionId();
    this.userId = null;
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  initialize(userId) {
    this.userId = userId;
    this.sessionId = this.generateSessionId();
    console.log(`Face capture initialized for user ${userId}, session: ${this.sessionId}`);
  }

  async captureFaceFromCamera(videoElement, emotionData = null) {
    if (!this.userId) {
      console.error('User ID not set. Call initialize() first.');
      return null;
    }

    try {
      // Create canvas to capture frame
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      });

      // Create form data
      const formData = new FormData();
      formData.append('faceImage', blob, `face_${Date.now()}.jpg`);
      
      if (emotionData) {
        formData.append('emotion', emotionData.emotion || 'unknown');
        formData.append('confidence', emotionData.confidence || 0);
      }
      
      formData.append('timestamp', new Date().toISOString());
      formData.append('sessionId', this.sessionId);

      // Upload to server
      const response = await axios.post(
        `http://localhost:4000/api/face-data/upload/${this.userId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Face captured and saved:', response.data);
      return response.data;

    } catch (error) {
      console.error('Error capturing face:', error);
      return null;
    }
  }

  async captureFaceFromFile(imageFile, emotionData = null) {
    if (!this.userId) {
      console.error('User ID not set. Call initialize() first.');
      return null;
    }

    try {
      const formData = new FormData();
      formData.append('faceImage', imageFile);
      
      if (emotionData) {
        formData.append('emotion', emotionData.emotion || 'unknown');
        formData.append('confidence', emotionData.confidence || 0);
      }
      
      formData.append('timestamp', new Date().toISOString());
      formData.append('sessionId', this.sessionId);

      const response = await axios.post(
        `http://localhost:4000/api/face-data/upload/${this.userId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Face captured and saved:', response.data);
      return response.data;

    } catch (error) {
      console.error('Error capturing face from file:', error);
      return null;
    }
  }

  startContinuousCapture(videoElement, intervalMs = null) {
    if (this.isCapturing) {
      console.warn('Face capture is already running');
      return;
    }

    this.isCapturing = true;
    this.captureIntervalMs = intervalMs || this.captureIntervalMs;

    this.captureInterval = setInterval(async () => {
      try {
        if (videoElement.readyState >= 2) { // HAVE_CURRENT_DATA or more
          await this.captureFaceFromCamera(videoElement);
        }
      } catch (error) {
        console.error('Error in continuous capture:', error);
      }
    }, this.captureIntervalMs);

    console.log(`Continuous face capture started (every ${this.captureIntervalMs}ms)`);
  }

  stopContinuousCapture() {
    if (!this.isCapturing) {
      console.warn('Face capture is not running');
      return;
    }

    if (this.captureInterval) {
      clearInterval(this.captureInterval);
      this.captureInterval = null;
    }

    this.isCapturing = false;
    console.log('Continuous face capture stopped');
  }

  async getUserFaceData(filters = {}) {
    if (!this.userId) {
      console.error('User ID not set');
      return [];
    }

    try {
      const params = new URLSearchParams(filters).toString();
      const response = await axios.get(
        `http://localhost:4000/api/face-data/${this.userId}?${params}`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching face data:', error);
      return [];
    }
  }

  cleanup() {
    this.stopContinuousCapture();
    this.userId = null;
    this.sessionId = null;
  }
}

// Export as singleton
export const faceCaptureService = new FaceCaptureService();