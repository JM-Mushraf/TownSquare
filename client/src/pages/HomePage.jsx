"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useTheme } from "../components/ThemeProvider"
import ThemeToggle from "../components/ThemeToggle"
import "./HomePage.css"

// Helper function to format time ago
const getTimeAgo = (dateString) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  return `${Math.floor(diffInSeconds / 86400)} days ago`
}

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Image Carousel Component
const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleNext = (e) => {
    e.stopPropagation()
    if (isTransitioning || !images || images.length <= 1) return
    setIsTransitioning(true)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const handlePrev = (e) => {
    e.stopPropagation()
    if (isTransitioning || !images || images.length <= 1) return
    setIsTransitioning(true)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 100) {
      handleNext()
    }
    if (touchEnd - touchStart > 100) {
      handlePrev()
    }
  }

  if (!images || images.length === 0) {
    return null
  }

  return (
    <div className="ts-image-carousel">
      <div
        className="ts-carousel-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`ts-carousel-track ${isTransitioning ? "transitioning" : ""}`}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={`image-slide-${index}`} className="ts-carousel-slide">
              <img
                src={image.url || "/placeholder.svg?height=300&width=400"}
                alt={`Image ${index + 1}`}
                className="ts-carousel-image"
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                handlePrev(e)
                e.stopPropagation()
              }}
              className="ts-carousel-button ts-carousel-button-prev"
              aria-label="Previous image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ts-carousel-icon"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button 
              onClick={(e) => {
                handleNext(e)
                e.stopPropagation()
              }}
              className="ts-carousel-button ts-carousel-button-next" 
              aria-label="Next image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ts-carousel-icon"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            <div className="ts-carousel-indicators">
              {images.map((_, index) => (
                <div
                  key={`indicator-${index}`}
                  className={`ts-carousel-indicator ${index === currentIndex ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentIndex(index)
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Hero Carousel Component
const HeroCarousel = ({ items, navigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleNext = (e) => {
    e?.stopPropagation()
    if (isTransitioning || !items || items.length <= 1) return
    setIsTransitioning(true)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length)
    setTimeout(() => setIsTransitioning(false), 600)
  }

  const handlePrev = (e) => {
    e?.stopPropagation()
    if (isTransitioning || !items || items.length <= 1) return
    setIsTransitioning(true)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length)
    setTimeout(() => setIsTransitioning(false), 600)
  }

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 100) {
      handleNext()
    }
    if (touchEnd - touchStart > 100) {
      handlePrev()
    }
  }

  useEffect(() => {
    // Auto-advance the carousel
    const interval = setInterval(() => {
      handleNext()
    }, 5000)

    return () => clearInterval(interval)
  }, [currentIndex])

  if (!items || items.length === 0) {
    return null
  }

  return (
    <div className="ts-hero-carousel">
      <div
        className="ts-hero-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`ts-hero-track ${isTransitioning ? "transitioning" : ""}`}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {items.map((item, index) => (
            <div key={`hero-slide-${index}`} className="ts-hero-slide">
              <div
                className="ts-hero-card"
                onClick={() => {
                  if (item.type === "announcements") {
                    navigate(`/announcements/`)
                  } else if (item.type === "poll") {
                    navigate(`/surveys/`)
                  } else if (item.type === "marketplace") {
                    navigate(`/marketplace/`)
                  } else if (item.type === "survey") {
                    navigate(`/surveys/`)
                  } else {
                    navigate(`/post/${item._id}`)
                  }
                }}
              >
                <div className="ts-hero-image">
                  {item.attachments &&
                  item.attachments.length > 0 &&
                  item.attachments[0].fileType?.startsWith("image/") ? (
                    <img
                      src={item.attachments[0].url || "/placeholder.svg?height=500&width=1000" || "/placeholder.svg"}
                      alt={item.title}
                    />
                  ) : (
                    <div className="ts-hero-image-placeholder">
                      {item.type === "announcements" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 11l18-5v12L3 14v-3z"></path>
                          <path d="M11.6 16.8a3 3 0 11-5.8-1.6"></path>
                        </svg>
                      ) : item.type === "poll" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 20V10"></path>
                          <path d="M12 20V4"></path>
                          <path d="M6 20v-6"></path>
                        </svg>
                      ) : item.type === "marketplace" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4"></path>
                          <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path>
                          <path d="M18 12a2 2 0 000 4h4v-4h-4z"></path>
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="48"
                          height="48"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      )}
                    </div>
                  )}
                  <div className="ts-hero-overlay">
                    <div className="ts-hero-content">
                      <span className={`ts-hero-badge ts-hero-badge-${item.type}`}>{item.type}</span>
                      <h2 className="ts-hero-title">{item.title}</h2>
                      <p className="ts-hero-description">{item.description.substring(0, 120)}...</p>
                      <div className="ts-hero-meta">
                        <span className="ts-hero-author">
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
                            className="ts-hero-meta-icon"
                          >
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          {item.createdBy?.username || "Anonymous"}
                        </span>
                        <span className="ts-hero-time">
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
                            className="ts-hero-meta-icon"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          {getTimeAgo(item.createdAt)}
                        </span>
                      </div>
                      <button className="ts-hero-button">
                        Read More
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
                        >
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={(e) => {
            handlePrev(e)
            e.stopPropagation()
          }} 
          className="ts-hero-control ts-hero-control-prev" 
          aria-label="Previous slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button 
          onClick={(e) => {
            handleNext(e)
            e.stopPropagation()
          }} 
          className="ts-hero-control ts-hero-control-next" 
          aria-label="Next slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <div className="ts-hero-indicators">
        {items.map((_, index) => (
          <button
            key={`hero-indicator-${index}`}
            className={`ts-hero-indicator ${index === currentIndex ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation()
              setCurrentIndex(index)
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

// Post Card Component - Renders different layouts based on post type
const PostCard = ({ post, navigate }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  // Common post header component
  const renderPostHeader = () => {
    return (
      <div className="ts-post-header">
        <div className="ts-post-avatar">
          {post.createdBy?.avatar ? (
            <img src={post.createdBy.avatar || "/placeholder.svg"} alt={post.createdBy.username} />
          ) : (
            <span>{post.createdBy?.username?.charAt(0) || "U"}</span>
          )}
        </div>
        <div className="ts-post-author-info">
          <h3 className="ts-post-author">{post.createdBy?.username || "Anonymous"}</h3>
          <div className="ts-post-meta">
            <span className={`ts-post-type ts-post-type-${post.type}`}>{post.type}</span>
            <span className="ts-post-time">{getTimeAgo(post.createdAt)}</span>
          </div>
        </div>
      </div>
    )
  }

  // Common post actions component
  const renderPostActions = () => {
    return (
      <div className="ts-post-actions">
        <button
          className="ts-action-button"
          id={`upvote-${post._id}`}
          onClick={(e) => {
            e.stopPropagation()
            setIsAnimating(true)
            setTimeout(() => setIsAnimating(false), 1000)
          }}
        >
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
            className={`ts-action-icon ${isAnimating ? "animate-bounce" : ""}`}
          >
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
          </svg>
          <span>{post.upVotes || 0}</span>
        </button>
        <button className="ts-action-button" id={`downvote-${post._id}`}>
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
            className="ts-action-icon"
          >
            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
          </svg>
          <span>{post.downVotes || 0}</span>
        </button>
        <button className="ts-action-button" id={`comment-${post._id}`}>
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
            className="ts-action-icon"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>{post.commentCount || 0}</span>
        </button>
        <div className="ts-action-spacer"></div>
        <button
          className={`ts-action-button ${isBookmarked ? "active" : ""}`}
          id={`bookmark-${post._id}`}
          onClick={(e) => {
            e.stopPropagation()
            setIsBookmarked(!isBookmarked)
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={isBookmarked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ts-action-icon"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
        <button className="ts-action-button" id={`share-${post._id}`}>
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
            className="ts-action-icon"
          >
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
        </button>
      </div>
    )
  }

  // Render attachments/images if available
  const renderAttachments = () => {
    if (post.attachments && post.attachments.length > 0) {
      return (
        <ImageCarousel images={post.attachments.filter((attachment) => attachment.fileType?.startsWith("image/"))} />
      )
    }
    return null
  }

  // Render post content based on type
  const renderPostContent = () => {
    switch (post.type) {
      case "issue":
        return renderIssuePost()
      case "poll":
        return renderPollPost()
      case "marketplace":
        return renderMarketplacePost()
      case "announcements":
        return renderAnnouncementPost()
      default:
        return renderGeneralPost()
    }
  }

  // Issue post layout
  const renderIssuePost = () => {
    return (
      <div className="ts-post-content ts-issue-post">
        {renderPostHeader()}
        <div className="ts-issue-container">
          <div className="ts-issue-status">
            <span className="ts-issue-badge">Issue</span>
            <span className="ts-issue-priority">High Priority</span>
          </div>
          <h4 className="ts-post-title">{post.title}</h4>
          <p className="ts-post-text">{post.description}</p>
          {renderAttachments()}
          <div className="ts-issue-details">
            <div className="ts-issue-detail">
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
                className="ts-issue-icon"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                <path d="M12 6v6l4 2"></path>
              </svg>
              <span>Status: Open</span>
            </div>
            <div className="ts-issue-detail">
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
                className="ts-issue-icon"
              >
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Assigned to: Community</span>
            </div>
          </div>
        </div>
        {renderPostActions()}
      </div>
    )
  }

  // Poll post layout - Using the survey-page styling
  const renderPollPost = () => {
    // Check if poll is active
    const isPollActive = post.poll?.isActive !== false && post.poll?.timeLeft?.formatted !== "Closed"

    return (
      <div className="ts-post-content ts-poll-post">
        {renderPostHeader()}
        <h4 className="ts-post-title">{post.title}</h4>
        <p className="ts-post-text">{post.description}</p>
        {renderAttachments()}

        {post.poll && (
          <div className="ts-poll-details">
            <div className="ts-poll-status">
              {isPollActive ? (
                <span className="ts-poll-badge ts-poll-badge-active">Active Poll</span>
              ) : (
                <span className="ts-poll-badge ts-poll-badge-closed">Closed</span>
              )}
              {post.poll.timeLeft?.formatted && (
                <span className="ts-poll-time-remaining">{post.poll.timeLeft.formatted}</span>
              )}
            </div>
            <h5 className="ts-poll-question">{post.poll.question}</h5>
            <div className="ts-poll-options">
              {post.poll.options &&
                post.poll.options.map((option, index) => (
                  <div key={`poll-option-${post._id}-${index}`} className="ts-poll-option">
                    <div className="ts-poll-option-header">
                      <span>{option.text}</span>
                      <span>{option.votes || 0} votes</span>
                    </div>
                    <div className="ts-poll-option-bar">
                      <div
                        className={`ts-poll-option-progress ts-poll-color-${index % 4}`}
                        style={{ width: `${option.percentage || 0}%` }}
                      ></div>
                    </div>
                    {isPollActive && (
                      <button
                        className="ts-poll-vote-button"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle vote submission
                          alert(`Voted for: ${option.text}`)
                          // In a real app, you would call an API to register the vote
                        }}
                      >
                        Vote
                      </button>
                    )}
                  </div>
                ))}
            </div>
            <div className="ts-poll-meta">
              <div className="ts-poll-votes">
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
                  className="ts-poll-icon"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                <span>{post.poll.totalVotes || 0} votes</span>
              </div>
              <div className="ts-poll-time-left">
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
                  className="ts-poll-icon"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>{isPollActive ? "Poll is active" : "Poll is closed"}</span>
              </div>
            </div>
          </div>
        )}
        {renderPostActions()}
      </div>
    )
  }

  // Marketplace post layout - Using the marketplace styling
  const renderMarketplacePost = () => {
    const [showContactForm, setShowContactForm] = useState(false)
    const [contactMessage, setContactMessage] = useState("")

    const handleContactSeller = (e) => {
      e.stopPropagation()
      setShowContactForm(!showContactForm)
    }

    const handleSendMessage = (e) => {
      e.stopPropagation()
      if (contactMessage.trim()) {
        // In a real app, you would send this message to the seller
        alert(`Message sent to seller: ${contactMessage}`)
        setContactMessage("")
        setShowContactForm(false)
      }
    }

    return (
      <div className="ts-post-content ts-marketplace-post">
        {renderPostHeader()}
        <h4 className="ts-post-title">{post.title}</h4>

        {renderAttachments()}

        <div className="ts-marketplace-details">
          {post.marketplace && (
            <>
              <div className="ts-marketplace-price">
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
                  className="ts-price-icon"
                >
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                <span>${post.marketplace.price}</span>
                <span className="ts-marketplace-badge">{post.marketplace.itemType || "Sale"}</span>
                {post.marketplace.condition && (
                  <span className="ts-marketplace-condition">{post.marketplace.condition}</span>
                )}
              </div>

              <p className="ts-post-text">{post.description}</p>

              {post.marketplace.location && (
                <div className="ts-marketplace-location">
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
                    className="ts-location-icon"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{post.marketplace.location}</span>
                </div>
              )}

              {post.marketplace.tags && post.marketplace.tags.length > 0 && (
                <div className="ts-marketplace-tags">
                  {post.marketplace.tags.map((tag, index) => (
                    <span key={`tag-${index}`} className="ts-marketplace-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <button className="ts-marketplace-contact-button" onClick={handleContactSeller}>
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
                  className="ts-contact-icon"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Contact Seller
              </button>

              {showContactForm && (
                <div className="ts-marketplace-contact-form" onClick={(e) => e.stopPropagation()}>
                  <textarea
                    className="ts-marketplace-message"
                    placeholder="Write your message to the seller..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    rows={4}
                  ></textarea>
                  <div className="ts-marketplace-form-actions">
                    <button className="ts-marketplace-cancel-button" onClick={handleContactSeller}>
                      Cancel
                    </button>
                    <button className="ts-marketplace-send-button" onClick={handleSendMessage}>
                      Send Message
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        {renderPostActions()}
      </div>
    )
  }

  // Update the Announcement post layout to match the announcements page design
  const renderAnnouncementPost = () => {
    return (
      <div className="ts-post-content ts-announcement-post">
        {renderPostHeader()}
        <div className="ts-announcement-container">
          <div className="ts-announcement-header">
            <h4 className="ts-post-title">{post.title}</h4>
            {post.important && (
              <span className="ts-announcement-badge">
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
                  className="ts-announcement-icon"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Important
              </span>
            )}
          </div>

          <p className="ts-post-text">{post.description}</p>
          {renderAttachments()}

          {post.event && (
            <div className="ts-announcement-event">
              <div className="ts-event-date-badge">
                <div className="ts-event-date-month">
                  {new Date(post.event.date).toLocaleString("default", {
                    month: "short",
                  })}
                </div>
                <div className="ts-event-date-day">{new Date(post.event.date).getDate()}</div>
              </div>
              <div className="ts-event-info">
                <div className="ts-event-info-item">
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
                    className="ts-event-icon"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>{post.event.formattedDate}</span>
                </div>
                {post.event.time && (
                  <div className="ts-event-info-item">
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
                      className="ts-event-icon"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>{post.event.time}</span>
                  </div>
                )}
                {post.event.location && (
                  <div className="ts-event-info-item">
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
                      className="ts-event-icon"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{post.event.location}</span>
                  </div>
                )}
                <div className="ts-event-rsvp">
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
                    className="ts-event-icon"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <span>{post.event.rsvpCount || 0} people attending</span>
                </div>
              </div>
              <div className="ts-event-rsvp-actions">
                <button className="ts-event-rsvp-button ts-event-rsvp-yes">
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
                    className="ts-rsvp-icon"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Going
                </button>
                <button className="ts-event-rsvp-button ts-event-rsvp-maybe">Maybe</button>
                <button className="ts-event-rsvp-button ts-event-rsvp-no">
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
                    className="ts-rsvp-icon"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Not Going
                </button>
              </div>
            </div>
          )}
        </div>
        {renderPostActions()}
      </div>
    )
  }

  // General post layout
  const renderGeneralPost = () => {
    return (
      <div className="ts-post-content">
        {renderPostHeader()}
        <h4 className="ts-post-title">{post.title}</h4>
        <p className="ts-post-text">{post.description}</p>
        {renderAttachments()}
        {renderPostActions()}
      </div>
    )
  }

  return (
    <div
      className={`ts-post-card ts-post-card-${post.type} ${isHovered ? "hovered" : ""}`}
      onClick={() => {
        if (post.type === "announcements") {
          // navigate(`/announcements/${post._id}`)
          navigate(`/announcements/`)
        } else if (post.type === "poll") {
          // navigate(`/surveys/${post._id}`)
          navigate(`/surveys/`)
        } else if (post.type === "marketplace") {
          // navigate(`/marketplace/${post._id}`)
          navigate(`/marketplace/`)
        } else if (post.type === "survey") {
          // navigate(`/surveys/${post._id}`)
          navigate(`/surveys/`)
        }
         else {
          navigate(`/post/${post._id}`)
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id={`post-${post._id}`}
    >
      {renderPostContent()}
    </div>
  )
}

// Main HomePage Component
function HomePage() {
  const [activeTab, setActiveTab] = useState("all")
  const [posts, setPosts] = useState([])
  const [trendingPosts, setTrendingPosts] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [county, setCounty] = useState("")
  const [loading, setLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState(null)
  const [token, setToken] = useState("")
  const [contactStates, setContactStates] = useState({})
  const { isDarkMode, toggleDarkMode } = useTheme()

  // Navigation function to replace useNavigate
  const navigate = (path) => {
    window.location.href = path
  }

  useEffect(() => {
    // Get token from localStorage
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
    }

    // Get user from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Use the API endpoint for fetching posts
        const response = await axios.get("http://localhost:3000/post/getFeed", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setPosts(response.data.posts)
        setTrendingPosts(response.data.trending)
        setUpcomingEvents(response.data.upcomingEvents)
        setCounty(response.data.county)
      } catch (error) {
        console.error("Error fetching posts:", error)
        // Fallback data for development/testing
        setPosts([
          {
            _id: "1",
            title: "Community Garden Project",
            description:
              "Join us in creating a beautiful community garden in the heart of our neighborhood. We need volunteers and donations of plants and gardening tools.",
            type: "announcements",
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            createdBy: { username: "GardenLover", avatar: null },
            upVotes: 24,
            downVotes: 2,
            commentCount: 15,
            important: true,
            event: {
              formattedDate: "Saturday, May 15",
              time: "10:00 AM",
              location: "Central Park",
              rsvpCount: 18,
            },
            attachments: [
              {
                fileType: "image/jpeg",
                url: "/placeholder.svg?height=300&width=500",
              },
            ],
          },
          {
            _id: "2",
            title: "What should we name the new community center?",
            description:
              "The new community center is almost complete and we need your help deciding on a name. Please vote for your favorite option!",
            type: "poll",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            createdBy: {
              username: "TownCouncil",
              avatar: "/placeholder.svg?height=50&width=50",
            },
            upVotes: 56,
            downVotes: 0,
            commentCount: 32,
            poll: {
              question: "What name do you prefer?",
              options: [
                { text: "Unity Center", percentage: 45, votes: 56 },
                { text: "Harmony Hall", percentage: 30, votes: 37 },
                { text: "Townsquare Hub", percentage: 20, votes: 25 },
                { text: "Other (comment below)", percentage: 5, votes: 6 },
              ],
              totalVotes: 124,
              timeLeft: { formatted: "2 days left" },
            },
          },
          {
            _id: "3",
            title: "Vintage Bicycle for Sale",
            description:
              "Beautiful vintage bicycle in excellent condition. Perfect for collectors or anyone who appreciates classic design.",
            type: "marketplace",
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            createdBy: { username: "VintageCollector", avatar: null },
            upVotes: 12,
            downVotes: 1,
            commentCount: 8,
            marketplace: {
              price: 250,
              location: "Downtown",
              itemType: "sale",
              tags: ["vintage", "bicycle", "collectible"],
            },
            attachments: [
              {
                fileType: "image/jpeg",
                url: "/placeholder.svg?height=300&width=500",
              },
            ],
          },
          {
            _id: "4",
            title: "Pothole on Main Street needs fixing",
            description:
              "There's a large pothole on Main Street near the intersection with Oak Avenue. It's causing damage to vehicles and is a safety hazard.",
            type: "issue",
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            createdBy: { username: "ConcernedCitizen", avatar: null },
            upVotes: 35,
            downVotes: 0,
            commentCount: 12,
            attachments: [
              {
                fileType: "image/jpeg",
                url: "/placeholder.svg?height=300&width=500",
              },
            ],
          },
          {
            _id: "5",
            title: "Weekend Hiking Group",
            description: "Looking for people interested in joining a weekend hiking group. All skill levels welcome!",
            type: "general",
            createdAt: new Date(Date.now() - 345600000).toISOString(),
            createdBy: {
              username: "NatureExplorer",
              avatar: "/placeholder.svg?height=50&width=50",
            },
            upVotes: 28,
            downVotes: 2,
            commentCount: 22,
            attachments: [
              {
                fileType: "image/jpeg",
                url: "/placeholder.svg?height=300&width=500",
              },
            ],
          },
        ])
        setTrendingPosts([
          {
            _id: "6",
            title: "Road Construction Update",
            createdAt: new Date(Date.now() - 43200000).toISOString(),
            commentCount: 47,
          },
          {
            _id: "7",
            title: "New Restaurant Opening Next Week",
            createdAt: new Date(Date.now() - 129600000).toISOString(),
            commentCount: 35,
          },
        ])
        setUpcomingEvents([
          {
            _id: "8",
            title: "Summer Festival",
            date: new Date(Date.now() + 604800000).toISOString(),
            location: "City Park",
          },
          {
            _id: "9",
            title: "Farmers Market",
            date: new Date(Date.now() + 172800000).toISOString(),
            location: "Main Street",
          },
        ])
        setCounty("Springfield County")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Filter posts based on active tab
  const filteredPosts = posts.filter((post) => {
    if (activeTab === "all") return true
    if (activeTab === "polls") return post.type === "poll" && post.poll?.isActive !== false
    if (activeTab === "announcements") return post.type === "announcements"
    if (activeTab === "suggestions") return post.type === "suggestion"
    if (activeTab === "marketplace") return post.type === "marketplace"
    if (activeTab === "events") return post.type === "announcements" && post.event
    if (activeTab === "issues") return post.type === "issue"
    return true
  })

  const handleContactSeller = (postId) => (e) => {
    e.stopPropagation()
    setContactStates((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        showContactForm: !prev[postId]?.showContactForm,
      },
    }))
  }

  const handleSendMessage = (postId) => (e) => {
    e.stopPropagation()
    if (contactStates[postId]?.contactMessage?.trim()) {
      // In a real app, you would send this message to the seller
      alert(`Message sent to seller: ${contactStates[postId].contactMessage}`)
      setContactStates((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          contactMessage: "",
          showContactForm: false,
        },
      }))
    }
  }

  const handleContactMessageChange = (postId) => (e) => {
    setContactStates((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        contactMessage: e.target.value,
      },
    }))
  }

  return (
    <div className="ts-home-container">
      {/* Header Section */}
      <header className={`ts-home-header ${isScrolled ? "scrolled" : ""}`}>
        <div className="ts-header-content">
          <div className="ts-header-text">
            <h1 className="ts-home-title">
              Welcome to <span className="ts-gradient-text">TownSquare</span>
            </h1>
            <div className="ts-title-underline"></div>
            <p className="ts-home-subtitle">Your community platform for {county || "your local area"}</p>
          </div>
          <div className="ts-header-actions">
            <ThemeToggle />
            <button className="ts-create-button" onClick={() => navigate("/createPost")} id="create-post-button">
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
                className="ts-button-icon"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Create Post</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="ts-home-content">
        {loading ? (
          <div className="ts-loading-container">
            <div className="ts-loading-spinner"></div>
            <p>Loading community content...</p>
          </div>
        ) : (
          <>
            {/* Hero Carousel */}
            {posts.length > 0 && (
              <HeroCarousel
                items={posts.filter((post) => post.attachments && post.attachments.length > 0).slice(0, 5)}
                navigate={navigate}
              />
            )}

            {/* Quick Links */}
            <div className="ts-quick-links">
              <div className="ts-quick-link" onClick={() => setActiveTab("all")} id="quick-link-all">
                <div className="ts-quick-link-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </div>
                <span>All</span>
              </div>
              <div className="ts-quick-link" onClick={() => setActiveTab("marketplace")} id="quick-link-marketplace">
                <div className="ts-quick-link-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4"></path>
                    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path>
                    <path d="M18 12a2 2 0 000 4h4v-4h-4z"></path>
                  </svg>
                </div>
                <span>Marketplace</span>
              </div>
              <div className="ts-quick-link" onClick={() => setActiveTab("polls")} id="quick-link-polls">
                <div className="ts-quick-link-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 20V10"></path>
                    <path d="M12 20V4"></path>
                    <path d="M6 20v-6"></path>
                  </svg>
                </div>
                <span>Polls</span>
              </div>
              <div
                className="ts-quick-link"
                onClick={() => setActiveTab("announcements")}
                id="quick-link-announcements"
              >
                <div className="ts-quick-link-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 11l18-5v12L3 14v-3z"></path>
                    <path d="M11.6 16.8a3 3 0 11-5.8-1.6"></path>
                  </svg>
                </div>
                <span>Announcements</span>
              </div>
              <div className="ts-quick-link" onClick={() => setActiveTab("issues")} id="quick-link-issues">
                <div className="ts-quick-link-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                </div>
                <span>Issues</span>
              </div>
              <div className="ts-quick-link" onClick={() => navigate("/explore")} id="quick-link-explore">
                <div className="ts-quick-link-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                  </svg>
                </div>
                <span>Explore</span>
              </div>
            </div>

            <div className="ts-content-grid">
              {/* Main Feed */}
              <main className="ts-main-feed">
                <div className="ts-section-header">
                  <h2 className="ts-section-title">Community Feed</h2>
                  <button className="ts-view-all-button" onClick={() => navigate("/feed")} id="view-all-feed">
                    View All
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
                      className="ts-button-icon-small"
                    >
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>

                {filteredPosts.length === 0 ? (
                  <div className="ts-empty-state">
                    <div className="ts-empty-icon-container">
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
                        className="ts-empty-icon"
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </div>
                    <h3>No posts found</h3>
                    <p>Be the first to create a post in {county || "your area"}!</p>
                    <button className="ts-create-button" onClick={() => navigate("/createPost")} id="create-post-empty">
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
                        className="ts-button-icon"
                      >
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      <span>Create Post</span>
                    </button>
                  </div>
                ) : (
                  <div className="ts-posts-container">
                    {filteredPosts.map((post) => {
                      const postId = post._id
                      return (
                        <PostCard
                          key={`post-card-${postId}`}
                          post={{
                            ...post,
                            showContactForm: contactStates[postId]?.showContactForm || false,
                            contactMessage: contactStates[postId]?.contactMessage || "",
                            handleContactSeller: handleContactSeller(postId),
                            handleSendMessage: handleSendMessage(postId),
                            handleContactMessageChange: handleContactMessageChange(postId),
                          }}
                          navigate={navigate}
                        />
                      )
                    })}
                  </div>
                )}
              </main>
              <aside className="ts-sidebar">
                {/* Enhanced User Profile Card */}
                <div className="ts-profile-card">
                  <div className="ts-profile-header">
                    <div className="ts-profile-avatar">
                      {user?.avatar ? (
                        <img src={user.avatar || "/placeholder.svg"} alt={user.username} />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="ts-profile-avatar-icon"
                        >
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      )}
                    </div>
                    <div className="ts-profile-info">
                      <h3 className="ts-profile-name">{user?.username || "Guest"}</h3>
                      <p className="ts-profile-location">{county || "Local Area"}</p>
                      <div className="ts-profile-badges">
                        <span className="ts-profile-badge">Active</span>
                        <span className="ts-profile-badge">Verified</span>
                      </div>
                    </div>
                    <button className="ts-profile-settings" onClick={() => navigate("/settings")} id="profile-settings">
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
                        className="ts-profile-settings-icon"
                      >
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
                      </svg>
                    </button>
                  </div>
                  <div className="ts-profile-stats">
                    <div className="ts-profile-stat">
                      <span className="ts-profile-stat-value">{user?.postCount || 0}</span>
                      <span className="ts-profile-stat-label">Posts</span>
                    </div>
                    <div className="ts-profile-stat">
                      <span className="ts-profile-stat-value">{user?.commentCount || 0}</span>
                      <span className="ts-profile-stat-label">Comments</span>
                    </div>
                    <div className="ts-profile-stat">
                      <span className="ts-profile-stat-value">{user?.reputation || 0}</span>
                      <span className="ts-profile-stat-label">Reputation</span>
                    </div>
                  </div>
                  <div className="ts-profile-progress">
                    <div className="ts-progress-bar">
                      <div
                        className="ts-progress-fill"
                        style={{
                          width: `${Math.min((user?.reputation || 0) / 10, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="ts-progress-text">
                      <span>Level {Math.floor((user?.reputation || 0) / 100)}</span>
                      <span>{user?.reputation || 0} points</span>
                    </div>
                  </div>
                </div>

                {/* Trending Section */}
                <div className="ts-sidebar-section">
                  <div className="ts-section-header">
                    <h2 className="ts-section-title">
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
                        className="ts-section-icon"
                      >
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                        <polyline points="17 6 23 6 23 12"></polyline>
                      </svg>
                      Trending Discussions
                    </h2>
                  </div>
                  <div className="ts-section-content">
                    {trendingPosts.length === 0 ? (
                      <div className="ts-empty-section">No trending posts yet</div>
                    ) : (
                      <div className="ts-trending-list">
                        {trendingPosts.slice(0, 5).map((post) => (
                          <div
                            key={`trending-${post._id}`}
                            className="ts-trending-item"
                            onClick={() => {
                              if (post.type === "announcements") {
                                // navigate(`/announcements/${post._id}`)
                                navigate(`/announcements/`)
                              } else if (post.type === "poll") {
                                // navigate(`/surveys/${post._id}`)
                                navigate(`/surveys/`)
                              } else if (post.type === "marketplace") {
                                // navigate(`/marketplace/${post._id}`)
                                navigate(`/marketplace/`)
                              } else if (post.type === "survey") {
                                // navigate(`/surveys/${post._id}`)
                                navigate(`/surveys/`)
                              }
                               else {
                                navigate(`/post/${post._id}`)
                              }
                            }}
                          >
                            <div className="ts-trending-content">
                              <h3 className="ts-trending-title">{post.title}</h3>
                              <div className="ts-trending-meta">
                                <span className="ts-trending-comments">
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
                                    className="ts-meta-icon"
                                  >
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                  </svg>
                                  {post.commentCount || 0}
                                </span>
                                <span className="ts-trending-time">
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
                                    className="ts-meta-icon"
                                  >
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                  </svg>
                                  {getTimeAgo(post.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Upcoming Events */}
                <div className="ts-sidebar-section">
                  <div className="ts-section-header">
                    <h2 className="ts-section-title">
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
                        className="ts-section-icon"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      Upcoming Events
                    </h2>
                    <button className="ts-view-all-button" onClick={() => navigate("/events")} id="view-all-events">
                      View All
                    </button>
                  </div>
                  <div className="ts-section-content">
                    {upcomingEvents.length === 0 ? (
                      <div className="ts-empty-section">No upcoming events</div>
                    ) : (
                      <div className="ts-events-list">
                        {upcomingEvents.slice(0, 3).map((event) => (
                          <div
                            key={`event-${event._id}`}
                            className="ts-event-item"
                            onClick={() => navigate(`/announcements/${event._id}`)}
                          >
                            <div className="ts-event-content">
                              <h3 className="ts-event-title">{event.title}</h3>
                              <div className="ts-event-meta">
                                <div className="ts-event-date">
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
                                    className="ts-meta-icon"
                                  >
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                  </svg>
                                  <span>{formatDate(event.date)}</span>
                                </div>
                                {event.location && (
                                  <div className="ts-event-location">
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
                                      className="ts-meta-icon"
                                    >
                                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                      <circle cx="12" cy="10" r="3"></circle>
                                    </svg>
                                    <span>{event.location}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Alert Card */}
                <div className="ts-alert-card">
                  <div className="ts-alert-icon-container">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ts-alert-icon"
                    >
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  </div>
                  <div className="ts-alert-content">
                    <h3 className="ts-alert-title">Community Updates</h3>
                    <p className="ts-alert-message">
                      Stay tuned for important announcements and updates from your community.
                    </p>
                  </div>
                </div>

                {/* Newsletter Subscription */}
                <div className="ts-newsletter-card">
                  <h3 className="ts-newsletter-title">Stay Updated</h3>
                  <p className="ts-newsletter-description">
                    Subscribe to our newsletter to get the latest community updates.
                  </p>
                  <div className="ts-newsletter-form">
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="ts-newsletter-input"
                      id="newsletter-email"
                    />
                    <button className="ts-newsletter-button" id="newsletter-subscribe">
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
                        className="ts-button-icon"
                      >
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                      </svg>
                      <span>Subscribe</span>
                    </button>
                  </div>
                </div>

                {/* Community Stats */}
                <div className="ts-stats-card">
                  <div className="ts-stats-header">
                    <h3 className="ts-stats-title">Community Stats</h3>
                  </div>
                  <div className="ts-stats-content">
                    <div className="ts-stat-item" id="stat-members">
                      <div className="ts-stat-icon-container">
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
                          className="ts-stat-icon"
                        >
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 00-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                      </div>
                      <div className="ts-stat-info">
                        <span className="ts-stat-value">1,234</span>
                        <span className="ts-stat-label">Members</span>
                      </div>
                    </div>
                    <div className="ts-stat-item" id="stat-posts">
                      <div className="ts-stat-icon-container">
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
                          className="ts-stat-icon"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
                      <div className="ts-stat-info">
                        <span className="ts-stat-value">5,678</span>
                        <span className="ts-stat-label">Posts</span>
                      </div>
                    </div>
                    <div className="ts-stat-item" id="stat-satisfaction">
                      <div className="ts-stat-icon-container">
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
                          className="ts-stat-icon"
                        >
                          <circle cx="12" cy="8" r="7"></circle>
                          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                        </svg>
                      </div>
                      <div className="ts-stat-info">
                        <span className="ts-stat-value">98%</span>
                        <span className="ts-stat-label">Satisfaction</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Support Card */}
                <div className="ts-support-card">
                  <div className="ts-support-icon-container">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="ts-support-icon"
                    >
                      <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                      <line x1="6" y1="1" x2="6" y2="4"></line>
                      <line x1="10" y1="1" x2="10" y2="4"></line>
                      <line x1="14" y1="1" x2="14" y2="4"></line>
                    </svg>
                  </div>
                  <div className="ts-support-content">
                    <h3 className="ts-support-title">Support Your Community</h3>
                    <p className="ts-support-message">Help us keep TownSquare running and improving for everyone.</p>
                    <button className="ts-support-button" id="donate-button">
                      Donate Now
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="ts-home-footer">
        <div className="ts-footer-content">
          <div className="ts-footer-help">
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
              className="ts-footer-icon"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <p>
              Need help?{" "}
              <a href="#" className="ts-footer-link">
                Check our guide
              </a>
            </p>
          </div>
          <div className="ts-footer-copyright">
            <p>© {new Date().getFullYear()} TownSquare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
