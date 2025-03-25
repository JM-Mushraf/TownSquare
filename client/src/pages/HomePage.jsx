"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Card } from "../components/Card"
import { Avatar } from "../components/Avatar"
import ThemeToggle from "../components/ThemeToggle"
import {
  FiThumbsUp,
  FiThumbsDown,
  FiMessageSquare,
  FiCalendar,
  FiTrendingUp,
  FiAlertTriangle,
  FiMapPin,
  FiClock,
  FiChevronRight,
  FiPlus,
  FiActivity,
  FiBell,
} from "react-icons/fi"
import { HiOutlineSparkles } from "react-icons/hi"
import { IoMdMegaphone } from "react-icons/io"
import { BsGraphUp, BsLightningCharge } from "react-icons/bs"
import "./HomePage.css"

function HomePage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("all")

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  return (
    <div className="home-container">
      <motion.div
        className="home-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-content">
          <div className="header-text">
            <h1 className="home-title">
              Welcome to <span className="gradient-text">TownSquare</span>
            </h1>
            <div className="title-underline"></div>
            <p className="home-subtitle">Your community platform for local engagement</p>
          </div>
          <div className="home-actions">
            <ThemeToggle />
            <motion.button
              className="primary-button"
              onClick={() => navigate("/createPost")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <HiOutlineSparkles className="button-icon" />
              <span>Raise Ticket</span>
            </motion.button>
          </div>
        </div>

        <div className="tab-navigation">
          <motion.button
            className={`tab-button ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <BsLightningCharge className="tab-icon" />
            <span>All</span>
          </motion.button>
          <motion.button
            className={`tab-button ${activeTab === "suggestions" ? "active" : ""}`}
            onClick={() => setActiveTab("suggestions")}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiPlus className="tab-icon" />
            <span>Suggestions</span>
          </motion.button>
          <motion.button
            className={`tab-button ${activeTab === "polls" ? "active" : ""}`}
            onClick={() => setActiveTab("polls")}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <BsGraphUp className="tab-icon" />
            <span>Polls</span>
          </motion.button>
          <motion.button
            className={`tab-button ${activeTab === "announcements" ? "active" : ""}`}
            onClick={() => setActiveTab("announcements")}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <IoMdMegaphone className="tab-icon" />
            <span>Announcements</span>
          </motion.button>
        </div>
      </motion.div>

      <div className="home-content">
        <motion.div className="main-feed" variants={containerVariants} initial="hidden" animate="visible">
          <div className="feed-header">
            <h2 className="feed-title">Community Feed</h2>
            <motion.button className="view-all-button" whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
              View All <FiChevronRight className="chevron-icon" />
            </motion.button>
          </div>

          {/* Suggestion Post */}
          <motion.div variants={itemVariants} className="feed-item">
            <Card className="feed-card suggestion-card">
              <div className="card-content">
                <div className="post-header">
                  <Avatar src="/placeholder.svg?height=48&width=48" fallback="JC" className="avatar-green" />
                  <div className="post-author-info">
                    <h3 className="post-author">Jane Cooper</h3>
                    <div className="post-meta">
                      <span className="post-type suggestion">Suggestion</span>
                      <span className="post-time">2 hours ago</span>
                    </div>
                  </div>
                </div>
                <p className="post-text">
                  I think we should organize a community cleanup event next month. Who's interested?
                </p>
                <div className="post-tags">
                  <span className="post-tag">Environment</span>
                  <span className="post-tag">Community</span>
                </div>
              </div>
              <div className="post-actions">
                <motion.button className="action-button" whileHover={{ y: -2, backgroundColor: "var(--muted)" }}>
                  <FiThumbsUp className="action-icon" /> 24
                </motion.button>
                <motion.button className="action-button" whileHover={{ y: -2, backgroundColor: "var(--muted)" }}>
                  <FiThumbsDown className="action-icon" /> 2
                </motion.button>
                <motion.button className="action-button" whileHover={{ y: -2, backgroundColor: "var(--muted)" }}>
                  <FiMessageSquare className="action-icon" /> 8
                </motion.button>
                <div className="action-spacer"></div>
                <motion.button className="action-button secondary" whileHover={{ y: -2 }}>
                  <span>Join</span>
                </motion.button>
              </div>
            </Card>
          </motion.div>

          {/* Poll Post */}
          <motion.div variants={itemVariants} className="feed-item">
            <Card className="feed-card poll-card">
              <div className="card-content">
                <div className="post-header">
                  <Avatar src="/placeholder.svg?height=48&width=48" fallback="RJ" className="avatar-blue" />
                  <div className="post-author-info">
                    <h3 className="post-author">Robert Johnson</h3>
                    <div className="post-meta">
                      <span className="post-type poll">Poll</span>
                      <span className="post-time">5 hours ago</span>
                    </div>
                  </div>
                </div>
                <p className="post-text">What do you think about the water quality in our area?</p>
                <div className="poll-results">
                  <div className="poll-option">
                    <div className="poll-option-header">
                      <span>Bad</span>
                      <span>45%</span>
                    </div>
                    <div className="poll-option-bar">
                      <motion.div
                        className="poll-option-progress red"
                        initial={{ width: 0 }}
                        animate={{ width: "45%" }}
                        transition={{ duration: 1, delay: 0.2 }}
                      ></motion.div>
                    </div>
                  </div>
                  <div className="poll-option">
                    <div className="poll-option-header">
                      <span>Best</span>
                      <span>9%</span>
                    </div>
                    <div className="poll-option-bar">
                      <motion.div
                        className="poll-option-progress green"
                        initial={{ width: 0 }}
                        animate={{ width: "9%" }}
                        transition={{ duration: 1, delay: 0.4 }}
                      ></motion.div>
                    </div>
                  </div>
                  <div className="poll-option">
                    <div className="poll-option-header">
                      <span>Average</span>
                      <span>18%</span>
                    </div>
                    <div className="poll-option-bar">
                      <motion.div
                        className="poll-option-progress yellow"
                        initial={{ width: 0 }}
                        animate={{ width: "18%" }}
                        transition={{ duration: 1, delay: 0.6 }}
                      ></motion.div>
                    </div>
                  </div>
                  <div className="poll-option">
                    <div className="poll-option-header">
                      <span>Need to improve</span>
                      <span>28%</span>
                    </div>
                    <div className="poll-option-bar">
                      <motion.div
                        className="poll-option-progress blue"
                        initial={{ width: 0 }}
                        animate={{ width: "28%" }}
                        transition={{ duration: 1, delay: 0.8 }}
                      ></motion.div>
                    </div>
                  </div>
                </div>
                <div className="poll-meta">
                  <div className="poll-votes">
                    <FiActivity className="poll-icon" />
                    <span>124 votes</span>
                  </div>
                  <div className="poll-time-left">
                    <FiClock className="poll-icon" />
                    <span>2 days left</span>
                  </div>
                </div>
              </div>
              <div className="post-actions">
                <motion.button className="action-button" whileHover={{ y: -2, backgroundColor: "var(--muted)" }}>
                  <FiThumbsUp className="action-icon" /> 18
                </motion.button>
                <motion.button className="action-button" whileHover={{ y: -2, backgroundColor: "var(--muted)" }}>
                  <FiThumbsDown className="action-icon" /> 3
                </motion.button>
                <motion.button className="action-button" whileHover={{ y: -2, backgroundColor: "var(--muted)" }}>
                  <FiMessageSquare className="action-icon" /> 5
                </motion.button>
                <div className="action-spacer"></div>
                <motion.button className="action-button secondary" whileHover={{ y: -2 }}>
                  <span>Vote</span>
                </motion.button>
              </div>
            </Card>
          </motion.div>

          {/* Announcement Post */}
          <motion.div variants={itemVariants} className="feed-item">
            <Card className="feed-card announcement-card">
              <div className="card-content">
                <div className="post-header">
                  <Avatar src="/placeholder.svg?height=48&width=48" fallback="MJ" className="avatar-red" />
                  <div className="post-author-info">
                    <h3 className="post-author">Mayor Johnson</h3>
                    <div className="post-meta">
                      <span className="post-type announcement">Official Announcement</span>
                      <span className="post-time">1 day ago</span>
                    </div>
                  </div>
                </div>
                <p className="post-text">
                  Town hall meeting this Friday at 7PM to discuss the new infrastructure project. All residents are
                  welcome to attend.
                </p>
                <div className="event-info">
                  <div className="event-info-item">
                    <FiCalendar className="event-icon" />
                    <span>Friday, March 15, 2025 at 7:00 PM</span>
                  </div>
                  <div className="event-info-item">
                    <FiMapPin className="event-icon" />
                    <span>Community Center, Town Hall</span>
                  </div>
                </div>
              </div>
              <div className="post-actions">
                <motion.button className="action-button" whileHover={{ y: -2, backgroundColor: "var(--muted)" }}>
                  <FiThumbsUp className="action-icon" /> 56
                </motion.button>
                <motion.button className="action-button" whileHover={{ y: -2, backgroundColor: "var(--muted)" }}>
                  <FiThumbsDown className="action-icon" /> 2
                </motion.button>
                <motion.button className="action-button" whileHover={{ y: -2, backgroundColor: "var(--muted)" }}>
                  <FiMessageSquare className="action-icon" /> 12
                </motion.button>
                <div className="action-spacer"></div>
                <motion.button className="action-button secondary" whileHover={{ y: -2 }}>
                  <span>RSVP</span>
                </motion.button>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div
          className="side-content"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Trending Discussions */}
          <Card className="side-card">
            <div className="card-header">
              <h3 className="card-title">
                <FiTrendingUp className="card-icon" /> Trending Discussions
              </h3>
            </div>
            <div className="card-content">
              <motion.div className="trending-item" whileHover={{ x: 5, backgroundColor: "var(--muted)" }}>
                <div className="trending-title">New park proposal</div>
                <div className="trending-meta">
                  <span className="trending-comments">32 comments</span>
                  <span className="trending-time">2h ago</span>
                </div>
              </motion.div>
              <motion.div className="trending-item" whileHover={{ x: 5, backgroundColor: "var(--muted)" }}>
                <div className="trending-title">Road maintenance schedule</div>
                <div className="trending-meta">
                  <span className="trending-comments">18 comments</span>
                  <span className="trending-time">5h ago</span>
                </div>
              </motion.div>
              <motion.div className="trending-item" whileHover={{ x: 5, backgroundColor: "var(--muted)" }}>
                <div className="trending-title">Community garden initiative</div>
                <div className="trending-meta">
                  <span className="trending-comments">24 comments</span>
                  <span className="trending-time">8h ago</span>
                </div>
              </motion.div>
            </div>
          </Card>

          {/* Upcoming Events */}
          <Card className="side-card">
            <div className="card-header">
              <h3 className="card-title">
                <FiCalendar className="card-icon" /> Upcoming Events
              </h3>
            </div>
            <div className="card-content">
              <motion.div className="event-item" whileHover={{ x: 5, backgroundColor: "var(--muted)" }}>
                <div className="event-title">Community Meeting</div>
                <div className="event-meta">
                  <div className="event-date">
                    <FiCalendar className="event-meta-icon" />
                    <span>Mar 15, 7:30 PM</span>
                  </div>
                  <div className="event-location">
                    <FiMapPin className="event-meta-icon" />
                    <span>Town Hall</span>
                  </div>
                </div>
              </motion.div>
              <motion.div className="event-item" whileHover={{ x: 5, backgroundColor: "var(--muted)" }}>
                <div className="event-title">Spring Festival</div>
                <div className="event-meta">
                  <div className="event-date">
                    <FiCalendar className="event-meta-icon" />
                    <span>Apr 2, 10:00 AM</span>
                  </div>
                  <div className="event-location">
                    <FiMapPin className="event-meta-icon" />
                    <span>Central Park</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </Card>

          {/* Announcements */}
          <Card className="side-card">
            <div className="card-header">
              <h3 className="card-title">
                <IoMdMegaphone className="card-icon" /> Announcements
              </h3>
            </div>
            <div className="card-content">
              <motion.div className="announcement-item" whileHover={{ x: 5, backgroundColor: "var(--muted)" }}>
                <div className="announcement-title">Water maintenance scheduled</div>
                <div className="announcement-meta">
                  <FiClock className="announcement-meta-icon" />
                  <span>Mar 12, 10:00 AM - 2:00 PM</span>
                </div>
              </motion.div>
            </div>
          </Card>

          {/* Emergency Alert */}
          <motion.div
            className="alert-card"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="alert-content">
              <div className="alert-icon-container">
                <FiAlertTriangle className="alert-icon" />
              </div>
              <div className="alert-text">
                <div className="alert-title">Weather Alert</div>
                <div className="alert-message">Severe thunderstorm warning until 8:00 PM</div>
              </div>
            </div>
          </motion.div>

          {/* Raise Ticket Button */}
          <motion.button
            className="full-width-button primary-button"
            onClick={() => navigate("/createPost")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <HiOutlineSparkles className="button-icon" /> Raise Ticket
          </motion.button>

          {/* Newsletter Subscription */}
          <Card className="side-card newsletter-card">
            <div className="newsletter-content">
              <h3 className="newsletter-title">Stay Updated</h3>
              <p className="newsletter-description">Subscribe to our newsletter to get the latest community updates.</p>
              <div className="newsletter-form">
                <input type="email" placeholder="Your email address" className="newsletter-input" />
                <motion.button className="newsletter-button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <FiBell className="newsletter-icon" />
                  <span>Subscribe</span>
                </motion.button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default HomePage

