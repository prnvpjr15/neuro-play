// // TherapistVideoDashboard.jsx
// import React, { useState, useEffect, useContext } from 'react';
// import { AuthContext } from './AuthContext';
// import axios from 'axios';
// import { Card, Table, Button, Modal, Badge, ProgressBar, Form, Spinner, Alert } from 'react-bootstrap';
// import { FaVideo, FaPlay, FaBookmark, FaEdit, FaSave } from 'react-icons/fa';

// const TherapistVideoDashboard = ({ }) => {
//   const { user } = useContext(AuthContext);
//   const [videos, setVideos] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedVideo, setSelectedVideo] = useState(null);
//   const [showPlayer, setShowPlayer] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [notes, setNotes] = useState('');
//   const [bookmarks, setBookmarks] = useState([]);

//   const therapistId = user?.id;

//   console.log('👨‍⚕️ FULL USER OBJECT:', user);
//   console.log('🆔 User ID:', user?.id);
//   console.log('📧 User Email:', user?.email);
//   console.log('🎭 User Role:', user?.role);

//   useEffect(() => {
//     console.log('👨‍⚕️ Current user:', user);
//     console.log('🆔 Therapist ID:', therapistId);

//     if (therapistId) {
//       fetchVideos();
//     } else {
//       console.error('❌ No therapist ID available');
//       setLoading(false);
//     }
//   }, [therapistId]); // Depend on therapistId

//   const fetchVideos = async () => {
//     setLoading(true);
//     try {
//       console.log('👨‍⚕️ Fetching videos for therapist:', therapistId);

//       // ✅ NEW ENDPOINT for therapists
//       const response = await axios.get(`http://localhost:4000/api/facecapture/videos/therapist/${therapistId}`);

//       console.log('📦 Videos response:', response.data);
//       console.log('📊 Number of videos:', response.data?.length || 0);

//       if (Array.isArray(response.data)) {
//         setVideos(response.data);
//       } else {
//         console.error('❌ API did not return an array:', response.data);
//         setVideos([]);
//       }

//     } catch (error) {
//       console.error('❌ Failed to fetch videos:', error);
//       console.error('❌ Error response:', error.response?.data);
//       console.error('❌ Error message:', error.message);
//       setVideos([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleTimeUpdate = (time) => {
//     setCurrentTime(time);
//     if (selectedVideo && selectedVideo.highlights) {
//       const highlight = selectedVideo.highlights.find(
//         h => Math.abs(h.timestamp - time) < 1
//       );
//       if (highlight) {
//         console.log('Highlight at', time, ':', highlight);
//       }
//     }
//   };

//   const addBookmark = () => {
//     if (selectedVideo) {
//       const newBookmark = {
//         timestamp: currentTime,
//         notes: `Bookmark at ${Math.floor(currentTime)}s`,
//         emotion: 'bookmark'
//       };
//       setBookmarks([...bookmarks, newBookmark]);
//     }
//   };

//   const saveAnalysis = async () => {
//     try {
//       await axios.post(`http://localhost:4000/api/facecapture/videos/${selectedVideo._id}/analyze`, {
//         therapistNotes: notes,
//         bookmarks,
//         reviewed: true,
//         reviewedBy: therapistId,
//         reviewedAt: new Date()
//       });
//       alert('Analysis saved successfully');
//       fetchVideos(); // Refresh list
//     } catch (error) {
//       alert('Failed to save analysis');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="text-center p-5">
//         <Spinner animation="border" variant="primary" />
//         <p className="mt-3">Loading videos...</p>
//       </div>
//     );
//   }

//   if (!loading && videos.length === 0) {
//     return (
//       <div className="text-center p-5">
//         <FaVideo size={48} className="text-muted mb-3" />
//         <h4>No videos available</h4>
//         <p className="text-muted">No session videos have been uploaded yet.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container-fluid mt-3">
//       <h2 className="mb-4">
//         <FaVideo className="me-2" />
//         Patient Session Videos ({videos.length})
//       </h2>

//       <Table striped hover responsive>
//         <thead>
//           <tr>
//             <th>Patient ID</th>
//             <th>Date</th>
//             <th>Duration</th>
//             <th>Dominant Emotion</th>
//             <th>Status</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {videos.map(video => (
//             <tr key={video._id}>
//               <td>{video.userId || 'N/A'}</td>
//               <td>{new Date(video.timestamp).toLocaleString()}</td>
//               <td>{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</td>
//               <td>
//                 <Badge bg={
//                   video.emotion === 'happy' ? 'success' :
//                     video.emotion === 'sad' ? 'primary' :
//                       video.emotion === 'angry' ? 'danger' :
//                         video.emotion === 'neutral' ? 'secondary' : 'warning'
//                 }>
//                   {video.emotion || 'unknown'} ({Math.round(video.confidence || 0)}%)
//                 </Badge>
//               </td>
//               <td>
//                 {video.reviewed ? (
//                   <Badge bg="success">Reviewed</Badge>
//                 ) : (
//                   <Badge bg="warning">Pending Review</Badge>
//                 )}
//               </td>
//               <td>
//                 <Button
//                   variant="primary"
//                   size="sm"
//                   onClick={() => {
//                     setSelectedVideo(video);
//                     setShowPlayer(true);
//                     setNotes(video.therapistNotes || '');
//                     setBookmarks(video.highlights || []);
//                   }}
//                   className="me-2"
//                 >
//                   <FaPlay className="me-1" />
//                   Review
//                 </Button>
//                 <Button
//                   variant="outline-secondary"
//                   size="sm"
//                   onClick={() => window.open(`http://localhost:4000/api/facecapture/video/stream/${video._id}`, '_blank')}
//                 >
//                   Download
//                 </Button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </Table>

//       {/* Video Player Modal */}
//       <Modal show={showPlayer} onHide={() => setShowPlayer(false)} size="xl" fullscreen="lg-down">
//         <Modal.Header closeButton className="bg-dark text-white">
//           <Modal.Title>
//             Video Analysis: Patient {selectedVideo?.userId}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedVideo && (
//             <div className="row">
//               {/* Video Player */}
//               <div className="col-lg-8">
//                 <div className="video-container mb-3">
//                   <video
//                     id="therapyVideo"
//                     controls
//                     style={{ width: '100%', maxHeight: '70vh' }}
//                     src={`http://localhost:4000/api/facecapture/video/stream/${selectedVideo._id}`}
//                     onTimeUpdate={(e) => handleTimeUpdate(e.target.currentTime)}
//                   />
//                 </div>

//                 {/* Emotion Timeline */}
//                 <Card className="mb-3">
//                   <Card.Header>Emotion Timeline</Card.Header>
//                   <Card.Body>
//                     <div className="timeline">
//                       {selectedVideo.highlights?.map((highlight, idx) => (
//                         <div
//                           key={idx}
//                           className={`timeline-point ${highlight.bookmark ? 'bookmark' : ''}`}
//                           style={{ left: `${(highlight.timestamp / selectedVideo.duration) * 100}%` }}
//                           title={`${highlight.emotion} at ${highlight.timestamp}s`}
//                         >
//                           <div className={`emotion-dot ${highlight.emotion}`} />
//                         </div>
//                       ))}
//                     </div>
//                   </Card.Body>
//                 </Card>
//               </div>

//               {/* Analysis Panel */}
//               <div className="col-lg-4">
//                 <Card className="mb-3">
//                   <Card.Header>
//                     <FaEdit className="me-2" />
//                     Analysis Notes
//                   </Card.Header>
//                   <Card.Body>
//                     <Form.Group>
//                       <Form.Label>Therapist Observations</Form.Label>
//                       <Form.Control
//                         as="textarea"
//                         rows={6}
//                         value={notes}
//                         onChange={(e) => setNotes(e.target.value)}
//                         placeholder="Document your observations, progress notes, and recommendations..."
//                       />
//                     </Form.Group>

//                     <div className="mt-3">
//                       <Button
//                         variant="outline-primary"
//                         size="sm"
//                         onClick={addBookmark}
//                         className="me-2"
//                       >
//                         <FaBookmark className="me-1" />
//                         Add Bookmark at {Math.floor(currentTime)}s
//                       </Button>
//                     </div>

//                     <div className="mt-3">
//                       <h6>Session Bookmarks:</h6>
//                       <ul className="list-unstyled">
//                         {bookmarks.map((bookmark, idx) => (
//                           <li key={idx} className="mb-1">
//                             <Badge bg="info" className="me-2">
//                               {Math.floor(bookmark.timestamp)}s
//                             </Badge>
//                             {bookmark.notes}
//                           </li>
//                         ))}
//                       </ul>
//                     </div>

//                     <Button
//                       variant="success"
//                       className="mt-3 w-100"
//                       onClick={saveAnalysis}
//                     >
//                       <FaSave className="me-2" />
//                       Save Analysis
//                     </Button>
//                   </Card.Body>
//                 </Card>

//                 {/* Session Metadata */}
//                 <Card>
//                   <Card.Header>Session Details</Card.Header>
//                   <Card.Body>
//                     <p><strong>Duration:</strong> {selectedVideo.duration} seconds</p>
//                     <p><strong>Recorded:</strong> {new Date(selectedVideo.timestamp).toLocaleString()}</p>
//                     <p><strong>Resolution:</strong> {selectedVideo.resolution || 'Unknown'}</p>
//                     <p><strong>FPS:</strong> {selectedVideo.framesPerSecond || 'Unknown'}</p>
//                     <p><strong>File Size:</strong> {Math.round(selectedVideo.fileSize || 0)} MB</p>
//                   </Card.Body>
//                 </Card>
//               </div>
//             </div>
//           )}
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// };

// export default TherapistVideoDashboard;

// TherapistVideoDashboard.jsx

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import {
  Card,
  Table,
  Button,
  Modal,
  Badge,
  ProgressBar,
  Form,
  Spinner
} from 'react-bootstrap';
import { FaVideo, FaPlay, FaBookmark, FaEdit, FaSave } from 'react-icons/fa';

const TherapistVideoDashboard = () => {
  const { user } = useContext(AuthContext);

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [notes, setNotes] = useState('');
  const [bookmarks, setBookmarks] = useState([]);

  const therapistId = user?.id;

  useEffect(() => {
    if (therapistId) fetchVideos();
    else setLoading(false);
  }, [therapistId]);

  // ================= FETCH VIDEOS =================

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:4000/api/facecapture/videos/therapist/${therapistId}`
      );

      const parsedVideos = (response.data || []).map(video => ({
        ...video,
        gazeData:
          typeof video.gazeData === 'string'
            ? JSON.parse(video.gazeData)
            : video.gazeData || [],
        gazeSummary:
          typeof video.gazeSummary === 'string'
            ? JSON.parse(video.gazeSummary)
            : video.gazeSummary || {}
      }));

      setVideos(parsedVideos);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= VIDEO TIME =================

  const handleTimeUpdate = (time) => {
    setCurrentTime(time);
  };

  // ================= BOOKMARK =================

  const addBookmark = () => {
    if (!selectedVideo) return;

    const newBookmark = {
      timestamp: currentTime,
      notes: `Bookmark at ${Math.floor(currentTime)}s`,
      emotion: 'bookmark'
    };

    setBookmarks(prev => [...prev, newBookmark]);
  };

  // ================= SAVE ANALYSIS =================

  const saveAnalysis = async () => {
    if (!selectedVideo) return;

    try {
      await axios.post(
        `http://localhost:4000/api/facecapture/videos/${selectedVideo._id}/analyze`,
        {
          therapistNotes: notes,
          bookmarks,
          reviewed: true,
          reviewedBy: therapistId,
          reviewedAt: new Date()
        }
      );

      alert('Analysis saved successfully');
      fetchVideos();
      setShowPlayer(false);
    } catch (error) {
      alert('Failed to save analysis');
    }
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" />
        <p>Loading videos...</p>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="text-center p-5">
        <FaVideo size={48} className="text-muted mb-3" />
        <h4>No videos available</h4>
      </div>
    );
  }

  // ================= RENDER =================

  return (
    <div className="container-fluid mt-3">

      <h2 className="mb-4">
        <FaVideo className="me-2" />
        Patient Session Videos ({videos.length})
      </h2>

      {/* ================= TABLE ================= */}

      <Table striped hover responsive>
        <thead>
          <tr>
            <th>Patient ID</th>
            <th>Date</th>
            <th>Duration</th>
            <th>Attention</th>
            <th>Engagement</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {videos.map(video => (
            <tr key={video._id}>
              <td>{video.userId || 'N/A'}</td>
              <td>{new Date(video.timestamp).toLocaleString()}</td>
              <td>
                {Math.floor(video.duration / 60)}:
                {(video.duration % 60).toString().padStart(2, '0')}
              </td>

              {/* Attention */}
              <td>
                <Badge bg={
                  video.gazeSummary?.avgAttentionScore > 70
                    ? 'success'
                    : video.gazeSummary?.avgAttentionScore > 40
                      ? 'warning'
                      : 'danger'
                }>
                  {video.gazeSummary?.avgAttentionScore ?? 0}%
                </Badge>
              </td>

              {/* Engagement */}
              <td>
                <Badge bg={
                  video.gazeSummary?.engagementLevel === 'High'
                    ? 'success'
                    : video.gazeSummary?.engagementLevel === 'Medium'
                      ? 'warning'
                      : 'danger'
                }>
                  {video.gazeSummary?.engagementLevel || 'Low'}
                </Badge>
              </td>

              <td>
                {video.reviewed
                  ? <Badge bg="success">Reviewed</Badge>
                  : <Badge bg="warning">Pending</Badge>}
              </td>

              <td>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedVideo(video);
                    setShowPlayer(true);
                    setNotes(video.therapistNotes || '');
                    setBookmarks(video.highlights || []);
                  }}
                >
                  <FaPlay className="me-1" />
                  Review
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* ================= MODAL ================= */}

      <Modal show={showPlayer} onHide={() => setShowPlayer(false)} size="xl">

        <Modal.Header closeButton>
          <Modal.Title>
            Video Analysis - Patient {selectedVideo?.userId}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>

          {selectedVideo && (
            <div className="row">

              {/* ================= LEFT SIDE ================= */}
              <div className="col-lg-8">

                <video
                  controls
                  style={{ width: '100%', maxHeight: '60vh' }}
                  src={`http://localhost:4000/api/facecapture/video/stream/${selectedVideo._id}`}
                  onTimeUpdate={(e) => handleTimeUpdate(e.target.currentTime)}
                />

                {/* Attention Timeline */}
                <Card className="mt-3">
                  <Card.Header>Attention Timeline</Card.Header>
                  <Card.Body>

                    {selectedVideo?.gazeData?.length > 0 ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        height: '80px'
                      }}>
                        {selectedVideo.gazeData.map((point, idx) => (
                          <div
                            key={idx}
                            style={{
                              width: '3px',
                              height: `${point.attentionScore}%`,
                              marginRight: '2px',
                              backgroundColor:
                                point.attentionScore > 70
                                  ? 'green'
                                  : point.attentionScore > 40
                                    ? 'orange'
                                    : 'red'
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted">No attention data available</p>
                    )}

                  </Card.Body>
                </Card>

              </div>

              {/* ================= RIGHT SIDE ================= */}
              <div className="col-lg-4">

                {/* Gaze Summary */}
                <Card className="mb-3">
                  <Card.Header>Attention Analysis</Card.Header>
                  <Card.Body>

                    <p>
                      <strong>Average Attention:</strong>{" "}
                      {selectedVideo.gazeSummary?.avgAttentionScore ?? 0}%
                    </p>

                    <ProgressBar
                      now={selectedVideo.gazeSummary?.avgAttentionScore ?? 0}
                      variant={
                        selectedVideo.gazeSummary?.avgAttentionScore > 70
                          ? 'success'
                          : selectedVideo.gazeSummary?.avgAttentionScore > 40
                            ? 'warning'
                            : 'danger'
                      }
                    />

                    <p className="mt-3">
                      <strong>Face Detection Rate:</strong>{" "}
                      {selectedVideo.gazeSummary?.faceDetectionRate ?? 0}%
                    </p>

                    <p>
                      <strong>Engagement Level:</strong>{" "}
                      <Badge bg={
                        selectedVideo.gazeSummary?.engagementLevel === 'High'
                          ? 'success'
                          : selectedVideo.gazeSummary?.engagementLevel === 'Medium'
                            ? 'warning'
                            : 'danger'
                      }>
                        {selectedVideo.gazeSummary?.engagementLevel || 'Low'}
                      </Badge>
                    </p>

                  </Card.Body>
                </Card>

                {/* Therapist Notes */}
                <Card>
                  <Card.Header>
                    <FaEdit className="me-2" />
                    Therapist Notes
                  </Card.Header>

                  <Card.Body>

                    <Form.Control
                      as="textarea"
                      rows={5}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />

                    <Button
                      className="mt-3 w-100"
                      variant="success"
                      onClick={saveAnalysis}
                    >
                      <FaSave className="me-2" />
                      Save Analysis
                    </Button>

                  </Card.Body>
                </Card>

              </div>

            </div>
          )}

        </Modal.Body>

      </Modal>

    </div>
  );
};

export default TherapistVideoDashboard;
