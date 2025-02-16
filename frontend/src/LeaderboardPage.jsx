import { useState } from 'react';

const leaderboardData = [
  {
    id: 1,
    name: 'John Smith',
    averageCount: 85.3,
    motilityScore: 78.5,
    grade: 'Gold',
    points: 2569,
    country: 'US',
    color: '#FFE1B3'
  },
  {
    id: 2,
    name: 'David Chen',
    averageCount: 72.1,
    motilityScore: 65.8,
    grade: 'Silver',
    points: 1985,
    country: 'CN',
    color: '#E1F7E7'
  },
  {
    id: 3,
    name: 'Marco Rossi',
    averageCount: 68.4,
    motilityScore: 71.2,
    grade: 'Gold',
    points: 1756,
    country: 'IT',
    color: '#E1E6FF'
  },
  {
    id: 4,
    name: 'Alex Kumar',
    averageCount: 55.9,
    motilityScore: 45.3,
    grade: 'Silver',
    points: 1432,
    country: 'IN',
    color: '#F3E1FF'
  },
  {
    id: 5,
    name: 'Thomas Weber',
    averageCount: 42.1,
    motilityScore: 38.7,
    grade: 'Bronze',
    points: 892,
    country: 'DE',
    color: '#FFE1E1'
  },
  {
    id: 6,
    name: 'James Wilson',
    averageCount: 38.5,
    motilityScore: 35.2,
    grade: 'Bronze',
    points: 754,
    country: 'GB',
    color: '#E1F7FF'
  }
];

function LeaderboardPage({ onBack }) {
  const [timeFrame, setTimeFrame] = useState('weekly');

  return (
    <div className="app-container">
      <div className="app-content leaderboard-content">
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
                  <div className="user-stats">
                    <span className={`grade ${user.grade.toLowerCase()}`}>
                      {user.grade}
                    </span>
                    <span className="stat-divider">•</span>
                    <span className="count">{user.averageCount.toFixed(1)} count</span>
                    <span className="stat-divider">•</span>
                    <span className="motility">{user.motilityScore.toFixed(1)}% motility</span>
                  </div>
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
    </div>
  );
}

export default LeaderboardPage;