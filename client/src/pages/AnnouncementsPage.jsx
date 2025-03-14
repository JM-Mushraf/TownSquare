import React from 'react';
import './AnnouncementsPage.css';

function AnnouncementsPage() {
  return (
    <div className="announcements-container">
      <div className="announcements-header">
        <div>
          <h1 className="announcements-title">Government Announcements</h1>
          <p className="announcements-subtitle">Official updates from your local government</p>
        </div>
        <button className="announcements-subscribe-button">
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
            className="announcements-icon"
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
          </svg>
          Subscribe
        </button>
      </div>

      <div className="announcements-list">
        <div className="announcement-card">
          <div className="announcement-header">
            <div className="announcement-author">
              <div className="announcement-avatar">MJ</div>
              <div>
                <div className="announcement-name">Mayor Johnson</div>
                <div className="announcement-time">Posted 1 day ago</div>
              </div>
              <div className="announcement-badge important">
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
                  className="announcement-badge-icon"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Important
              </div>
            </div>
          </div>
          <div className="announcement-content">
            <h3 className="announcement-title">Town Hall Meeting: Infrastructure Project</h3>
            <p className="announcement-text">
              Town hall meeting this Friday at 7PM to discuss the new infrastructure project. All residents are
              welcome to attend. We will be discussing the proposed road improvements, water system upgrades, and
              the timeline for construction.
            </p>
            <div className="announcement-event">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="announcement-event-icon"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <div>
                <p className="announcement-event-date">Friday, March 12, 2025 at 7:00 PM</p>
                <p className="announcement-event-location">Community Center, 101 Pine Street</p>
              </div>
            </div>
            <div className="announcement-actions">
              <button className="announcement-action-button">
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
                  className="announcement-action-icon"
                >
                  <path d="M7 10v12"></path>
                  <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                </svg>
                56
              </button>
              <button className="announcement-action-button">
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
                  className="announcement-action-icon"
                >
                  <path d="M17 14V2"></path>
                  <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"></path>
                </svg>
                2
              </button>
              <button className="announcement-action-button">
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
                  className="announcement-action-icon"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Comment
              </button>
            </div>
          </div>
          <div className="announcement-footer">
            <button className="announcement-secondary-button">Add to Calendar</button>
            <button className="announcement-primary-button">RSVP</button>
          </div>
        </div>

        <div className="announcement-card">
          <div className="announcement-header">
            <div className="announcement-author">
              <div className="announcement-avatar">PD</div>
              <div>
                <div className="announcement-name">Parks Department</div>
                <div className="announcement-time">Posted 3 days ago</div>
              </div>
            </div>
          </div>
          <div className="announcement-content">
            <h3 className="announcement-title">Summer Recreation Programs Registration</h3>
            <p className="announcement-text">
              Registration for summer recreation programs is now open. Programs include swimming lessons, tennis
              camps, arts and crafts, and more. Early bird registration discount available until April 15.
            </p>
            <div className="announcement-actions">
              <button className="announcement-action-button">
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
                  className="announcement-action-icon"
                >
                  <path d="M7 10v12"></path>
                  <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                </svg>
                42
              </button>
              <button className="announcement-action-button">
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
                  className="announcement-action-icon"
                >
                  <path d="M17 14V2"></path>
                  <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"></path>
                </svg>
                0
              </button>
              <button className="announcement-action-button">
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
                  className="announcement-action-icon"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Comment
              </button>
            </div>
          </div>
          <div className="announcement-footer">
            <button className="announcement-primary-button full-width">Register Now</button>
          </div>
        </div>

        <div className="announcement-card">
          <div className="announcement-header">
            <div className="announcement-author">
              <div className="announcement-avatar">PW</div>
              <div>
                <div className="announcement-name">Public Works</div>
                <div className="announcement-time">Posted 1 week ago</div>
              </div>
            </div>
          </div>
          <div className="announcement-content">
            <h3 className="announcement-title">Water Main Repairs: Scheduled Outage</h3>
            <p className="announcement-text">
              There will be a scheduled water outage on Maple Street between 4th and 7th Avenue on Tuesday, March 9
              from 9AM to 3PM for water main repairs. Please plan accordingly and store water for essential use
              during this time.
            </p>
            <div className="announcement-actions">
              <button className="announcement-action-button">
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
                  className="announcement-action-icon"
                >
                  <path d="M7 10v12"></path>
                  <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                </svg>
                28
              </button>
              <button className="announcement-action-button">
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
                  className="announcement-action-icon"
                >
                  <path d="M17 14V2"></path>
                  <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"></path>
                </svg>
                5
              </button>
              <button className="announcement-action-button">
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
                  className="announcement-action-icon"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementsPage;