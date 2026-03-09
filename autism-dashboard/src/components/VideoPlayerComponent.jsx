import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Button, Modal, Row, Col,
  Badge, Form, Alert,
  Spinner, Card, ProgressBar
} from 'react-bootstrap';
import {
  FaPlay, FaPause, FaVolumeUp, FaVolumeMute,
  FaExpand, FaCompress, FaDownload, FaEdit,
  FaTrash, FaClock, FaCalendar, FaFileAlt,
  FaTags, FaFolder, FaEye, FaVideo
} from 'react-icons/fa';
import ReactPlayer from 'react-player';

const VideoPlayerComponent = ({ videoId, onClose, onDelete, onUpdate }) => {
  // Video State
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  // Edit State
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Eye Tracking State
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [attentionScore, setAttentionScore] = useState(0); // 0 to 100
  const [sessionId, setSessionId] = useState(null);
  const [cameraError, setCameraError] = useState('');

  const playerRef = useRef();
  const containerRef = useRef();
  const webcamRef = useRef(null);
  const trackingIntervalRef = useRef(null);

  // --- 1. Video Logic ---
  useEffect(() => {
    if (videoId) {
      fetchVideoDetails();
    }
    // Cleanup tracking on unmount
    return () => stopTracking();
  }, [videoId]);

  const fetchVideoDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:4000/api/videos/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setVideo(response.data.video);
        setEditForm({
          title: response.data.video.title,
          description: response.data.video.description,
          category: response.data.video.category,
          tags: response.data.video.tags.join(', '),
          isPrivate: response.data.video.isPrivate
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load video.');
    } finally {
      setLoading(false);
    }
  };

  const getVideoUrl = () => {
    if (!video) return '';
    // If video has a filename field, use that directly
    if (video.filename) {
      return `http://localhost:4000/uploads/${video.filename}`;
    }
    // Fallback: extract filename from the absolute filePath
    if (video.filePath) {
      const normalizedPath = video.filePath.replace(/\\/g, '/');
      const filename = normalizedPath.split('/').pop();
      return `http://localhost:4000/uploads/${filename}`;
    }
    return '';
  };

  // --- 2. Tracking Logic ---

  const startTracking = async () => {
    try {
      setCameraError('');
      // 1. Get Camera Access
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
      }
      setTrackingEnabled(true);

      // 2. Start Session in Backend
      const token = localStorage.getItem('token');
      // For demo, we might not have a logged in user ID, handle gracefully
      const startRes = await axios.post('http://localhost:4000/api/tracking/start', {
        videoId,
        videoTitle: video?.title || 'Unknown Video',
        userId: 'current-user-id'
      });

      if (startRes.data.success) {
        setSessionId(startRes.data.sessionId);

        // 3. Start Data Loop
        trackingIntervalRef.current = setInterval(() => {
          calculateAndSendScore(startRes.data.sessionId);
        }, 1000); // Update every second
      }

    } catch (err) {
      console.error("Camera Error:", err);
      setCameraError('Could not access camera. Please allow permissions.');
      setTrackingEnabled(false);
    }
  };

  const stopTracking = async () => {
    // Stop Interval
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
    }

    // Stop Camera Stream
    if (webcamRef.current && webcamRef.current.srcObject) {
      const tracks = webcamRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      webcamRef.current.srcObject = null;
    }

    // Stop Backend Session
    if (sessionId) {
      try {
        await axios.post('http://localhost:4000/api/tracking/stop', { sessionId });
      } catch (err) {
        console.error(err);
      }
    }

    setTrackingEnabled(false);
    setSessionId(null);
    setAttentionScore(0);
  };

  // Simulate Gaze Calculation (Since we don't have face-api.js loaded)
  const calculateAndSendScore = async (activeSessionId) => {
    // In a real app, you would use face-api.js here to detect eye coordinates.
    // For this prototype, we simulate attention score based on "Presence".
    // If the video is Playing -> High Score. If Paused -> Low Score.

    // Add some random natural fluctuation (e.g., 85% +/- 10%)
    let simulatedScore = playing ? Math.floor(Math.random() * (100 - 80 + 1) + 80) : 0;

    // Update UI
    setAttentionScore(simulatedScore);

    // Send to Backend
    try {
      await axios.post('http://localhost:4000/api/tracking/update', {
        sessionId: activeSessionId,
        score: simulatedScore,
        isLooking: simulatedScore > 50
      });
    } catch (err) {
      console.error('Failed to send tracking data');
    }
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
  };

  // ... (Rest of your standard video functions: handleVolume, Seek, Delete, etc.) ...
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const handleProgress = (state) => {
    if (!state.seeking) setProgress(state.played);
  };

  const handleSeek = (e) => {
    const seekTo = parseFloat(e.target.value);
    setPlaying(false);
    setProgress(seekTo);
    if (playerRef.current) playerRef.current.seekTo(seekTo);
    setPlaying(true);
  };

  const handleDuration = (duration) => setDuration(duration);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(console.error);
    } else {
      document.exitFullscreen?.().catch(console.error);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const date = new Date(seconds * 1000);
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:4000/api/videos/${videoId}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setVideo(response.data.video);
        setShowEdit(false);
        if (onUpdate) onUpdate();
      }
    } catch (err) { setError('Failed to update'); }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this video?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:4000/api/videos/${videoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (onClose) onClose();
        if (onDelete) onDelete(videoId);
      } catch (err) { setError('Failed to delete'); }
    }
  };

  // --- Fullscreen Listener ---
  useEffect(() => {
    const handleFullscreenChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!videoId) return null;
  if (loading) return <Modal show={true} centered><Modal.Body className="text-center py-5"><Spinner animation="border" /></Modal.Body></Modal>;

  return (
    <>
      <Modal
        show={true}
        onHide={() => { stopTracking(); onClose(); }}
        size="xl"
        centered
        fullscreen={fullscreen}
        className={fullscreen ? 'p-0' : ''}
        backdrop="static"
      >
        <div ref={containerRef} className={fullscreen ? 'bg-black' : ''}>
          {/* Header */}
          <Modal.Header
            closeButton
            className={fullscreen ? 'position-absolute top-0 end-0 z-3 bg-dark bg-opacity-50 text-white border-0' : ''}
            style={fullscreen ? { zIndex: 1050 } : {}}
          >
            {!fullscreen && (
              <Modal.Title className="d-flex align-items-center w-100 justify-content-between">
                <div className="d-flex align-items-center">
                  <FaPlay className="me-2" />
                  {video?.title || 'Video Player'}
                </div>

                {/* --- Eye Tracking Toggle --- */}
                <div className="d-flex align-items-center">
                  {trackingEnabled ? (
                    <Button variant="danger" size="sm" onClick={stopTracking} className="d-flex align-items-center">
                      <FaVideo className="me-2" /> Stop Tracking
                    </Button>
                  ) : (
                    <Button variant="outline-primary" size="sm" onClick={startTracking} className="d-flex align-items-center">
                      <FaEye className="me-2" /> Enable Eye Tracking
                    </Button>
                  )}
                </div>
              </Modal.Title>
            )}
          </Modal.Header>

          <Modal.Body className={`p-0 ${fullscreen ? 'bg-black' : ''}`} style={{ position: 'relative', minHeight: fullscreen ? '100vh' : 'auto' }}>

            {/* --- Main Video Player --- */}
            <div className="position-relative w-100" style={{ height: fullscreen ? '100vh' : '500px', backgroundColor: 'black' }}>
              {video && (
                <ReactPlayer
                  ref={playerRef}
                  url={getVideoUrl()}
                  playing={playing}
                  volume={volume}
                  muted={muted}
                  onProgress={handleProgress}
                  onDuration={handleDuration}
                  width="100%"
                  height="100%"
                  controls={false}
                />
              )}

              {/* --- Eye Tracking Overlay (Pip) --- */}
              {trackingEnabled && (
                <div
                  className="position-absolute top-0 end-0 m-3 p-1 bg-dark border border-secondary rounded shadow"
                  style={{ width: '160px', zIndex: 1000 }}
                >
                  {/* Webcam Feed */}
                  <video
                    ref={webcamRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-100 rounded bg-black"
                    style={{ transform: 'scaleX(-1)' }} // Mirror effect
                  />

                  {/* Attention Score Bar */}
                  <div className="p-2">
                    <small className="text-white d-block mb-1" style={{ fontSize: '0.7rem' }}>
                      Attention Score: {attentionScore}%
                    </small>
                    <ProgressBar
                      now={attentionScore}
                      variant={attentionScore > 70 ? "success" : attentionScore > 40 ? "warning" : "danger"}
                      style={{ height: '6px' }}
                    />
                    <div className="mt-1 d-flex justify-content-between align-items-center">
                      <Badge bg="danger" className="pulsating-dot">REC</Badge>
                      <small className="text-light" style={{ fontSize: '0.65rem' }}>Tracking Active</small>
                    </div>
                  </div>
                </div>
              )}

              {/* Controls Overlay (Same as before) */}
              <div className={`position-absolute bottom-0 start-0 end-0 p-3 ${fullscreen ? 'bg-dark bg-opacity-75' : 'bg-dark bg-opacity-90'}`}>
                {/* Seek Bar */}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.001"
                  value={progress}
                  onChange={handleSeek}
                  className="w-100 mb-2"
                  style={{ height: '4px', cursor: 'pointer' }}
                />

                {/* Buttons */}
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-3">
                    <Button variant="link" className="text-white p-0" onClick={handlePlayPause}>
                      {playing ? <FaPause size={20} /> : <FaPlay size={20} />}
                    </Button>
                    <div className="text-white small">
                      {formatTime(progress * duration)} / {formatTime(duration)}
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <Button variant="link" className="text-white" onClick={toggleFullscreen}>
                      {fullscreen ? <FaCompress /> : <FaExpand />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message for Camera */}
            {cameraError && (
              <Alert variant="danger" className="m-3" onClose={() => setCameraError('')} dismissible>
                {cameraError}
              </Alert>
            )}

            {/* Video Details (Non-fullscreen) */}
            {!fullscreen && video && (
              <div className="p-4 bg-light">
                <Row>
                  <Col md={8}>
                    <h4 className="fw-bold">{video.title}</h4>
                    <p>{video.description}</p>
                    <div className="d-flex gap-2">
                      <Badge bg="primary">{video.category}</Badge>
                      <Badge bg="info">{video.isPrivate ? "Private" : "Public"}</Badge>
                    </div>
                  </Col>
                  <Col md={4} className="text-end">
                    <Button variant="outline-primary" className="me-2" onClick={() => setShowEdit(true)}>
                      <FaEdit /> Edit
                    </Button>
                    <Button variant="outline-danger" onClick={handleDelete}>
                      <FaTrash /> Delete
                    </Button>
                  </Col>
                </Row>
              </div>
            )}
          </Modal.Body>
        </div>
      </Modal>

      {/* Edit Modal Logic (Simplified for brevity, same as previous) */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton><Modal.Title>Edit Video</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleUpdate}>Save</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default VideoPlayerComponent;