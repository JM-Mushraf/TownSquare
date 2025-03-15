import React from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
import  ThemeToggle  from '../components/ThemeToggle';
import './HomePage.css';

function HomePage() {
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
          <Button className="primary-button">
            <span className="button-icon">✨</span> Raise Ticket
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
                <span className="action-icon">👍</span> 24
              </Button>
              <Button className="action-button">
                <span className="action-icon">👎</span> 2
              </Button>
              <Button className="action-button">
                <span className="action-icon">💬</span> 8
              </Button>
            </div>
          </Card>

          {/* Poll Post */}
          <Card className="feed-card poll-card">
            {/* Poll content similar to above */}
          </Card>

          {/* Announcement Post */}
          <Card className="feed-card announcement-card">
            {/* Announcement content similar to above */}
          </Card>
        </div>

        <div className="side-content">
          {/* Trending Discussions */}
          <Card className="side-card">
            <div className="card-header">
              <h3 className="card-title">
                <span className="card-icon">📈</span> Trending Discussions
              </h3>
            </div>
            <div className="card-content">
              {/* Trending items */}
            </div>
          </Card>

          {/* Upcoming Events */}
          <Card className="side-card">
            {/* Events content */}
          </Card>

          {/* Announcements */}
          <Card className="side-card">
            {/* Announcements content */}
          </Card>

          {/* Emergency Alert */}
          <Card className="alert-card">
            {/* Alert content */}
          </Card>

          {/* Raise Ticket Button */}
          <Button className="full-width-button primary-button">
            <span className="button-icon">✨</span> Raise Ticket
          </Button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;