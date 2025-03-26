"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import {
  Home,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Clock,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Plus,
  MessageSquare,
  Bell,
  ThumbsUp,
  ThumbsDown,
  Search,
  Award,
  Activity,
  Zap,
  Bookmark,
  Gift,
  Users,
  Star,
  HelpCircle,
  Megaphone,
  BarChart2,
  Share2,
  ArrowRight,
  Settings,
  User,
  Coffee,
  Compass,
} from "lucide-react"
import axios from "axios"
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

// Image Carousel Component
const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleNext = () => {
    if (isTransitioning || !images || images.length <= 1) return
    setIsTransitioning(true)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const handlePrev = () => {
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
                src={image || "/placeholder.svg?height=300&width=400"}
                alt={`Image ${index + 1}`}
                className="ts-carousel-image"
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="ts-carousel-button ts-carousel-button-prev"
              aria-label="Previous image"
            >
              <ChevronLeft className="ts-carousel-icon" />
            </button>
            <button onClick={handleNext} className="ts-carousel-button ts-carousel-button-next" aria-label="Next image">
              <ChevronRight className="ts-carousel-icon" />
            </button>
            <div className="ts-carousel-indicators">
              {images.map((_, index) => (
                <div
                  key={`indicator-${index}`}
                  className={`ts-carousel-indicator ${index === currentIndex ? "active" : ""}`}
                  onClick={() => setCurrentIndex(index)}
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

  const handleNext = () => {
    if (isTransitioning || !items || items.length <= 1) return
    setIsTransitioning(true)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length)
    setTimeout(() => setIsTransitioning(false), 600)
  }

  const handlePrev = () => {
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
              <div className="ts-hero-card" onClick={() => navigate(`/post/${item._id}`)}>
                <div className="ts-hero-image">
                  {item.attachments &&
                  item.attachments.length > 0 &&
                  item.attachments[0].fileType?.startsWith("image/") ? (
                    <img src={item.attachments[0].url || "/placeholder.svg?height=500&width=1000"} alt={item.title} />
                  ) : (
                    <div className="ts-hero-image-placeholder">
                      {item.type === "announcement" ? (
                        <Megaphone size={48} />
                      ) : item.type === "poll" ? (
                        <BarChart2 size={48} />
                      ) : item.type === "marketplace" ? (
                        <Gift size={48} />
                      ) : (
                        <Star size={48} />
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
                          <User className="ts-hero-meta-icon" />
                          {item.createdBy?.username || "Anonymous"}
                        </span>
                        <span className="ts-hero-time">
                          <Clock className="ts-hero-meta-icon" />
                          {getTimeAgo(item.createdAt)}
                        </span>
                      </div>
                      <button className="ts-hero-button">
                        Read More <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={handlePrev} className="ts-hero-control ts-hero-control-prev" aria-label="Previous slide">
          <ChevronLeft size={24} />
        </button>
        <button onClick={handleNext} className="ts-hero-control ts-hero-control-next" aria-label="Next slide">
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="ts-hero-indicators">
        {items.map((_, index) => (
          <button
            key={`hero-indicator-${index}`}
            className={`ts-hero-indicator ${index === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

// Post Card Component
const PostCard = ({ post, navigate }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const renderPostContent = () => {
    return (
      <div className="ts-post-content">
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

        <h4 className="ts-post-title">{post.title}</h4>
        <p className="ts-post-text">{post.description}</p>

        {post.attachments && post.attachments.length > 0 && (
          <ImageCarousel
            images={post.attachments
              .filter((attachment) => attachment.fileType?.startsWith("image/"))
              .map((attachment) => attachment.url)}
          />
        )}

        {renderPostSpecificContent(post)}

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
            <ThumbsUp className={`ts-action-icon ${isAnimating ? 'animate-bounce' : ''}`} />
            <span>{post.upVotes || 0}</span>
          </button>
          <button className="ts-action-button" id={`downvote-${post._id}`}>
            <ThumbsDown className="ts-action-icon" />
            <span>{post.downVotes || 0}</span>
          </button>
          <button className="ts-action-button" id={`comment-${post._id}`}>
            <MessageSquare className="ts-action-icon" />
            <span>{post.commentCount || 0}</span>
          </button>
          <div className="ts-action-spacer"></div>
          <button className="ts-action-button" id={`share-${post._id}`}>
            <Share2 className="ts-action-icon" />
          </button>
          <button className="ts-action-button" id={`bookmark-${post._id}`}>
            <Bookmark className="ts-action-icon" />
          </button>
        </div>
      </div>
    )
  }

  const renderPostSpecificContent = (post) => {
    switch (post.type) {
      case "poll":
        return post.poll ? (
          <div className="ts-poll-details">
            <h5 className="ts-poll-question">{post.poll.question}</h5>
            <div className="ts-poll-options">
              {post.poll.options &&
                post.poll.options.map((option, index) => (
                  <div key={`poll-option-${post._id}-${index}`} className="ts-poll-option">
                    <div className="ts-poll-option-header">
                      <span>{option.text}</span>
                      <span>{option.percentage}%</span>
                    </div>
                    <div className="ts-poll-option-bar">
                      <div
                        className={`ts-poll-option-progress ts-poll-color-${index % 4}`}
                        style={{ width: `${option.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
            <div className="ts-poll-meta">
              <div className="ts-poll-votes">
                <Activity className="ts-poll-icon" />
                <span>{post.poll.totalVotes} votes</span>
              </div>
              <div className="ts-poll-time-left">
                <Clock className="ts-poll-icon" />
                <span>{post.poll.timeLeft?.formatted || "Closed"}</span>
              </div>
            </div>
          </div>
        ) : null

      case "announcement":
        return post.event ? (
          <div className="ts-event-info">
            <div className="ts-event-info-item">
              <Calendar className="ts-event-icon" />
              <span>{post.event.formattedDate}</span>
            </div>
            {post.event.time && (
              <div className="ts-event-info-item">
                <Clock className="ts-event-icon" />
                <span>{post.event.time}</span>
              </div>
            )}
            {post.event.location && (
              <div className="ts-event-info-item">
                <MapPin className="ts-event-icon" />
                <span>{post.event.location}</span>
              </div>
            )}
            <div className="ts-event-rsvp">
              <Users className="ts-event-icon" />
              <span>{post.event.rsvpCount || 0} people attending</span>
            </div>
          </div>
        ) : null

      case "marketplace":
        return post.marketplace ? (
          <div className="ts-marketplace-details">
            <div className="ts-marketplace-price">
              <span>${post.marketplace.price}</span>
            </div>
            {post.marketplace.location && (
              <div className="ts-marketplace-location">
                <MapPin className="ts-location-icon" />
                <span>{post.marketplace.location}</span>
              </div>
            )}
          </div>
        ) : null

      default:
        return null
    }
  }

  return (
    <div
      className={`ts-post-card ts-post-card-${post.type} ${isHovered ? "hovered" : ""}`}
      onClick={() => navigate(`/post/${post._id}`)}
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
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("all")
  const [posts, setPosts] = useState([])
  const [trendingPosts, setTrendingPosts] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [county, setCounty] = useState("")
  const [loading, setLoading] = useState(true)
  const { token, user } = useSelector((state) => state.user)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    // Check system preference for dark mode
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDarkMode(prefersDark)

    if (prefersDark) {
      document.documentElement.classList.add("dark")
    }

    // Listen for changes in system preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (e) => {
      setIsDarkMode(e.matches)
      if (e.matches) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
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

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Filter posts based on active tab
  const filteredPosts = posts.filter((post) => {
    if (activeTab === "all") return true
    if (activeTab === "polls") return post.type === "poll"
    if (activeTab === "announcements") return post.type === "announcement"
    if (activeTab === "suggestions") return post.type === "suggestion"
    if (activeTab === "marketplace") return post.type === "marketplace"
    if (activeTab === "events") return post.type === "announcement" && post.event
    return true
  })

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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.remove("dark")
    } else {
      document.documentElement.classList.add("dark")
    }
  }

  return (
    <div className="ts-home-container">
      {/* Header Section */}
      <header className={`ts-home-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="ts-header-content">
          <div className="ts-header-text">
            <h1 className="ts-home-title">
              Welcome to <span className="ts-gradient-text">TownSquare</span>
            </h1>
            <div className="ts-title-underline"></div>
            <p className="ts-home-subtitle">Your community platform for {county || "your local area"}</p>
          </div>
          <div className="ts-header-actions">
            <button
              className="ts-theme-toggle"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              id="theme-toggle"
            >
              {isDarkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ts-theme-icon"
                >
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ts-theme-icon"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
            <button className="ts-create-button" onClick={() => navigate("/createPost")} id="create-post-button">
              <Plus className="ts-button-icon" />
              <span>Create Post</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="ts-tab-navigation">
          <button
            className={`ts-tab-button ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
            id="tab-all"
          >
            <Home className="ts-tab-icon" />
            <span>All</span>
          </button>
          <button
            className={`ts-tab-button ${activeTab === "suggestions" ? "active" : ""}`}
            onClick={() => setActiveTab("suggestions")}
            id="tab-suggestions"
          >
            <Zap className="ts-tab-icon" />
            <span>Suggestions</span>
          </button>
          <button
            className={`ts-tab-button ${activeTab === "polls" ? "active" : ""}`}
            onClick={() => setActiveTab("polls")}
            id="tab-polls"
          >
            <BarChart2 className="ts-tab-icon" />
            <span>Polls</span>
          </button>
          <button
            className={`ts-tab-button ${activeTab === "announcements" ? "active" : ""}`}
            onClick={() => setActiveTab("announcements")}
            id="tab-announcements"
          >
            <Megaphone className="ts-tab-icon" />
            <span>Announcements</span>
          </button>
          <button
            className={`ts-tab-button ${activeTab === "marketplace" ? "active" : ""}`}
            onClick={() => setActiveTab("marketplace")}
            id="tab-marketplace"
          >
            <Gift className="ts-tab-icon" />
            <span>Marketplace</span>
          </button>
          <button
            className={`ts-tab-button ${activeTab === "events" ? "active" : ""}`}
            onClick={() => setActiveTab("events")}
            id="tab-events"
          >
            <Calendar className="ts-tab-icon" />
            <span>Events</span>
          </button>
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
              <div className="ts-quick-link" onClick={() => navigate("/events")} id="quick-link-events">
                <div className="ts-quick-link-icon">
                  <Calendar />
                </div>
                <span>Events</span>
              </div>
              <div className="ts-quick-link" onClick={() => navigate("/marketplace")} id="quick-link-marketplace">
                <div className="ts-quick-link-icon">
                  <Gift />
                </div>
                <span>Marketplace</span>
              </div>
              <div className="ts-quick-link" onClick={() => navigate("/polls")} id="quick-link-polls">
                <div className="ts-quick-link-icon">
                  <BarChart2 />
                </div>
                <span>Polls</span>
              </div>
              <div className="ts-quick-link" onClick={() => navigate("/announcements")} id="quick-link-announcements">
                <div className="ts-quick-link-icon">
                  <Megaphone />
                </div>
                <span>Announcements</span>
              </div>
              <div className="ts-quick-link" onClick={() => navigate("/suggestions")} id="quick-link-suggestions">
                <div className="ts-quick-link-icon">
                  <Zap />
                </div>
                <span>Suggestions</span>
              </div>
              <div className="ts-quick-link" onClick={() => navigate("/explore")} id="quick-link-explore">
                <div className="ts-quick-link-icon">
                  <Compass />
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
                    View All <ChevronRight className="ts-button-icon-small" />
                  </button>
                </div>

                {filteredPosts.length === 0 ? (
                  <div className="ts-empty-state">
                    <div className="ts-empty-icon-container">
                      <Search className="ts-empty-icon" />
                    </div>
                    <h3>No posts found</h3>
                    <p>Be the first to create a post in {county || "your area"}!</p>
                    <button className="ts-create-button" onClick={() => navigate("/createPost")} id="create-post-empty">
                      <Plus className="ts-button-icon" />
                      <span>Create Post</span>
                    </button>
                  </div>
                ) : (
                  <div className="ts-posts-container">
                    {filteredPosts.map((post) => (
                      <PostCard key={`post-card-${post._id}`} post={post} navigate={navigate} />
                    ))}
                  </div>
                )}
              </main>

              {/* Sidebar */}
              <aside className="ts-sidebar">
                {/* Enhanced User Profile Card */}
                <div className="ts-profile-card">
                  <div className="ts-profile-header">
                    <div className="ts-profile-avatar">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.username} />
                      ) : (
                        <User className="ts-profile-avatar-icon" />
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
                      <Settings className="ts-profile-settings-icon" />
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
                        style={{ width: `${Math.min((user?.reputation || 0) / 10, 100)}%` }}
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
                      <TrendingUp className="ts-section-icon" />
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
                            onClick={() => navigate(`/post/${post._id}`)}
                          >
                            <div className="ts-trending-content">
                              <h3 className="ts-trending-title">{post.title}</h3>
                              <div className="ts-trending-meta">
                                <span className="ts-trending-comments">
                                  <MessageSquare className="ts-meta-icon" />
                                  {post.commentCount || 0}
                                </span>
                                <span className="ts-trending-time">
                                  <Clock className="ts-meta-icon" />
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
                      <Calendar className="ts-section-icon" />
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
                            onClick={() => navigate(`/post/${event._id}`)}
                          >
                            <div className="ts-event-content">
                              <h3 className="ts-event-title">{event.title}</h3>
                              <div className="ts-event-meta">
                                <div className="ts-event-date">
                                  <Calendar className="ts-meta-icon" />
                                  <span>{formatDate(event.date)}</span>
                                </div>
                                {event.location && (
                                  <div className="ts-event-location">
                                    <MapPin className="ts-meta-icon" />
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
                    <AlertTriangle className="ts-alert-icon" />
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
                      <Bell className="ts-button-icon" />
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
                        <Users className="ts-stat-icon" />
                      </div>
                      <div className="ts-stat-info">
                        <span className="ts-stat-value">1,234</span>
                        <span className="ts-stat-label">Members</span>
                      </div>
                    </div>
                    <div className="ts-stat-item" id="stat-posts">
                      <div className="ts-stat-icon-container">
                        <MessageSquare className="ts-stat-icon" />
                      </div>
                      <div className="ts-stat-info">
                        <span className="ts-stat-value">5,678</span>
                        <span className="ts-stat-label">Posts</span>
                      </div>
                    </div>
                    <div className="ts-stat-item" id="stat-satisfaction">
                      <div className="ts-stat-icon-container">
                        <Award className="ts-stat-icon" />
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
                    <Coffee className="ts-support-icon" />
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
            <HelpCircle className="ts-footer-icon" />
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