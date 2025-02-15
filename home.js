import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Home</h1>
      </header>
      <main className="main-content">
        <section className="welcome-section">
          <p>Welcome Back,</p>
          <h2>Xavier D’mello</h2>
          <button className="start-button">Today’s Test</button>
        </section>
        <section className="activity-status">
          <h3>Activity Status</h3>
          <div className="status-card">
            <p>Sperm Health Index</p>
            <div className="chart">
              <span>78</span>
              <span className="time">3 mins ago</span>
            </div>
          </div>
        </section>
        <section className="latest-test-results">
          <h3>Latest Test Result <span>See more</span></h3>
          <div className="test-result">
            <div className="test-info">
              <span>Test 1</span>
              <p>Sperm Health Index 30</p>
              <div className="progress-bar" style={{ width: '30%' }}></div>
            </div>
          </div>
          <div className="test-result">
            <div className="test-info">
              <span>Test 2</span>
              <p>Sperm Health Index 50</p>
              <div className="progress-bar" style={{ width: '50%' }}></div>
            </div>
          </div>
          <div className="test-result">
            <div className="test-info">
              <span>Test 3</span>
              <p>Sperm Health Index 60</p>
              <div className="progress-bar" style={{ width: '60%' }}></div>
            </div>
          </div>
        </section>
      </main>
      <footer className="footer">
        <button className="nav-button">Home</button>
        <button className="nav-button">Camera</button>
        <button className="nav-button">Profile</button>
      </footer>
    </div>
  );
}

export default App;
