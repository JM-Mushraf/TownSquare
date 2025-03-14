import React, { useState } from 'react';
import './SurveysPage.css';

function SurveysPage() {
  const [activeTab, setActiveTab] = useState('active');
  
  return (
    <div className="surveys-container">
      <div className="surveys-header">
        <div>
          <h1 className="surveys-title">Surveys & Polls</h1>
          <p className="surveys-subtitle">Share your opinion on community matters</p>
        </div>
      </div>

      <div className="surveys-tabs">
        <div className="surveys-tabs-list">
          <button 
            className={`surveys-tab ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active
          </button>
          <button 
            className={`surveys-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`surveys-tab ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past
          </button>
        </div>

        <div className="surveys-tab-content">
          {activeTab === 'active' && (
            <div className="surveys-grid">
              <div className="survey-card">
                <div className="survey-header">
                  <h3 className="survey-title">Water Quality Survey</h3>
                  <p className="survey-deadline">Ends in 3 days</p>
                </div>
                <div className="survey-content">
                  <p className="survey-question">What do you think about the water quality in our town?</p>
                  <div className="survey-options">
                    <div className="survey-option">
                      <input type="radio" id="option1" name="water-quality" value="option1" />
                      <label htmlFor="option1">Bad</label>
                    </div>
                    <div className="survey-option">
                      <input type="radio" id="option2" name="water-quality" value="option2" />
                      <label htmlFor="option2">Best</label>
                    </div>
                    <div className="survey-option">
                      <input type="radio" id="option3" name="water-quality" value="option3" checked />
                      <label htmlFor="option3">Average</label>
                    </div>
                    <div className="survey-option">
                      <input type="radio" id="option4" name="water-quality" value="option4" />
                      <label htmlFor="option4">Need to improve</label>
                    </div>
                  </div>
                </div>
                <div className="survey-footer">
                  <button className="survey-submit-button">Submit Vote</button>
                </div>
              </div>

              <div className="survey-card">
                <div className="survey-header">
                  <h3 className="survey-title">Park Facilities</h3>
                  <p className="survey-deadline">Ends in 5 days</p>
                </div>
                <div className="survey-content">
                  <p className="survey-question">Which new facility would you like to see added to Central Park?</p>
                  <div className="survey-options">
                    <div className="survey-option">
                      <input type="radio" id="park1" name="park-facility" value="park1" checked />
                      <label htmlFor="park1">Playground</label>
                    </div>
                    <div className="survey-option">
                      <input type="radio" id="park2" name="park-facility" value="park2" />
                      <label htmlFor="park2">Basketball Court</label>
                    </div>
                    <div className="survey-option">
                      <input type="radio" id="park3" name="park-facility" value="park3" />
                      <label htmlFor="park3">Dog Park</label>
                    </div>
                    <div className="survey-option">
                      <input type="radio" id="park4" name="park-facility" value="park4" />
                      <label htmlFor="park4">Community Garden</label>
                    </div>
                  </div>
                </div>
                <div className="survey-footer">
                  <button className="survey-submit-button">Submit Vote</button>
                </div>
              </div>

              <div className="survey-card">
                <div className="survey-header">
                  <h3 className="survey-title">Community Events</h3>
                  <p className="survey-deadline">Ends in 1 week</p>
                </div>
                <div className="survey-content">
                  <p className="survey-question">
                    What type of community event would you like to see organized next month?
                  </p>
                  <div className="survey-options">
                    <div className="survey-option">
                      <input type="radio" id="event1" name="community-event" value="event1" />
                      <label htmlFor="event1">Farmers Market</label>
                    </div>
                    <div className="survey-option">
                      <input type="radio" id="event2" name="community-event" value="event2" checked />
                      <label htmlFor="event2">Music Festival</label>
                    </div>
                    <div className="survey-option">
                      <input type="radio" id="event3" name="community-event" value="event3" />
                      <label htmlFor="event3">Art Exhibition</label>
                    </div>
                    <div className="survey-option">
                      <input type="radio" id="event4" name="community-event" value="event4" />
                      <label htmlFor="event4">Sports Tournament</label>
                    </div>
                  </div>
                </div>
                <div className="survey-footer">
                  <button className="survey-submit-button">Submit Vote</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'upcoming' && (
            <div className="surveys-grid">
              <div className="survey-card">
                <div className="survey-header">
                  <h3 className="survey-title">Public Transportation</h3>
                  <p className="survey-deadline">Starts in 2 days</p>
                </div>
                <div className="survey-content">
                  <p className="survey-question">Survey about improving public transportation options in our town.</p>
                </div>
                <div className="survey-footer">
                  <button className="survey-reminder-button">Reminder</button>
                </div>
              </div>

              <div className="survey-card">
                <div className="survey-header">
                  <h3 className="survey-title">School Programs</h3>
                  <p className="survey-deadline">Starts in 1 week</p>
                </div>
                <div className="survey-content">
                  <p className="survey-question">Survey about after-school programs and educational initiatives.</p>
                </div>
                <div className="survey-footer">
                  <button className="survey-reminder-button">Reminder</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'past' && (
            <div className="surveys-grid">
              <div className="survey-card">
                <div className="survey-header">
                  <h3 className="survey-title">Recycling Program</h3>
                  <p className="survey-deadline">Ended 1 week ago</p>
                </div>
                <div className="survey-content">
                  <p className="survey-question">How satisfied are you with the current recycling program?</p>
                  <div className="survey-results">
                    <div className="survey-result">
                      <div className="survey-result-bar">
                        <div className="survey-result-fill green" style={{ width: '65%' }}></div>
                      </div>
                      <span className="survey-result-label">Very Satisfied - 65%</span>
                    </div>
                    <div className="survey-result">
                      <div className="survey-result-bar">
                        <div className="survey-result-fill yellow" style={{ width: '20%' }}></div>
                      </div>
                      <span className="survey-result-label">Neutral - 20%</span>
                    </div>
                    <div className="survey-result">
                      <div className="survey-result-bar">
                        <div className="survey-result-fill red" style={{ width: '15%' }}></div>
                      </div>
                      <span className="survey-result-label">Not Satisfied - 15%</span>
                    </div>
                  </div>
                </div>
                <div className="survey-footer">
                  <button className="survey-results-button">View Full Results</button>
                </div>
              </div>

              <div className="survey-card">
                <div className="survey-header">
                  <h3 className="survey-title">Town Budget Priorities</h3>
                  <p className="survey-deadline">Ended 2 weeks ago</p>
                </div>
                <div className="survey-content">
                  <p className="survey-question">Which area should receive more funding in the next budget?</p>
                  <div className="survey-results">
                    <div className="survey-result">
                      <div className="survey-result-bar">
                        <div className="survey-result-fill blue" style={{ width: '40%' }}></div>
                      </div>
                      <span className="survey-result-label">Education - 40%</span>
                    </div>
                    <div className="survey-result">
                      <div className="survey-result-bar">
                        <div className="survey-result-fill purple" style={{ width: '30%' }}></div>
                      </div>
                      <span className="survey-result-label">Infrastructure - 30%</span>
                    </div>
                    <div className="survey-result">
                      <div className="survey-result-bar">
                        <div className="survey-result-fill green" style={{ width: '20%' }}></div>
                      </div>
                      <span className="survey-result-label">Parks & Recreation - 20%</span>
                    </div>
                    <div className="survey-result">
                      <div className="survey-result-bar">
                        <div className="survey-result-fill orange" style={{ width: '10%' }}></div>
                      </div>
                      <span className="survey-result-label">Public Safety - 10%</span>
                    </div>
                  </div>
                </div>
                <div className="survey-footer">
                  <button className="survey-results-button">View Full Results</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SurveysPage;