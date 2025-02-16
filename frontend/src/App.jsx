import './App.css';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useState } from 'react';
import LeaderboardPage from './LeaderboardPage';
import FileDropPage from './FileDropPage';
import HomePage from './HomePage';

const healthData = [
  { time: '1d', value: 65 },
  { time: '2d', value: 70 },
  { time: '3d', value: 62 },
  { time: '4d', value: 75 },
  { time: '5d', value: 78 },
];

// Define page states
const PAGES = {
  HOME: 'HOME',
  ANALYSIS: 'ANALYSIS',
  LEADERBOARD: 'LEADERBOARD'
};

function App() {
  const [currentPage, setCurrentPage] = useState(PAGES.HOME);

  const renderContent = () => {
    switch (currentPage) {
      case PAGES.LEADERBOARD:
        return <LeaderboardPage onBack={() => setCurrentPage(PAGES.HOME)} />;
      case PAGES.ANALYSIS:
        return <FileDropPage onBack={() => setCurrentPage(PAGES.HOME)} />;
      default:
        return <HomePage onStartTest={() => setCurrentPage(PAGES.ANALYSIS)} />;
    }
  };

  return (
    <div className="app-container">
      {renderContent()}
      <nav className="bottom-nav">
        <button 
          className="nav-button home-button"
          onClick={() => setCurrentPage(PAGES.ANALYSIS)}
        >
          <svg viewBox="0 0 24 24" className="nav-icon">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          </svg>
        </button>
        <button 
          className="nav-button camera-button"
          onClick={() => setCurrentPage(PAGES.HOME)}
        >
          <svg viewBox="0 0 24 24" className="nav-icon">
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        </button>
        <button 
          className="nav-button stats-button"
          onClick={() => setCurrentPage(PAGES.LEADERBOARD)}
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
