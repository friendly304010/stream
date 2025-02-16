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
    { name: 'Uploading video...' },
    { name: 'Sending to Eigen Agent...' },
    { name: 'Calling YOLO-Sperm for detection...' },
    { name: 'Analyzing positions...' },
    { name: 'Calculating health metrics...' },
    { name: 'Drawing conclusions...' },
    { name: 'Finalizing results...' }
  ];

  const simulateProgress = async () => {
    let totalTime = 0;
    for (const stage of stages) {
      setProgress({ stage: stage.name, percent: Math.min(95, (totalTime / (stages.length * 7500)) * 100) });
      // Random wait between 5000ms (5s) and 10000ms (10s)
      const waitTime = Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      totalTime += waitTime;
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
          <div className="metrics">
            <div className="metric">
              <label>Average Count:</label>
              <span>{result.average_count.toFixed(2)} sperm cells</span>
            </div>
            <div className="metric">
              <label>Motility Score:</label>
              <span>{result.motility_score.toFixed(2)}%</span>
            </div>
            <div className="metric">
              <label>Grade:</label>
              <span className={`grade ${result.grade.toLowerCase()}`}>
                {result.grade} NFT
              </span>
            </div>
          </div>

          <div className="eigen-verification">
            <h4>AI Analysis & Recommendations</h4>
            <div className="verification-content">
              {result.eigen_verification.content.split('\n').map((line, i) => (
                <p key={i}>{line.trim()}</p>
              ))}
            </div>
            <div className="verification-status">
              <span className={`status ${result.eigen_verification.status}`}>
                Verified by EigenDA
              </span>
              <span className="timestamp">
                {new Date(result.eigen_verification.data.timestamp).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="transaction-info">
            <span className="label">Transaction Hash:</span>
            <a 
              href={`https://sepolia.etherscan.io/tx/${result.transaction_hash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {result.transaction_hash.slice(0, 10)}...
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileDropPage; 
