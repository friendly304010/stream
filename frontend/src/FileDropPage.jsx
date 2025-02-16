import { useState, useEffect } from 'react';
import axios from 'axios';

function FileDropPage({ onBack }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ stage: '', percent: 0 });
  const [thumbnail, setThumbnail] = useState(null);

  const stages = [
    { name: 'Uploading video...', duration: 1500 },
    { name: 'Sending to Eigen Agent...', duration: 2000 },
    { name: 'Calling YOLO-Sperm for detection...', duration: 2500 },
    { name: 'Analyzing positions...', duration: 2000 },
    { name: 'Calculating health metrics...', duration: 1500 },
    { name: 'Drawing conclusions...', duration: 1500 },
    { name: 'Finalizing results...', duration: 1000 }
  ];

  const simulateProgress = async () => {
    let totalTime = 0;
    for (const stage of stages) {
      setProgress({ stage: stage.name, percent: Math.min(95, (totalTime / 12000) * 100) });
      await new Promise(resolve => setTimeout(resolve, stage.duration));
      totalTime += stage.duration;
    }
  };

  const createVideoThumbnail = (file) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(file);
    
    return new Promise((resolve) => {
      video.onloadeddata = () => {
        video.currentTime = 0;
        video.onseeked = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnailUrl = canvas.toDataURL();
          URL.revokeObjectURL(video.src);
          resolve(thumbnailUrl);
        };
      };
    });
  };

  const handleFileDrop = async (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer?.files[0] || e.target.files[0];
    if (droppedFile && droppedFile.type.startsWith('video/')) {
      setFile(droppedFile);
      setError(null);
      const thumbnailUrl = await createVideoThumbnail(droppedFile);
      setThumbnail(thumbnailUrl);
    } else {
      setError('Please upload a video file');
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setProgress({ stage: '', percent: 0 });
    
    // Start progress simulation
    simulateProgress();

    const formData = new FormData();
    formData.append('video', file);

    try {
      const response = await axios.post('http://localhost:5001/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });
      
      // Set progress to 100% when done
      setProgress({ stage: 'Complete!', percent: 100 });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-content">
      <div className="home-header">
        <button className="back-button" onClick={onBack}>
          <svg viewBox="0 0 24 24" className="back-icon">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span>Analysis</span>
      </div>

      <div className="file-drop-area" 
        onDrop={handleFileDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {!file ? (
          <>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileDrop}
              style={{ display: 'none' }}
              id="file-input"
            />
            <label htmlFor="file-input" className="file-upload-button">
              Upload Video
            </label>
            <p>or drag and drop here</p>
          </>
        ) : (
          <div className="file-info">
            <p>{file.name}</p>
            {thumbnail && (
              <img 
                src={thumbnail} 
                alt="Video thumbnail" 
                className="video-thumbnail"
              />
            )}
            <button 
              className="analyze-button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Start Analysis'}
            </button>
            
            {loading && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${progress.percent}%` }}
                  ></div>
                </div>
                <p className="progress-stage">{progress.stage}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {result && (
        <div className="result-card">
          <h3>Analysis Results</h3>
          <p>Average Count: {result.average_count.toFixed(2)}</p>
          <p>Motility Score: {result.motility_score.toFixed(2)}%</p>
          <p>Grade: {result.grade} NFT</p>
          <p className="transaction-hash">
            TX: {result.transaction_hash.slice(0, 10)}...
          </p>
        </div>
      )}
    </div>
  );
}

export default FileDropPage; 