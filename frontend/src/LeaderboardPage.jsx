import { useState } from 'react';

const leaderboardData = [
  { id: 1, name: 'Apple', points: 2569, country: 'PT', color: '#E1F7E7' },
  { id: 2, name: 'Banana', points: 1469, country: 'FR', color: '#FFE1E1' },
  { id: 3, name: 'Orange', points: 1053, country: 'CA', color: '#E1E6FF' },
  { id: 4, name: 'Pineapple', points: 590, country: 'HU', color: '#F3E1FF' },
  { id: 5, name: 'Mango', points: 448, country: 'IT', color: '#FFE1E1' },
  { id: 6, name: 'Hahaha', points: 448, country: 'PH', color: '#FFE1E1' },
];

function LeaderboardPage({ onBack }) {
  const [timeFrame, setTimeFrame] = useState('weekly');

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <button className="back-button" onClick={onBack}>
          <svg viewBox="0 0 24 24" className="back-icon">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1>Leaderboard</h1>
      </div>

      <div className="time-filter">
        <button 
          className={`filter-button ${timeFrame === 'weekly' ? 'active' : ''}`}
          onClick={() => setTimeFrame('weekly')}
        >
          Weekly
        </button>
        <button 
          className={`filter-button ${timeFrame === 'allTime' ? 'active' : ''}`}
          onClick={() => setTimeFrame('allTime')}
        >
          All Time
        </button>
      </div>

      <div className="leaderboard-list">
        {leaderboardData.map((user) => (
          <div key={user.id} className="leaderboard-item">
            <div className="rank">{user.id}</div>
            <div className="user-info">
              <div 
                className="user-avatar" 
                style={{ backgroundColor: user.color }}
              />
              <div className="user-details">
                <div className="user-name">{user.name}</div>
                <div className="user-points">{user.points.toLocaleString()} points</div>
              </div>
            </div>
            <div className="badge">
              <img 
                src={`https://flagcdn.com/24x18/${user.country.toLowerCase()}.png`}
                alt={user.country}
                className="country-flag"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LeaderboardPage;