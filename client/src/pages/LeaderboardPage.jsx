import React, { useState } from 'react';
import './LeaderboardPage.css';

function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('overall');
  
  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <div>
          <h1 className="leaderboard-title">Community Leaderboard</h1>
          <p className="leaderboard-subtitle">Recognizing active community members</p>
        </div>
      </div>

      <div className="leaderboard-tabs">
        <div className="leaderboard-tabs-list">
          <button 
            className={`leaderboard-tab ${activeTab === 'overall' ? 'active' : ''}`}
            onClick={() => setActiveTab('overall')}
          >
            Overall
          </button>
          <button 
            className={`leaderboard-tab ${activeTab === 'monthly' ? 'active' : ''}`}
            onClick={() => setActiveTab('monthly')}
          >
            Monthly
          </button>
          <button 
            className={`leaderboard-tab ${activeTab === 'discussions' ? 'active' : ''}`}
            onClick={() => setActiveTab('discussions')}
          >
            Discussions
          </button>
          <button 
            className={`leaderboard-tab ${activeTab === 'surveys' ? 'active' : ''}`}
            onClick={() => setActiveTab('surveys')}
          >
            Surveys
          </button>
        </div>

        <div className="leaderboard-tab-content">
          {activeTab === 'overall' && (
            <>
              <div className="leaderboard-top-users">
                <div className="leaderboard-user second">
                  <div className="leaderboard-trophy">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="leaderboard-trophy-icon"
                    >
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                      <path d="M4 22h16"></path>
                      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                    </svg>
                  </div>
                  <h3 className="leaderboard-user-rank">2nd Place</h3>
                  <p className="leaderboard-user-name">Sarah Lee</p>
                  <div className="leaderboard-user-avatar">SL</div>
                  <div className="leaderboard-user-points">
                    <p className="leaderboard-points-value">1,250</p>
                    <p className="leaderboard-points-label">Community Points</p>
                  </div>
                </div>

                <div className="leaderboard-user first">
                  <div className="leaderboard-top-badge">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="leaderboard-badge-icon"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    Top Contributor
                  </div>
                  <div className="leaderboard-trophy">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="leaderboard-trophy-icon"
                    >
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                      <path d="M4 22h16"></path>
                      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                    </svg>
                  </div>
                  <h3 className="leaderboard-user-rank">1st Place</h3>
                  <p className="leaderboard-user-name">John Smith</p>
                  <div className="leaderboard-user-avatar">JS</div>
                  <div className="leaderboard-user-points">
                    <p className="leaderboard-points-value">1,875</p>
                    <p className="leaderboard-points-label">Community Points</p>
                  </div>
                </div>

                <div className="leaderboard-user third">
                  <div className="leaderboard-trophy">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="leaderboard-trophy-icon"
                    >
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                      <path d="M4 22h16"></path>
                      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                    </svg>
                  </div>
                  <h3 className="leaderboard-user-rank">3rd Place</h3>
                  <p className="leaderboard-user-name">Robert Miller</p>
                  <div className="leaderboard-user-avatar">RM</div>
                  <div className="leaderboard-user-points">
                    <p className="leaderboard-points-value">980</p>
                    <p className="leaderboard-points-label">Community Points</p>
                  </div>
                </div>
              </div>

              <div className="leaderboard-card">
                <div className="leaderboard-card-header">
                  <h3 className="leaderboard-card-title">Leaderboard Rankings</h3>
                  <p className="leaderboard-card-subtitle">Based on community participation and engagement</p>
                </div>
                <div className="leaderboard-card-content">
                  <div className="leaderboard-rankings">
                    <div className="leaderboard-ranking-item">
                      <div className="leaderboard-ranking-number">4</div>
                      <div className="leaderboard-ranking-avatar">JD</div>
                      <div className="leaderboard-ranking-info">
                        <p className="leaderboard-ranking-name">Jane Doe</p>
                        <div className="leaderboard-ranking-stats">
                          <span className="leaderboard-ranking-stat">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="leaderboard-stat-icon"
                            >
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            42 posts
                          </span>
                          <span className="leaderboard-ranking-stat">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="leaderboard-stat-icon"
                            >
                              <path d="m9 12 2 2 4-4"></path>
                              <path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"></path>
                              <path d="M22 19H2"></path>
                            </svg>
                            28 surveys
                          </span>
                        </div>
                      </div>
                      <div className="leaderboard-ranking-points">
                        <p className="leaderboard-ranking-points-value">875</p>
                        <p className="leaderboard-ranking-points-label">points</p>
                      </div>
                    </div>

                    <div className="leaderboard-ranking-item">
                      <div className="leaderboard-ranking-number">5</div>
                      <div className="leaderboard-ranking-avatar">TW</div>
                      <div className="leaderboard-ranking-info">
                        <p className="leaderboard-ranking-name">Tom Wilson</p>
                        <div className="leaderboard-ranking-stats">
                          <span className="leaderboard-ranking-stat">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="leaderboard-stat-icon"
                            >
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            36 posts
                          </span>
                          <span className="leaderboard-ranking-stat">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="leaderboard-stat-icon"
                            >
                              <path d="m9 12 2 2 4-4"></path>
                              <path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"></path>
                              <path d="M22 19H2"></path>
                            </svg>
                            22 surveys
                          </span>
                        </div>
                      </div>
                      <div className="leaderboard-ranking-points">
                        <p className="leaderboard-ranking-points-value">820</p>
                        <p className="leaderboard-ranking-points-label">points</p>
                      </div>
                    </div>

                    <div className="leaderboard-ranking-item">
                      <div className="leaderboard-ranking-number">6</div>
                      <div className="leaderboard-ranking-avatar">AJ</div>
                      <div className="leaderboard-ranking-info">
                        <p className="leaderboard-ranking-name">Alice Johnson</p>
                        <div className="leaderboard-ranking-stats">
                          <span className="leaderboard-ranking-stat">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="leaderboard-stat-icon"
                            >
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            31 posts
                          </span>
                          <span className="leaderboard-ranking-stat">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="leaderboard-stat-icon"
                            >
                              <path d="m9 12 2 2 4-4"></path>
                              <path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"></path>
                              <path d="M22 19H2"></path>
                            </svg>
                            25 surveys
                          </span>
                        </div>
                      </div>
                      <div className="leaderboard-ranking-points">
                        <p className="leaderboard-ranking-points-value">765</p>
                        <p className="leaderboard-ranking-points-label">points</p>
                      </div>
                    </div>

                    <div className="leaderboard-ranking-item">
                      <div className="leaderboard-ranking-number">7</div>
                      <div className="leaderboard-ranking-avatar">MB</div>
                      <div className="leaderboard-ranking-info">
                        <p className="leaderboard-ranking-name">Michael Brown</p>
                        <div className="leaderboard-ranking-stats">
                          <span className="leaderboard-ranking-stat">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="leaderboard-stat-icon"
                            >
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            28 posts
                          </span>
                          <span className="leaderboard-ranking-stat">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="leaderboard-stat-icon"
                            >
                              <path d="m9 12 2 2 4-4"></path>
                              <path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"></path>
                              <path d="M22 19H2"></path>
                            </svg>
                            19 surveys
                          </span>
                        </div>
                      </div>
                      <div className="leaderboard-ranking-points">
                        <p className="leaderboard-ranking-points-value">710</p>
                        <p className="leaderboard-ranking-points-label">points</p>
                      </div>
                    </div>

                    <div className="leaderboard-ranking-item">
                      <div className="leaderboard-ranking-number">8</div>
                      <div className="leaderboard-ranking-avatar">EG</div>
                      <div className="leaderboard-ranking-info">
                        <p className="leaderboard-ranking-name">Emily Green</p>
                        <div className="leaderboard-ranking-stats">
                          <span className="leaderboard-ranking-stat">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="leaderboard-stat-icon"
                            >
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            24 posts
                          </span>
                          <span className="leaderboard-ranking-stat">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="leaderboard-stat-icon"
                            >
                              <path d="m9 12 2 2 4-4"></path>
                              <path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"></path>
                              <path d="M22 19H2"></path>
                            </svg>
                            21 surveys
                          </span>
                        </div>
                      </div>
                      <div className="leaderboard-ranking-points">
                        <p className="leaderboard-ranking-points-value">685</p>
                        <p className="leaderboard-ranking-points-label">points</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'monthly' && (
            <div className="leaderboard-card">
              <div className="leaderboard-card-header">
                <h3 className="leaderboard-card-title">Monthly Leaderboard</h3>
                <p className="leaderboard-card-subtitle">Top contributors for March 2025</p>
              </div>
              <div className="leaderboard-card-content">
                <div className="leaderboard-rankings">
                  <p className="leaderboard-placeholder">Monthly rankings based on activity in the current month.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'discussions' && (
            <div className="leaderboard-card">
              <div className="leaderboard-card-header">
                <h3 className="leaderboard-card-title">Discussion Leaders</h3>
                <p className="leaderboard-card-subtitle">Top contributors in community discussions</p>
              </div>
              <div className="leaderboard-card-content">
                <div className="leaderboard-rankings">
                  <div className="leaderboard-ranking-item">
                    <div className="leaderboard-ranking-number">1</div>
                    <div className="leaderboard-ranking-avatar">JS</div>
                    <div className="leaderboard-ranking-info">
                      <p className="leaderboard-ranking-name">John Smith</p>
                      <div className="leaderboard-ranking-stats">
                        <span className="leaderboard-ranking-stat">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="leaderboard-stat-icon"
                          >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                          78 posts
                        </span>
                        <span className="leaderboard-ranking-stat">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="leaderboard-stat-icon"
                          >
                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          Active since Jan 2024
                        </span>
                      </div>
                    </div>
                    <div className="leaderboard-ranking-points">
                      <p className="leaderboard-ranking-points-value">1,245</p>
                      <p className="leaderboard-ranking-points-label">discussion points</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'surveys' && (
            <div className="leaderboard-card">
              <div className="leaderboard-card-header">
                <h3 className="leaderboard-card-title">Survey Participants</h3>
                <p className="leaderboard-card-subtitle">Most active survey and poll participants</p>
              </div>
              <div className="leaderboard-card-content">
                <div className="leaderboard-rankings">
                  <div className="leaderboard-ranking-item">
                    <div className="leaderboard-ranking-number">1</div>
                    <div className="leaderboard-ranking-avatar">SL</div>
                    <div className="leaderboard-ranking-info">
                      <p className="leaderboard-ranking-name">Sarah Lee</p>
                      <div className="leaderboard-ranking-stats">
                        <span className="leaderboard-ranking-stat">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="leaderboard-stat-icon"
                          >
                            <path d="m9 12 2 2 4-4"></path>
                            <path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"></path>
                            <path d="M22 19H2"></path>
                          </svg>
                          42 surveys completed
                        </span>
                        <span className="leaderboard-ranking-stat">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="leaderboard-stat-icon"
                          >
                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          Active since Feb 2024
                        </span>
                      </div>
                    </div>
                    <div className="leaderboard-ranking-points">
                      <p className="leaderboard-ranking-points-value">840</p>
                      <p className="leaderboard-ranking-points-label">survey points</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LeaderboardPage;