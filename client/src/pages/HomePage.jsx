import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
import ThemeToggle from '../components/ThemeToggle';
import { FaThumbsUp, FaThumbsDown, FaComment, FaCalendar, FaChartLine, FaBullhorn, FaExclamationTriangle } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { MdOutlineEvent, MdAnnouncement } from 'react-icons/md';
import './HomePage.css';
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="page-container">
      <div className="home-header">
        <div>
          <h1 className="home-title">
            Welcome to <span className="gradient-text">TownSquare</span>
          </h1>
          <p className="home-subtitle">Your community platform for local engagement</p>
        </div>
        <div className="home-actions">
          <ThemeToggle />
          <Button className="primary-button" onClick={() => navigate("/createPost")}>
              <span className="button-icon"><HiSparkles /></span> Raise Ticket
          </Button>
        </div>
      </div>

      <div className="home-content">
        <div className="main-feed">
          <div className="feed-header">
            <h2 className="feed-title">Community Feed</h2>
            <Button className="ghost-button">
              View All <span className="chevron-right">›</span>
            </Button>
          </div>

          {/* Suggestion Post */}
          <Card className="feed-card suggestion-card">
            <div className="card-content">
              <div className="post-header">
                <Avatar 
                  src="/placeholder.svg?height=48&width=48" 
                  fallback="JC" 
                  className="avatar-green"
                />
                <div>
                  <h3 className="post-author">Jane Cooper</h3>
                  <p className="post-type">Suggestion</p>
                </div>
              </div>
              <p className="post-text">
                I think we should organize a community cleanup event next month. Who's interested?
              </p>
            </div>
            <div className="post-actions">
              <Button className="action-button">
                <span className="action-icon"><FaThumbsUp /></span> 24
              </Button>
              <Button className="action-button">
                <span className="action-icon"><FaThumbsDown /></span> 2
              </Button>
              <Button className="action-button">
                <span className="action-icon"><FaComment /></span> 8
              </Button>
            </div>
          </Card>

          {/* Poll Post */}
          <Card className="feed-card poll-card">
            <div className="card-content">
              <div className="post-header">
                <Avatar 
                  src="/placeholder.svg?height=48&width=48" 
                  fallback="RJ" 
                  className="avatar-blue"
                />
                <div>
                  <h3 className="post-author">Robert Johnson</h3>
                  <p className="post-type">Poll</p>
                </div>
              </div>
              <p className="post-text">
                What do you think about the water quality in our area?
              </p>
              <div className="poll-results">
                <div className="poll-option">
                  <div className="poll-option-header">
                    <span>Bad</span>
                    <span>45%</span>
                  </div>
                  <div className="poll-option-bar">
                    <div className="poll-option-progress red" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div className="poll-option">
                  <div className="poll-option-header">
                    <span>Best</span>
                    <span>9%</span>
                  </div>
                  <div className="poll-option-bar">
                    <div className="poll-option-progress green" style={{ width: '9%' }}></div>
                  </div>
                </div>
                <div className="poll-option">
                  <div className="poll-option-header">
                    <span>Average</span>
                    <span>18%</span>
                  </div>
                  <div className="poll-option-bar">
                    <div className="poll-option-progress yellow" style={{ width: '18%' }}></div>
                  </div>
                </div>
                <div className="poll-option">
                  <div className="poll-option-header">
                    <span>Need to improve</span>
                    <span>28%</span>
                  </div>
                  <div className="poll-option-bar">
                    <div className="poll-option-progress blue" style={{ width: '28%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="post-actions">
              <Button className="action-button">
                <span className="action-icon"><FaThumbsUp /></span> 18
              </Button>
              <Button className="action-button">
                <span className="action-icon"><FaThumbsDown /></span> 3
              </Button>
              <Button className="action-button">
                <span className="action-icon"><FaComment /></span> 5
              </Button>
            </div>
          </Card>

          {/* Announcement Post */}
          <Card className="feed-card announcement-card">
            <div className="card-content">
              <div className="post-header">
                <Avatar 
                  src="/placeholder.svg?height=48&width=48" 
                  fallback="MJ" 
                  className="avatar-red"
                />
                <div>
                  <h3 className="post-author">Mayor Johnson</h3>
                  <p className="post-type">Official Announcement</p>
                </div>
              </div>
              <p className="post-text">
                Town hall meeting this Friday at 7PM to discuss the new infrastructure project. All residents are welcome to attend.
              </p>
              <div className="event-info">
                <span className="event-icon"><MdOutlineEvent /></span>
                <div>
                  <p className="event-date">Friday, March 15, 2025 at 7:00 PM</p>
                  <p className="event-location">Community Center, Town Hall</p>
                </div>
              </div>
            </div>
            <div className="post-actions">
              <Button className="action-button">
                <span className="action-icon"><FaThumbsUp /></span> 56
              </Button>
              <Button className="action-button">
                <span className="action-icon"><FaThumbsDown /></span> 2
              </Button>
              <Button className="action-button">
                <span className="action-icon"><FaComment /></span> 12
              </Button>
            </div>
          </Card>
        </div>

        <div className="side-content">
          {/* Trending Discussions */}
          <Card className="side-card">
            <div className="card-header">
              <h3 className="card-title">
                <span className="card-icon"><FaChartLine /></span> Trending Discussions
              </h3>
            </div>
            <div className="card-content">
              <div className="trending-item">
                <div className="trending-title">New park proposal</div>
                <div className="trending-meta">32 comments - 2h ago</div>
              </div>
              <div className="trending-item">
                <div className="trending-title">Road maintenance schedule</div>
                <div className="trending-meta">18 comments - 5h ago</div>
              </div>
              <div className="trending-item">
                <div className="trending-title">Community garden initiative</div>
                <div className="trending-meta">24 comments - 8h ago</div>
              </div>
            </div>
          </Card>

          {/* Upcoming Events */}
          <Card className="side-card">
            <div className="card-header">
              <h3 className="card-title">
                <span className="card-icon"><MdOutlineEvent /></span> Upcoming Events
              </h3>
            </div>
            <div className="card-content">
              <div className="event-item">
                <div className="event-title">Community Meeting</div>
                <div className="event-meta">Mar 15, 7:30 PM - Town Hall</div>
              </div>
              <div className="event-item">
                <div className="event-title">Spring Festival</div>
                <div className="event-meta">Apr 2, 10:00 AM - Central Park</div>
              </div>
            </div>
          </Card>

          {/* Announcements */}
          <Card className="side-card">
            <div className="card-header">
              <h3 className="card-title">
                <span className="card-icon"><MdAnnouncement /></span> Announcements
              </h3>
            </div>
            <div className="card-content">
              <div className="announcement-item">
                <div className="announcement-title">Water maintenance scheduled</div>
                <div className="announcement-meta">Mar 12, 10:00 AM - 2:00 PM</div>
              </div>
            </div>
          </Card>

          {/* Emergency Alert */}
          <Card className="alert-card">
            <div className="alert-content">
              <div className="alert-icon"><FaExclamationTriangle /></div>
              <div>
                <div className="alert-title">Weather Alert</div>
                <div className="alert-message">Severe thunderstorm warning until 8:00 PM</div>
              </div>
            </div>
          </Card>

          {/* Raise Ticket Button */}
          <Button className="full-width-button primary-button">
            <span className="button-icon"><HiSparkles /></span> Raise Ticket
          </Button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;