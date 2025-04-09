"use client"

import { useState, useEffect } from "react"
import "./AnnouncementsPage.css"
import { fetchAnnouncements } from "../Apis/postApi"
import {
  FiBell,
  FiCalendar,
  FiMapPin,
  FiChevronDown,
  FiChevronUp,
  FiAlertTriangle,
  FiPlus,
  FiShare2,
  FiBookmark,
  FiClock,
  FiSearch,
  FiFilter,
  FiCheckCircle,
  FiInfo,
  FiMessageSquare,
  FiUsers,
  FiExternalLink,
  FiThumbsUp,
  FiEye,
  FiHeart,
  FiAward,
  FiZap,
  FiGrid,
  FiList,
  FiTag,
  FiX,
  FiRefreshCw,
} from "react-icons/fi"
import { motion, AnimatePresence } from "framer-motion"

function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterActive, setFilterActive] = useState(false)
  const [filter, setFilter] = useState("all")
  const [viewMode, setViewMode] = useState("grid")

  // Fetch announcements on component mount
  useEffect(() => {
    const getAnnouncements = async () => {
      setIsLoading(true)
      try {
        const data = await fetchAnnouncements()
        // Add showDescription property to each announcement
        const processedData = data.map((announcement) => ({
          ...announcement,
          showDescription: false,
        }))
        setAnnouncements(processedData)
      } catch (error) {
        console.error("Failed to fetch announcements:", error)
      } finally {
        setIsLoading(false)
      }
    }
    getAnnouncements()
  }, [])

  // Function to toggle description visibility
  const toggleDescription = (id, event) => {
    // Prevent event bubbling if clicking on buttons
    if (event.target.closest("button")) {
      event.stopPropagation()
      return
    }

    setAnnouncements((prevAnnouncements) =>
      prevAnnouncements.map((announcement) =>
        announcement._id === id ? { ...announcement, showDescription: !announcement.showDescription } : announcement,
      ),
    )
  }

  // Filter announcements based on search query and filter
  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      searchQuery === "" ||
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase())

    if (filter === "all") return matchesSearch
    if (filter === "important") return matchesSearch && announcement.important
    if (filter === "events") return matchesSearch && announcement.event

    return matchesSearch
  })

  // Format date for better display
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Calculate time ago for announcements
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`

    return formatDate(dateString)
  }

  return (
    <div className="announcements-container">
      <motion.div
        className="announcements-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="announcements-header-text">
          <h1 className="announcements-title">
            <FiZap className="title-icon" />
            Government <span className="gradient-text">Announcements</span>
          </h1>
          <div className="title-underline"></div>
          <p className="announcements-subtitle">Stay informed with official updates from your local government</p>
        </div>
        <motion.button
          className="announcements-subscribe-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiBell className="button-icon" />
          <span>Subscribe</span>
        </motion.button>
      </motion.div>

      <motion.div
        className="announcements-search-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="announcements-search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search announcements..."
            className="announcements-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <motion.button
              className="search-clear-button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <FiX size={16} />
            </motion.button>
          )}
        </div>

        <div className="announcements-action-buttons">
          <motion.button
            className={`view-button ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiGrid className="view-icon" size={18} />
          </motion.button>
          <motion.button
            className={`view-button ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
            aria-label="List view"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiList className="view-icon" size={18} />
          </motion.button>
          <motion.button
            className={`filter-button ${filterActive ? "active" : ""}`}
            onClick={() => setFilterActive(!filterActive)}
            aria-label="Filter"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiFilter className="filter-icon" size={18} />
          </motion.button>
        </div>

        <AnimatePresence>
          {filterActive && (
            <motion.div
              className="filter-dropdown"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="filter-header">
                <h4>Filter Announcements</h4>
                <button
                  className="close-filter-button"
                  onClick={() => setFilterActive(false)}
                  aria-label="Close filter"
                >
                  <FiX size={18} />
                </button>
              </div>
              <div className="filter-content">
                <motion.button
                  className={`filter-option ${filter === "all" ? "selected" : ""}`}
                  onClick={() => {
                    setFilter("all")
                    setFilterActive(false)
                  }}
                  whileHover={{ x: 5 }}
                >
                  <FiEye className="filter-option-icon" />
                  All Announcements
                </motion.button>
                <motion.button
                  className={`filter-option ${filter === "important" ? "selected" : ""}`}
                  onClick={() => {
                    setFilter("important")
                    setFilterActive(false)
                  }}
                  whileHover={{ x: 5 }}
                >
                  <FiAlertTriangle className="filter-option-icon" />
                  Important Only
                </motion.button>
                <motion.button
                  className={`filter-option ${filter === "events" ? "selected" : ""}`}
                  onClick={() => {
                    setFilter("events")
                    setFilterActive(false)
                  }}
                  whileHover={{ x: 5 }}
                >
                  <FiCalendar className="filter-option-icon" />
                  Events Only
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {isLoading ? (
        <motion.div
          className="announcements-loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="announcements-loader"></div>
          <p>Loading announcements...</p>
        </motion.div>
      ) : filteredAnnouncements.length === 0 ? (
        <motion.div
          className="announcements-empty"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="empty-icon-container">
            <FiInfo className="empty-icon" />
          </div>
          <h3>No announcements found</h3>
          <p>Try adjusting your search or filter criteria</p>
          <motion.button
            className="clear-search-button"
            onClick={() => {
              setSearchQuery("")
              setFilter("all")
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiRefreshCw size={16} className="button-icon" />
            Reset Filters
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          className={`announcements-list ${viewMode === "grid" ? "grid-view" : "list-view"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {filteredAnnouncements.map((announcement, index) => (
            <motion.div
              className={`announcement-card ${announcement.showDescription ? "expanded" : ""}`}
              key={announcement._id}
              onClick={(e) => toggleDescription(announcement._id, e)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="announcement-header">
                <div className="announcement-author">
                  <div className="announcement-avatar-container">
                    <img
                      className="announcement-avatar"
                      src={announcement.createdBy.avatar || "/default-avatar.png"}
                      alt={announcement.createdBy.username}
                    />
                  </div>
                  <div className="announcement-author-info">
                    <div className="announcement-name">{announcement.createdBy.username}</div>
                    <div className="announcement-time">
                      <FiClock className="time-icon" size={14} />
                      {getTimeAgo(announcement.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="announcement-badges">
                  {announcement.important && (
                    <motion.div className="announcement-badge important" whileHover={{ y: -2 }}>
                      <FiAlertTriangle className="badge-icon" size={14} />
                      <span>Important</span>
                    </motion.div>
                  )}

                  {announcement.event && (
                    <motion.div className="announcement-badge event" whileHover={{ y: -2 }}>
                      <FiCalendar className="badge-icon" size={14} />
                      <span>Event</span>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="announcement-content">
                <h3 className="announcement-title">{announcement.title}</h3>

                <AnimatePresence>
                  {announcement.showDescription && (
                    <motion.div
                      className="announcement-details"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="announcement-text">{announcement.content}</p>

                      {announcement.event && (
                        <motion.div
                          className="announcement-event"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          <div className="announcement-event-header">
                            <FiCalendar className="event-icon" />
                            <span>Event Details</span>
                          </div>

                          <div className="announcement-event-info">
                            <motion.div className="announcement-event-date" whileHover={{ x: 5 }}>
                              <FiCalendar className="info-icon" size={16} />
                              <span>{formatDate(announcement.event.date)}</span>
                            </motion.div>

                            <motion.div className="announcement-event-location" whileHover={{ x: 5 }}>
                              <FiMapPin className="info-icon" size={16} />
                              <span>{announcement.event.location}</span>
                            </motion.div>
                          </div>

                          <div className="announcement-event-meta">
                            <div className="event-meta-item">
                              <FiUsers className="meta-icon" size={14} />
                              <span>Open to public</span>
                            </div>
                            <div className="event-meta-item">
                              <FiAward className="meta-icon" size={14} />
                              <span>Official event</span>
                            </div>
                            <div className="event-meta-item">
                              <FiTag className="meta-icon" size={14} />
                              <span>Community</span>
                            </div>
                          </div>

                          <div className="announcement-footer">
                            <motion.button
                              className="announcement-secondary-button"
                              onClick={(e) => e.stopPropagation()}
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <FiCalendar className="button-icon" size={16} />
                              <span>Add to Calendar</span>
                            </motion.button>
                            <motion.button
                              className="announcement-primary-button"
                              onClick={(e) => e.stopPropagation()}
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <FiPlus className="button-icon" size={16} />
                              <span>RSVP</span>
                            </motion.button>
                          </div>
                        </motion.div>
                      )}

                      <div className="announcement-actions">
                        <motion.button
                          className="announcement-action-button"
                          onClick={(e) => e.stopPropagation()}
                          whileHover={{ y: -2, backgroundColor: "var(--muted)" }}
                        >
                          <FiThumbsUp className="action-icon" size={16} />
                          <span>Like</span>
                        </motion.button>
                        <motion.button
                          className="announcement-action-button"
                          onClick={(e) => e.stopPropagation()}
                          whileHover={{ y: -2, backgroundColor: "var(--muted)" }}
                        >
                          <FiBookmark className="action-icon" size={16} />
                          <span>Save</span>
                        </motion.button>
                        <motion.button
                          className="announcement-action-button"
                          onClick={(e) => e.stopPropagation()}
                          whileHover={{ y: -2, backgroundColor: "var(--muted)" }}
                        >
                          <FiShare2 className="action-icon" size={16} />
                          <span>Share</span>
                        </motion.button>
                        <motion.button
                          className="announcement-action-button"
                          onClick={(e) => e.stopPropagation()}
                          whileHover={{ y: -2, backgroundColor: "var(--muted)" }}
                        >
                          <FiMessageSquare className="action-icon" size={16} />
                          <span>Comment</span>
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="announcement-toggle">
                  {announcement.showDescription ? (
                    <FiChevronUp className="toggle-icon" size={16} />
                  ) : (
                    <FiChevronDown className="toggle-icon" size={16} />
                  )}
                  <span className="toggle-text">{announcement.showDescription ? "Show less" : "Show more"}</span>
                </div>
              </div>

              <div className="announcement-engagement">
                <div className="engagement-item">
                  <FiHeart className="engagement-icon" size={16} />
                  <span>{Math.floor(Math.random() * 50) + 5}</span>
                </div>
                <div className="engagement-item">
                  <FiMessageSquare className="engagement-icon" size={16} />
                  <span>{Math.floor(Math.random() * 20)}</span>
                </div>
                <div className="engagement-item">
                  <FiEye className="engagement-icon" size={16} />
                  <span>{Math.floor(Math.random() * 500) + 100}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div
        className="announcements-footer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="announcements-stats">
          <motion.div className="stat-item" whileHover={{ y: -5 }}>
            <FiCheckCircle className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{announcements.length}</span>
              <span className="stat-label">Announcements</span>
            </div>
          </motion.div>
          <motion.div className="stat-item" whileHover={{ y: -5 }}>
            <FiAlertTriangle className="stat-icon important" />
            <div className="stat-content">
              <span className="stat-value">{announcements.filter((a) => a.important).length}</span>
              <span className="stat-label">Important</span>
            </div>
          </motion.div>
          <motion.div className="stat-item" whileHover={{ y: -5 }}>
            <FiCalendar className="stat-icon event" />
            <div className="stat-content">
              <span className="stat-value">{announcements.filter((a) => a.event).length}</span>
              <span className="stat-label">Events</span>
            </div>
          </motion.div>
        </div>

        <div className="announcements-links">
          <motion.a href="#" className="footer-link" whileHover={{ x: 3, color: "var(--primary)" }}>
            <FiExternalLink className="link-icon" size={14} />
            <span>Government Portal</span>
          </motion.a>
          <motion.a href="#" className="footer-link" whileHover={{ x: 3, color: "var(--primary)" }}>
            <FiMessageSquare className="link-icon" size={14} />
            <span>Contact Us</span>
          </motion.a>
          <motion.a href="#" className="footer-link" whileHover={{ x: 3, color: "var(--primary)" }}>
            <FiInfo className="link-icon" size={14} />
            <span>About</span>
          </motion.a>
        </div>

        <p className="announcements-copyright">© {new Date().getFullYear()} Local Government. All rights reserved.</p>
      </motion.div>
    </div>
  )
}

export default AnnouncementsPage

