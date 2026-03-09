import React, { useState, useRef } from 'react';
import axios from 'axios';
import {
  Modal, Button, Form, ProgressBar, Alert,
  Card, Row, Col, Badge
} from 'react-bootstrap';
import {
  FaUpload, FaVideo, FaTag, FaFolder, FaLock, FaGlobe
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const VideoUploadComponent = ({ show, onClose, onUploadSuccess, userId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('therapy_session');
  const [tags, setTags] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  
  const fileInputRef = useRef();

  const categories = [
    //{ value: 'therapy_session', label: 'Therapy Session', icon: <FaVideo className="text-primary" /> },
    //{ value: 'progress_tracking', label: 'Progress Tracking', icon: <FaFolder className="text-success" /> },
    { value: 'educational', label: 'Educational', icon: <FaGlobe className="text-info" /> },
    { value: 'exercise', label: 'Exercise', icon: <FaTag className="text-warning" /> },
    { value: 'other', label: 'Other', icon: <FaFolder className="text-secondary" /> }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (500MB max)
    if (file.size > 500 * 1024 * 1024) {
      setError('File size must be less than 500MB');
      return;
    }

    // Validate file type
    const validTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid video file (MP4, MOV, AVI, MKV, WEBM)');
      return;
    }

    setSelectedFile(file);
    setError('');
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Auto-generate title if empty
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a video file');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title for the video');
      return;
    }

    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('tags', tags);
    formData.append('isPrivate', isPrivate.toString());
    // Include userId so backend can associate the upload with the user
    if (userId) formData.append('userId', userId);

    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const response = await axios.post('http://localhost:4000/api/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });

      if (response.data.success) {
        onUploadSuccess(response.data.video);
        resetForm();
        onClose();
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('therapy_session');
    setTags('');
    setIsPrivate(true);
    setSelectedFile(null);
    setPreviewUrl('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <FaUpload className="me-2" />
          Upload Video
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={6}>
            <Form>
              {/* File Upload Area */}
              <div 
                className="border-3 border-dashed rounded-3 p-5 text-center mb-4 cursor-pointer"
                style={{ 
                  borderColor: '#dee2e6',
                  backgroundColor: previewUrl ? 'transparent' : '#f8f9fa'
                }}
                onClick={() => fileInputRef.current.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="video/*"
                  className="d-none"
                />
                
                {previewUrl ? (
                  <div>
                    <video 
                      src={previewUrl} 
                      className="img-fluid rounded mb-3"
                      style={{ maxHeight: '200px' }}
                      controls
                    />
                    <p className="mb-1">{selectedFile?.name}</p>
                    <small className="text-muted">
                      {formatFileSize(selectedFile?.size)}
                    </small>
                  </div>
                ) : (
                  <div>
                    <FaVideo size={48} className="text-muted mb-3" />
                    <h5>Drop video here or click to browse</h5>
                    <p className="text-muted small">
                      MP4, MOV, AVI, MKV, WEBM (Max 500MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-1">
                    <small>Uploading...</small>
                    <small>{uploadProgress}%</small>
                  </div>
                  <ProgressBar now={uploadProgress} striped animated />
                </div>
              )}

              {/* Error Message */}
              {error && <Alert variant="danger">{error}</Alert>}
            </Form>
          </Col>
          
          <Col md={6}>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Title *</Form.Label>
                <Form.Control
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter video title"
                  disabled={isUploading}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this video..."
                  disabled={isUploading}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat.value}
                      variant={category === cat.value ? "primary" : "outline-primary"}
                      size="sm"
                      className="d-flex align-items-center"
                      onClick={() => setCategory(cat.value)}
                      disabled={isUploading}
                    >
                      {cat.icon}
                      <span className="ms-1">{cat.label}</span>
                    </Button>
                  ))}
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Tags</Form.Label>
                <Form.Control
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                  disabled={isUploading}
                />
                <Form.Text className="text-muted">
                  Separate tags with commas
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Privacy</Form.Label>
                <div className="d-flex gap-3">
                  <Form.Check
                    type="radio"
                    id="private"
                    label={
                      <>
                        <FaLock className="me-1" />
                        Private
                      </>
                    }
                    checked={isPrivate}
                    onChange={() => setIsPrivate(true)}
                    disabled={isUploading}
                  />
                  <Form.Check
                    type="radio"
                    id="public"
                    label={
                      <>
                        <FaGlobe className="me-1" />
                        Public
                      </>
                    }
                    checked={!isPrivate}
                    onChange={() => setIsPrivate(false)}
                    disabled={isUploading}
                  />
                </div>
              </Form.Group>
            </Form>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isUploading}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Video'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VideoUploadComponent;