import './App.css';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useState } from 'react';
import LeaderboardPage from './LeaderboardPage';
import FileDropPage from './FileDropPage';

const healthData = [
  { time: '1d', value: 65 },
  { time: '2d', value: 70 },
  { time: '3d', value: 62 },
  { time: '4d', value: 75 },
  { time: '5d', value: 78 },
];

function App() {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showFileDrop, setShowFileDrop] = useState(false);

  const renderContent = () => {
    if (showLeaderboard) {
      return <LeaderboardPage onBack={() => setShowLeaderboard(false)} />;
    }

    if (showFileDrop) {
      return <FileDropPage onBack={() => setShowFileDrop(false)} />;
    }

    return (
      <div className="app-content">
        <div className="home-header">
          <span>Home</span>
        </div>
        
        <header className="welcome-header">
          <h2>Welcome Back,</h2>
          <h1>Xavier D'mello</h1>
        </header>
        
        <div className="test-button">
          <span>Today's Test</span>
          <button 
            className="start-button"
            onClick={() => setShowFileDrop(true)}
          >
            Start
          </button>
        </div>
        
        <div className="activity-status">
          <div className="section-header">
            <h3>Activity Status</h3>
          </div>
          <div className="status-card">
            <div className="sperm-health-index">
              <div className="index-value">78</div>
              <div className="index-label">Sperm Health Index</div>
              <div className="timestamp">3 mins ago</div>
            </div>
            <div className="graph">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={healthData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12, fill: '#666' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    hide={true}
                    domain={['dataMin - 5', 'dataMax + 5']}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    labelStyle={{ color: '#666' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#7C9BFF" 
                    strokeWidth={2}
                    dot={{ fill: '#7C9BFF', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#7C9BFF' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="past-test-results">
          <div className="section-header">
            <h3>Past Test Result</h3>
            <span className="see-more">See more</span>
          </div>
          
          {[
            { id: 1, name: 'Test 1', value: 30 },
            { id: 2, name: 'Test 2', value: 50 },
            { id: 3, name: 'Test 3', value: 60 },
          ].map(test => (
            <div key={test.id} className="test-result">
              <div className="test-info">
                <div className="test-circle"></div>
                <div className="test-details">
                  <div className="test-name">{test.name}</div>
                  <div className="test-value">Sperm Health Index {test.value}</div>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress" style={{ width: `${test.value}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      {renderContent()}
      <nav className="bottom-nav">
        <button 
          className="nav-button home-button"
          onClick={() => setShowFileDrop(true)}
        >
          <svg viewBox="0 0 24 24" className="nav-icon">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          </svg>
        </button>
        <button 
          className="nav-button camera-button"
          onClick={() => {
            setShowFileDrop(false);
            setShowLeaderboard(false);
          }}
        >
          <svg viewBox="0 0 24 24" className="nav-icon">
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        </button>
        <button 
          className="nav-button stats-button"
          onClick={() => setShowLeaderboard(true)}
        >
          <svg viewBox="0 0 24 24" className="nav-icon">
            <path d="M2 2v20h20"></path>
            <path d="M6 16l6-8 6 8"></path>
          </svg>
        </button>
      </nav>
    </div>
  );
}

export default App;
