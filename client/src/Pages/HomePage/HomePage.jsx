"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { useTheme } from "../../components/ThemeProvider"
import ThemeToggle from "../../components/ThemeToggle"
import { useSelector } from "react-redux"
import "./HomePage.css"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { getTimeAgo,formatDate } from "./Helpers"
import { HeroCarousel } from "./HeroCarousel"
import { ImageCarousel } from "./ImageCarousel"
import { PostCard } from "./PostCard/PostCard"
// Helper function to format time ago

// Image Carousel Component


// Hero Carousel Component

// Post Card Component - Renders different layouts based on post type


// Main HomePage Component
function HomePage() {
  const [activeTab, setActiveTab] = useState("all")
  const [posts, setPosts] = useState([])
  const [trendingPosts, setTrendingPosts] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [county, setCounty] = useState("")
  const [loading, setLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const [contactStates, setContactStates] = useState({})
  const { isDarkMode, toggleDarkMode } = useTheme()
  const [communities, setCommunities] = useState([])
  const { userData } = useSelector((state) => state.user)
  const { token } = useSelector((state) => state.user) // Access token from Redux store

  const navigate = (path) => {
    window.location.href = path
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch posts and other data
        const response = await axios.get("http://localhost:3000/post/getFeed", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data) {
          await setPosts(response.data.posts || [])

          await setTrendingPosts(response.data.trending || [])
          await console.log(posts);
          
          setUpcomingEvents(response.data.upcomingEvents || [])
          setCounty(response.data.county || "")

          // Find trending post only if we don't have trending data from the API
          if (!response.data.trending && response.data.posts?.length > 0) {
            const postWithHighestUpvotes = response.data.posts.reduce((prev, current) => {
              return prev.upVotes > current.upVotes ? prev : current
            }, {})
            setTrendingPosts(postWithHighestUpvotes)
          }
        }

        // Fetch community data if user has communitiesJoined
        if (userData?.communitiesJoined?.length > 0) {
          try {
            const queryParams = new URLSearchParams()
            userData.communitiesJoined.forEach((name) => {
              queryParams.append("names", name)
            })

            const communityResponse = await axios.get(
              `http://localhost:3000/user/chat/getCommunities?${queryParams.toString()}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            )

            setCommunities(communityResponse.data?.communities || [])
          } catch (error) {
            console.error("Error fetching communities:", error)
            setCommunities([])
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        // Set default values on error
        setPosts([])
        setTrendingPosts([])
        setUpcomingEvents([])
        setCounty("")
        setCommunities([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, userData])
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

  useEffect(() => {
    const styleElement = document.createElement("style")
    const commentStyles = `
    .ts-comments-section {
      margin-top: 1rem;
      padding: 1rem;
      border-top: 1px solid var(--border-color);
    }

    .ts-comments-header {
      margin-bottom: 1rem;
    }

    .ts-comments-title {
      font-size: 1rem;
      font-weight: 600;
    }

    .ts-comment-form {
      display: flex;
      margin-bottom: 1rem;
    }

    .ts-comment-input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      background-color: var(--input-bg);
      color: var(--text-color);
    }

    .ts-comment-submit {
      margin-left: 0.5rem;
      padding: 0.5rem;
      border: none;
      border-radius: 0.5rem;
      background-color: var(--primary-color);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ts-comment-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .ts-comments-loading,
    .ts-comments-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      color: var(--text-muted);
    }

    .ts-comments-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .ts-comment-item {
      display: flex;
      gap: 0.75rem;
    }

    .ts-comment-avatar {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background-color: var(--avatar-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: var(--avatar-text);
      overflow: hidden;
    }

    .ts-comment-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .ts-comment-content {
      flex: 1;
      background-color: var(--comment-bg);
      border-radius: 0.5rem;
      padding: 0.75rem;
    }

    .ts-comment-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.25rem;
    }

    .ts-comment-author {
      font-weight: 600;
      font-size: 0.875rem;
      margin: 0;
    }

    .ts-comment-time {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .ts-comment-text {
      margin: 0;
      font-size: 0.875rem;
      line-height: 1.4;
    }

    .ts-action-button.active {
      color: var(--primary-color);
    }

    /* Dark mode specific styles */
    .dark .ts-comment-input {
      background-color: var(--dark-input-bg);
      border-color: var(--dark-border-color);
    }

    .dark .ts-comment-content {
      background-color: var(--dark-comment-bg);
    }
    `
    styleElement.textContent = commentStyles
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

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
            </div>

            <div className="ts-content-grid">
              {/* Main Feed */}
              <main className="ts-main-feed">
                <div className="ts-section-header">
                  <h2 className="ts-section-title">Community Feed</h2>
                  
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
                          token={token}
                        />
                      )
                    })}
                  </div>
                )}
              </main>
              <aside className="ts-sidebar">
                {/* Enhanced User Profile Card */}

                {/* Trending Section */}
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
                    {loading ? (
                      <div className="ts-loading-small">
                        <div className="ts-loading-spinner"></div>
                      </div>
                    ) : !trendingPosts || trendingPosts.length === 0 ? (
                      <div className="ts-empty-section">No trending posts yet</div>
                    ) : (
                      <div className="ts-trending-list">
                        {Array.isArray(trendingPosts) ? (
                          trendingPosts.map((post) => (
                            <div
                              key={post._id}
                              className="ts-trending-item"
                              onClick={() => navigate(`/post/${post._id}`)}
                            >
                              <h4 className="ts-trending-title">{post.title}</h4>
                              <div className="ts-trending-meta">
                                <span>{post.upVotes || 0} upvotes</span>
                                <span>{getTimeAgo(post.createdAt)}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="ts-trending-item" onClick={() => navigate(`/post/${trendingPosts._id}`)}>
                            <h4 className="ts-trending-title">{trendingPosts.title}</h4>
                            <div className="ts-trending-meta">
                              <span>{trendingPosts.upVotes || 0} upvotes</span>
                              <span>{getTimeAgo(trendingPosts.createdAt)}</span>
                            </div>
                          </div>
                        )}
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

                {/* Community Stats */}
                {/* Community Stats */}
                <div className="ts-stats-card">
                  <div className="ts-stats-header">
                    <h3 className="ts-stats-title">Community Stats</h3>
                    {communities[0] && <span className="ts-community-name">{communities[0].name}</span>}
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
                        <span className="ts-stat-value">{communities[0]?.members?.length || 0}</span>
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
                        <span className="ts-stat-value">
                          {posts.filter((post) => post.community?._id === userData?.communitiesJoined?.[0]?._id).length}
                        </span>
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
    </div>
  )
}

export default HomePage
