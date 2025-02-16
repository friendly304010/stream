import './App.css';

function App() {
  return (
    <div className="app-container">
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
          <button className="start-button">Start</button>
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
              {/* You'll need to implement a proper graph component here */}
              <svg className="line-graph" viewBox="0 0 300 100">
                {/* Add proper graph implementation */}
              </svg>
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
      
      <nav className="bottom-nav">
        <button className="nav-button home-button">
          <svg viewBox="0 0 24 24" className="nav-icon">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          </svg>
        </button>
        <button className="nav-button camera-button">
          <svg viewBox="0 0 24 24" className="nav-icon">
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        </button>
        <button className="nav-button stats-button">
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
