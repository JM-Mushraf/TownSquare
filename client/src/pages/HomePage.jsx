"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "../components/ThemeProvider";
import ThemeToggle from "../components/ThemeToggle";
import { useSelector } from "react-redux";
import "./HomePage.css";

// Helper function to format time ago
const getTimeAgo = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Image Carousel Component
const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleNext = (e) => {
    e.stopPropagation();
    if (isTransitioning || !images || images.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    if (isTransitioning || !images || images.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 100) {
      handleNext();
    }
    if (touchEnd - touchStart > 100) {
      handlePrev();
    }
  };

  if (!images || images.length === 0) {
    return null;
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
          className={`ts-carousel-track ${
            isTransitioning ? "transitioning" : ""
          }`}
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
                handlePrev(e);
                e.stopPropagation();
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
                handleNext(e);
                e.stopPropagation();
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
                  className={`ts-carousel-indicator ${
                    index === currentIndex ? "active" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Hero Carousel Component
const HeroCarousel = ({ items, navigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleNext = (e) => {
    e?.stopPropagation();
    if (isTransitioning || !items || items.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    if (isTransitioning || !items || items.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + items.length) % items.length
    );
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 100) {
      handleNext();
    }
    if (touchEnd - touchStart > 100) {
      handlePrev();
    }
  };

  useEffect(() => {
    // Auto-advance the carousel
    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  if (!items || items.length === 0) {
    return null;
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
                    navigate(`/announcements/`);
                  } else if (item.type === "poll") {
                    navigate(`/surveys/`);
                  } else if (item.type === "marketplace") {
                    navigate(`/marketplace/`);
                  } else if (item.type === "survey") {
                    navigate(`/surveys/`);
                  } else {
                    navigate(`/post/${item._id}`);
                  }
                }}
              >
                <div className="ts-hero-image">
                  {item.attachments &&
                  item.attachments.length > 0 &&
                  item.attachments[0].fileType?.startsWith("image/") ? (
                    <img
                      src={
                        item.attachments[0].url ||
                        "/placeholder.svg?height=500&width=1000" ||
                        "/placeholder.svg"
                      }
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
                      <span
                        className={`ts-hero-badge ts-hero-badge-${item.type}`}
                      >
                        {item.type}
                      </span>
                      <h2 className="ts-hero-title">{item.title}</h2>
                      <p className="ts-hero-description">
                        {item.description.substring(0, 120)}...
                      </p>
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
            handlePrev(e);
            e.stopPropagation();
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
            handleNext(e);
            e.stopPropagation();
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
            className={`ts-hero-indicator ${
              index === currentIndex ? "active" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(index);
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
// Post Card Component - Renders different layouts based on post type
const PostCard = ({ post, navigate }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [upVotes, setUpVotes] = useState(post.upVotes || 0);
  const [downVotes, setDownVotes] = useState(post.downVotes || 0);
  // const [token, setToken] = useState("")
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const { token } = useSelector((state) => state.user);

  // Function to toggle bookmark
  const toggleBookmark = async (e) => {
    e.stopPropagation();

    if (!token) {
      alert("Please log in to bookmark posts");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/user/bookmark",
        { postId: post._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setIsBookmarked(!isBookmarked);
        // Optional: Show feedback to user
        console.log(response.data.message);
      }
    } catch (error) {
      console.error(
        "Error toggling bookmark:",
        error.response?.data?.message || error.message
      );
      // Optional: Show error message to user
    }
  };

  const placeholders = [
    "Transmit your thought...",
    "Share your neural imprint...",
    "Broadcast your perspective...",
    "Quantum-link your ideas...",
  ];

  const handleShareClick = (id) => async (e) => {
    e.stopPropagation();

    if (navigator.share) {
      // Use Web Share API if available (mobile devices)
      try {
        await navigator.share({
          title: post?.title || "Check out this post",
          url: `http://localhost:5173/post/${id}`,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback to clipboard copy
      try {
        const postUrl = `http://localhost:5173/post/${id}`;
        await navigator.clipboard.writeText(postUrl);
        toast.success("Link copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy: ", err);
        toast.error("Failed to copy link");
      }
    }
  };

  // Get token from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }

    // Check if user has already voted on this post
    const votedPosts = JSON.parse(localStorage.getItem("votedPosts") || "{}");
    if (votedPosts[post._id]) {
      setUserVote(votedPosts[post._id]);
    }
  }, [post._id]);

  // Cycle through placeholder texts
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Function to handle upvoting
  const handleUpvote = async (e) => {
    e.stopPropagation();

    if (!token) {
      alert("Please log in to vote");
      return;
    }

    try {
      // If user already upvoted, we'll remove the vote
      const endpoint =
        userVote === "upvote"
          ? `http://localhost:3000/post/remove/${post._id}`
          : `http://localhost:3000/post/up/${post._id}`;

      const response = await axios.post(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setUpVotes(response.data.upVotes);
        setDownVotes(response.data.downVotes);

        // Update user vote state
        const newVote = userVote === "upvote" ? null : "upvote";
        setUserVote(newVote);

        // Save vote to localStorage
        const votedPosts = JSON.parse(
          localStorage.getItem("votedPosts") || "{}"
        );
        votedPosts[post._id] = newVote;
        localStorage.setItem("votedPosts", JSON.stringify(votedPosts));

        if (newVote === "upvote") {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 1000);

          // Play sound effect if enabled
          const soundEnabled = localStorage.getItem("soundEnabled") === "true";
          if (soundEnabled) {
            const upvoteSound = new Audio("/upvote-sound.mp3");
            upvoteSound.volume = 0.3;
            upvoteSound
              .play()
              .catch((e) => console.log("Audio play failed:", e));
          }
        }
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error upvoting post:", error);
      alert(error.response?.data?.message || "Error upvoting post");
    }
  };

  // Function to handle downvoting
  const handleDownvote = async (e) => {
    e.stopPropagation();

    if (!token) {
      alert("Please log in to vote");
      return;
    }

    try {
      // If user already downvoted, we'll remove the vote
      const endpoint =
        userVote === "downvote"
          ? `http://localhost:3000/post/remove/${post._id}`
          : `http://localhost:3000/post/down/${post._id}`;

      const response = await axios.post(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setUpVotes(response.data.upVotes);
        setDownVotes(response.data.downVotes);

        // Update user vote state
        const newVote = userVote === "downvote" ? null : "downvote";
        setUserVote(newVote);

        // Save vote to localStorage
        const votedPosts = JSON.parse(
          localStorage.getItem("votedPosts") || "{}"
        );
        votedPosts[post._id] = newVote;
        localStorage.setItem("votedPosts", JSON.stringify(votedPosts));

        // Play sound effect if enabled
        if (newVote === "downvote") {
          const soundEnabled = localStorage.getItem("soundEnabled") === "true";
          if (soundEnabled) {
            const downvoteSound = new Audio("/downvote-sound.mp3");
            downvoteSound.volume = 0.3;
            downvoteSound
              .play()
              .catch((e) => console.log("Audio play failed:", e));
          }
        }
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error downvoting post:", error);
      alert(error.response?.data?.message || "Error downvoting post");
    }
  };

  // Function to fetch comments
  const fetchComments = async () => {
    if (!showComments) {
      setIsLoadingComments(true);
      try {
        const response = await axios.get(
          `http://localhost:3000/post/${post._id}/comments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setComments(response.data.comments);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setIsLoadingComments(false);
      }
    }
    setShowComments(!showComments);

    // Play sound effect if enabled
    if (!showComments) {
      const soundEnabled = localStorage.getItem("soundEnabled") === "true";
      if (soundEnabled) {
        const commentSound = new Audio("/comment-sound.mp3");
        commentSound.volume = 0.3;
        commentSound.play().catch((e) => console.log("Audio play failed:", e));
      }
    }
  };

  // Function to add a comment
  const addComment = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Please log in to comment");
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/post/comment",
        {
          postId: post._id,
          message: commentText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setCommentText("");
        // Refresh comments
        const commentsResponse = await axios.get(
          `http://localhost:3000/post/${post._id}/comments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (commentsResponse.data.success) {
          setComments(commentsResponse.data.comments);
        }
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert(error.response?.data?.message || "Error adding comment");
    }
  };

  // Common post header component
  const renderPostHeader = () => {
    return (
      <div className="neo-post-header">
        <div className="neo-avatar-container">
          {post.createdBy?.avatar ? (
            <img
              src={post.createdBy.avatar || "/placeholder.svg"}
              alt={post.createdBy.username}
              className="neo-avatar"
            />
          ) : (
            <div className="neo-avatar">
              <span>{post.createdBy?.username?.charAt(0) || "U"}</span>
            </div>
          )}
          <div className="neo-avatar-glow"></div>
        </div>
        <div className="neo-author-info">
          <div className="neo-author-name-container">
            <h3 className="neo-author-name">
              {post.createdBy?.username || "Anonymous"}
            </h3>
            <span className={`neo-post-type neo-post-type-${post.type}`}>
              {post.type}
            </span>
          </div>
          <div className="neo-post-meta">
            <span className="neo-timestamp">{getTimeAgo(post.createdAt)}</span>
            <span className="neo-post-sent-from">Post sent from Mars</span>
          </div>
        </div>
      </div>
    );
  };

  // Common post actions component
  const renderPostActions = () => {
    return (
      <div className="neo-post-actions">
        <div className="neo-action-buttons">
          <button
            className={`neo-action-button ${
              userVote === "upvote" ? "neo-active" : ""
            }`}
            id={`upvote-${post._id}`}
            onClick={handleUpvote}
          >
            <span
              className={`neo-action-icon neo-upvote ${
                isAnimating ? "neo-pulse" : ""
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={userVote === "upvote" ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
              </svg>
            </span>
            <span className="neo-action-count">{upVotes}</span>
          </button>
          <button
            className={`neo-action-button ${
              userVote === "downvote" ? "neo-active" : ""
            }`}
            id={`downvote-${post._id}`}
            onClick={handleDownvote}
          >
            <span className="neo-action-icon neo-downvote">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={userVote === "downvote" ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
              </svg>
            </span>
            <span className="neo-action-count">{downVotes}</span>
          </button>
          <button
            className={`neo-action-button ${showComments ? "neo-active" : ""}`}
            id={`comment-${post._id}`}
            onClick={(e) => {
              e.stopPropagation();
              fetchComments();
            }}
          >
            <span className="neo-action-icon neo-comment">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </span>
            <span className="neo-action-count">
              {post.commentCount || comments.length || 0}
            </span>
          </button>
          <button
            className={`neo-action-button ${isBookmarked ? "neo-active" : ""}`}
            id={`bookmark-${post._id}`}
            onClick={toggleBookmark}
          >
            <span className="neo-action-icon neo-bookmark">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={isBookmarked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </span>
          </button>
          <div className="neo-action-spacer"></div>

          <button
            className="neo-action-button"
            id={`share-${post._id}`}
            onClick={handleShareClick(post._id)}
          >
            <span className="neo-action-icon neo-share">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </span>
          </button>
        </div>
      </div>
    );
  };

  // Render attachments/images if available
  const renderAttachments = () => {
    if (post.attachments && post.attachments.length > 0) {
      return (
        <div className="neo-post-images">
          <ImageCarousel
            images={post.attachments.filter((attachment) =>
              attachment.fileType?.startsWith("image/")
            )}
          />
        </div>
      );
    }
    return null;
  };

  // Render post content based on type
  const renderPostContent = () => {
    let content;
    switch (post.type) {
      case "issue":
        content = renderIssuePost();
        break;
      case "poll":
        content = renderPollPost();
        break;
      case "marketplace":
        content = renderMarketplacePost();
        break;
      case "announcements":
        content = renderAnnouncementPost();
        break;
      default:
        content = renderGeneralPost();
    }

    return (
      <>
        {content}
        {renderCommentSection()}
      </>
    );
  };

  // Issue post layout
  const renderIssuePost = () => {
    return (
      <div className="neo-post-content neo-issue-post">
        {renderPostHeader()}
        <div className="neo-issue-container">
          <div className="neo-issue-status">
            <span className="neo-issue-badge">Issue</span>
            <span className="neo-issue-priority">High Priority</span>
          </div>
          <h4 className="neo-post-title">{post.title}</h4>
          <p className="neo-post-text">{post.description}</p>
          {renderAttachments()}
          <div className="neo-issue-details">
            <div className="neo-issue-detail">
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
                className="neo-issue-icon"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                <path d="M12 6v6l4 2"></path>
              </svg>
              <span>Status: Open</span>
            </div>
            <div className="neo-issue-detail">
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
                className="neo-issue-icon"
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
    );
  };

  // Poll post layout
  const renderPollPost = () => {
    // Check if poll is active
    const [selectedPollOption, setSelectedPollOption] = useState(null);
    const isPollActive = post.poll?.status !== "closed";
    const hasVoted = selectedPollOption !== null || post.poll?.options?.some(opt => opt.voters?.includes(user?._id));
  
    return (
      <div className="neo-post-content neo-poll-post">
        {renderPostHeader()}
        <h4 className="neo-post-title">{post.title}</h4>
        <p className="neo-post-text">{post.description}</p>
        {renderAttachments()}
  
        {post.poll && (
          <div className="neo-poll-details">
            <div className="neo-poll-status">
              {isPollActive ? (
                <span className="neo-poll-badge neo-poll-badge-active">
                  Active Poll
                </span>
              ) : (
                <span className="neo-poll-badge neo-poll-badge-closed">
                  Closed
                </span>
              )}
              {post.poll.endDate && (
                <span className="neo-poll-time-remaining">
                  {isPollActive 
                    ? `Ends ${formatDate(post.poll.endDate)}` 
                    : `Ended ${formatDate(post.poll.endDate)}`}
                </span>
              )}
            </div>
            
            <h5 className="neo-poll-question">{post.poll.question}</h5>
            
            <div className="neo-poll-options">
              {post.poll.options?.map((option, index) => {
                const totalVotes = post.poll.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0);
                const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                const isSelected = selectedPollOption === option._id || option.voters?.includes(user?._id);
  
                return (
                  <div
                    key={`poll-option-${post._id}-${index}`}
                    className={`neo-poll-option ${isSelected ? "selected" : ""}`}
                  >
                    <div className="neo-poll-option-header">
                      <span>{option.text}</span>
                      {(hasVoted || !isPollActive) && (
                        <span>{option.votes || 0} votes ({percentage}%)</span>
                      )}
                    </div>
                    
                    {(hasVoted || !isPollActive) && (
                      <div className="neo-poll-option-bar">
                        <div
                          className={`neo-poll-option-progress neo-poll-color-${
                            index % 4
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    )}
  
                    {isPollActive && !hasVoted && (
                      <button
                        className="neo-poll-vote-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePollVote(option._id);
                        }}
                      >
                        Vote
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="neo-poll-meta">
              <div className="neo-poll-votes">
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
                  className="neo-poll-icon"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                <span>{post.poll.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0} total votes</span>
              </div>
              <div className="neo-poll-time-left">
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
                  className="neo-poll-icon"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>
                  {isPollActive ? "Poll is active" : "Poll has ended"}
                </span>
              </div>
            </div>
          </div>
        )}
        {renderPostActions()}
      </div>
    );
  };

  // Marketplace post layout
  const renderMarketplacePost = () => {
    const [showContactForm, setShowContactForm] = useState(false);
    const [contactMessage, setContactMessage] = useState("");

    const handleContactSeller = (e) => {
      e.stopPropagation();
      setShowContactForm(!showContactForm);
    };

    const handleSendMessage = (e) => {
      e.stopPropagation();
      if (contactMessage.trim()) {
        // In a real app, you would send this message to the seller
        alert(`Message sent to seller: ${contactMessage}`);
        setContactMessage("");
        setShowContactForm(false);
      }
    };

    return (
      <div className="neo-post-content neo-marketplace-post">
        {renderPostHeader()}
        <h4 className="neo-post-title">{post.title}</h4>

        {renderAttachments()}

        <div className="neo-marketplace-details">
          {post.marketplace && (
            <>
              <div className="neo-marketplace-price">
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
                  className="neo-price-icon"
                >
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                <span>${post.marketplace.price}</span>
                <span className="neo-marketplace-badge">
                  {post.marketplace.itemType || "Sale"}
                </span>
                {post.marketplace.condition && (
                  <span className="neo-marketplace-condition">
                    {post.marketplace.condition}
                  </span>
                )}
              </div>

              <p className="neo-post-text">{post.description}</p>

              {post.marketplace.location && (
                <div className="neo-marketplace-location">
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
                    className="neo-location-icon"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{post.marketplace.location}</span>
                </div>
              )}

              {post.marketplace.tags && post.marketplace.tags.length > 0 && (
                <div className="neo-marketplace-tags">
                  {post.marketplace.tags.map((tag, index) => (
                    <span key={`tag-${index}`} className="neo-marketplace-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <button
                className="neo-marketplace-contact-button"
                onClick={handleContactSeller}
              >
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
                  className="neo-contact-icon"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Contact Seller
              </button>

              {showContactForm && (
                <div
                  className="neo-marketplace-contact-form"
                  onClick={(e) => e.stopPropagation()}
                >
                  <textarea
                    className="neo-marketplace-message"
                    placeholder="Write your message to the seller..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    rows={4}
                  ></textarea>
                  <div className="neo-marketplace-form-actions">
                    <button
                      className="neo-marketplace-cancel-button"
                      onClick={handleContactSeller}
                    >
                      Cancel
                    </button>
                    <button
                      className="neo-marketplace-send-button"
                      onClick={handleSendMessage}
                    >
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
    );
  };

  // Announcement post layout
  const renderAnnouncementPost = () => {
    return (
      <div className="neo-post-content neo-announcement-post">
        {renderPostHeader()}
        <div className="neo-announcement-container">
          <div className="neo-announcement-header">
            <h4 className="neo-post-title">{post.title}</h4>
            {post.important && (
              <span className="neo-announcement-badge">
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
                  className="neo-announcement-icon"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Important
              </span>
            )}
          </div>

          <p className="neo-post-text">{post.description}</p>
          {renderAttachments()}

          {post.event && (
            <div className="neo-announcement-event">
              <div className="neo-event-date-badge">
                <div className="neo-event-date-month">
                  {new Date(post.event.date).toLocaleString("default", {
                    month: "short",
                  })}
                </div>
                <div className="neo-event-date-day">
                  {new Date(post.event.date).getDate()}
                </div>
              </div>
              <div className="neo-event-info">
                <div className="neo-event-info-item">
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
                    className="neo-event-icon"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>{post.event.formattedDate}</span>
                </div>
                {post.event.time && (
                  <div className="neo-event-info-item">
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
                      className="neo-event-icon"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>{post.event.time}</span>
                  </div>
                )}
                {post.event.location && (
                  <div className="neo-event-info-item">
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
                      className="neo-event-icon"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{post.event.location}</span>
                  </div>
                )}
                <div className="neo-event-rsvp">
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
                    className="neo-event-icon"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 00-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <span>{post.event.rsvpCount || 0} people attending</span>
                </div>
              </div>
              <div className="neo-event-rsvp-actions">
                <button className="neo-event-rsvp-button neo-event-rsvp-yes">
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
                    className="neo-rsvp-icon"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Going
                </button>
                <button className="neo-event-rsvp-button neo-event-rsvp-maybe">
                  Maybe
                </button>
                <button className="neo-event-rsvp-button neo-event-rsvp-no">
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
                    className="neo-rsvp-icon"
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
    );
  };

  // General post layout
  const renderGeneralPost = () => {
    return (
      <div className="neo-post-content">
        {renderPostHeader()}
        <h4 className="neo-post-title">{post.title}</h4>
        <p className="neo-post-text">{post.description}</p>
        {renderAttachments()}
        {renderPostActions()}
      </div>
    );
  };

  // Comment section
  const renderCommentSection = () => {
    if (!showComments) return null;

    return (
      <div
        className="neo-comments-section"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="neo-comments-header">
          <h4 className="neo-comments-title">Neural Transmissions</h4>
          <span className="neo-comments-count">{comments.length}</span>
        </div>

        <form className="neo-comment-form" onSubmit={addComment}>
          <div className="neo-comment-input-container">
            <input
              type="text"
              className="neo-comment-input"
              placeholder={placeholders[placeholderIndex]}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <div className="neo-input-glow"></div>
          </div>
          <button
            type="submit"
            className="neo-comment-submit"
            disabled={!commentText.trim()}
          >
            <span className="neo-submit-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </span>
          </button>
        </form>

        {isLoadingComments ? (
          <div className="neo-comments-loading">
            <div className="neo-loading-spinner"></div>
            <p>Loading neural transmissions...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="neo-comments-empty">
            <p>No neural transmissions yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="neo-comments-list">
            {comments.map((comment) => (
              <div key={comment._id} className="neo-comment">
                <div className="neo-comment-avatar-container">
                  {comment.userId?.avatar ? (
                    <img
                      src={comment.userId.avatar || "/placeholder.svg"}
                      alt={comment.userId.username}
                      className="neo-comment-avatar"
                    />
                  ) : (
                    <div className="neo-comment-avatar">
                      <span>{comment.userId?.username?.charAt(0) || "U"}</span>
                    </div>
                  )}
                </div>
                <div className="neo-comment-content">
                  <div className="neo-comment-header">
                    <div className="neo-comment-author-container">
                      <h5 className="neo-comment-author">
                        {comment.userId?.username || "Anonymous"}
                      </h5>
                    </div>
                    <span className="neo-comment-timestamp">
                      {getTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                  <p className="neo-comment-text">{comment.message}</p>
                  <div className="neo-comment-actions">
                    <button className="neo-comment-action">
                      <span className="neo-comment-action-icon neo-upvote">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                        </svg>
                      </span>
                      <span>Like</span>
                    </button>
                    <button className="neo-comment-action">
                      <span className="neo-comment-action-icon neo-reply">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="9 17 4 12 9 7" />
                          <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                        </svg>
                      </span>
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`neo-post-card neo-post-card-${post.type} ${
        isHovered ? "neo-hovered" : ""
      }`}
      onClick={() => {
        navigate(`/post/${post._id}`);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id={`post-${post._id}`}
    >
      {renderPostContent()}
    </div>
  );
};

// Main HomePage Component
function HomePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [posts, setPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [county, setCounty] = useState("");
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [contactStates, setContactStates] = useState({});
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [communities, setCommunities] = useState([]);
  const { userData } = useSelector((state) => state.user);


  const fetchUpcomingPolls = async () => {
    try {
      const response = await axios.get("http://localhost:3000/post/survey-and-poll-posts");
      if (response.data) {
        return response.data.posts.filter(post => {
          const status = post.poll ? post.poll.status : post.survey?.status;
          return status === "upcoming";
        });
      }
      return [];
    } catch (error) {
      console.error("Error fetching upcoming polls:", error);
      return [];
    }
  };
  useEffect(() => {
    setUser(userData);
  }, [userData]);

  const navigate = (path) => {
    window.location.href = path;
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      console.log(token);
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch posts and other data
        const response = await axios.get("http://localhost:3000/post/getFeed", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data) {
          setPosts(response.data.posts || []);
          console.log(response.data);

          setTrendingPosts(response.data.trending || []);
          console.log("this is trending post", trendingPosts);

          setUpcomingEvents(response.data.upcomingEvents || []);
          setCounty(response.data.county || "");

          // Find trending post only if we don't have trending data from the API
          console.log(posts);

          if (!response.data.trending && response.data.posts?.length > 0) {
            const postWithHighestUpvotes = response.data.posts.reduce(
              (prev, current) => {
                return prev.upVotes > current.upVotes ? prev : current;
              },
              {}
            );
            setTrendingPosts(postWithHighestUpvotes);
            console.log(trendingPosts);
          }
        }

        // Fetch community data if user has communitiesJoined
        if (user?.communitiesJoined?.length > 0) {
          try {
            const queryParams = new URLSearchParams();
            user.communitiesJoined.forEach((name) => {
              queryParams.append("names", name);
            });

            const communityResponse = await axios.get(
              `http://localhost:3000/user/chat/getCommunities?${queryParams.toString()}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            setCommunities(communityResponse.data?.communities || []);
          } catch (error) {
            console.error("Error fetching communities:", error);
            setCommunities([]);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // Set default values on error
        setPosts([]);
        setTrendingPosts([]);
        setUpcomingEvents([]);
        setCounty("");
        setCommunities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user]);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter posts based on active tab
  const filteredPosts = posts.filter((post) => {
    if (activeTab === "all") return true;
    if (activeTab === "polls")
      return post.type === "poll" && post.poll?.isActive !== false;
    if (activeTab === "announcements") return post.type === "announcements";
    if (activeTab === "suggestions") return post.type === "suggestion";
    if (activeTab === "marketplace") return post.type === "marketplace";
    if (activeTab === "events")
      return post.type === "announcements" && post.event;
    if (activeTab === "issues") return post.type === "issue";
    return true;
  });

  const handleContactSeller = (postId) => (e) => {
    e.stopPropagation();
    setContactStates((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        showContactForm: !prev[postId]?.showContactForm,
      },
    }));
  };

  const handleSendMessage = (postId) => (e) => {
    e.stopPropagation();
    if (contactStates[postId]?.contactMessage?.trim()) {
      // In a real app, you would send this message to the seller
      alert(`Message sent to seller: ${contactStates[postId].contactMessage}`);
      setContactStates((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          contactMessage: "",
          showContactForm: false,
        },
      }));
    }
  };

  const handleContactMessageChange = (postId) => (e) => {
    setContactStates((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        contactMessage: e.target.value,
      },
    }));
  };

  useEffect(() => {
    const styleElement = document.createElement("style");
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
    `;
    styleElement.textContent = commentStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

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
            <p className="ts-home-subtitle">
              Your community platform for {county || "your local area"}
            </p>
          </div>
          <div className="ts-header-actions">
            <ThemeToggle />
            <button
              className="ts-create-button"
              onClick={() => navigate("/createPost")}
              id="create-post-button"
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
                items={posts
                  .filter(
                    (post) => post.attachments && post.attachments.length > 0
                  )
                  .slice(0, 5)}
                navigate={navigate}
              />
            )}

            {/* Quick Links */}
            <div className="ts-quick-links">
              <div
                className="ts-quick-link"
                onClick={() => setActiveTab("all")}
                id="quick-link-all"
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
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </div>
                <span>All</span>
              </div>
              <div
                className="ts-quick-link"
                onClick={() => setActiveTab("marketplace")}
                id="quick-link-marketplace"
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
                    <path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4"></path>
                    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path>
                    <path d="M18 12a2 2 0 000 4h4v-4h-4z"></path>
                  </svg>
                </div>
                <span>Marketplace</span>
              </div>
              <div
                className="ts-quick-link"
                onClick={() => setActiveTab("polls")}
                id="quick-link-polls"
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
              <div
                className="ts-quick-link"
                onClick={() => setActiveTab("issues")}
                id="quick-link-issues"
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
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                </div>
                <span>Issues</span>
              </div>
              <div
                className="ts-quick-link"
                onClick={() => navigate("/explore")}
                id="quick-link-explore"
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
                  <button
                    className="ts-view-all-button"
                    onClick={() => navigate("/feed")}
                    id="view-all-feed"
                  >
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
                    <p>
                      Be the first to create a post in {county || "your area"}!
                    </p>
                    <button
                      className="ts-create-button"
                      onClick={() => navigate("/createPost")}
                      id="create-post-empty"
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
                      const postId = post._id;
                      return (
                        <PostCard
                          key={`post-card-${postId}`}
                          post={{
                            ...post,
                            showContactForm:
                              contactStates[postId]?.showContactForm || false,
                            contactMessage:
                              contactStates[postId]?.contactMessage || "",
                            handleContactSeller: handleContactSeller(postId),
                            handleSendMessage: handleSendMessage(postId),
                            handleContactMessageChange:
                              handleContactMessageChange(postId),
                          }}
                          navigate={navigate}
                        />
                      );
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
                      <div className="ts-empty-section">
                        No trending posts yet
                      </div>
                    ) : (
                      <div className="ts-trending-list">
                        {Array.isArray(trendingPosts) ? (
                          trendingPosts.map((post) => (
                            <div
                              key={post._id}
                              className="ts-trending-item"
                              onClick={() => navigate(`/post/${post._id}`)}
                            >
                              <h4 className="ts-trending-title">
                                {post.title}
                              </h4>
                              <div className="ts-trending-meta">
                                <span>{post.upVotes || 0} upvotes</span>
                                <span>{getTimeAgo(post.createdAt)}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div
                            className="ts-trending-item"
                            onClick={() =>
                              navigate(`/post/${trendingPosts._id}`)
                            }
                          >
                            <h4 className="ts-trending-title">
                              {trendingPosts.title}
                            </h4>
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
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        ></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      Upcoming Events
                    </h2>
                    <button
                      className="ts-view-all-button"
                      onClick={() => navigate("/events")}
                      id="view-all-events"
                    >
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
                            onClick={() =>
                              navigate(`/announcements/${event._id}`)
                            }
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
                                    <rect
                                      x="3"
                                      y="4"
                                      width="18"
                                      height="18"
                                      rx="2"
                                      ry="2"
                                    ></rect>
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
                      Stay tuned for important announcements and updates from
                      your community.
                    </p>
                  </div>
                </div>

                {/* Newsletter Subscription */}

                {/* Community Stats */}
                {/* Community Stats */}
                <div className="ts-stats-card">
                  <div className="ts-stats-header">
                    <h3 className="ts-stats-title">Community Stats</h3>
                    {communities[0] && (
                      <span className="ts-community-name">
                        {communities[0].name}
                      </span>
                    )}
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
                        <span className="ts-stat-value">
                          {communities[0]?.members?.length || 0}
                        </span>
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
                          {
                            posts.filter(
                              (post) =>
                                post.community?._id ===
                                user?.communitiesJoined?.[0]?._id
                            ).length
                          }
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
                    <p className="ts-support-message">
                      Help us keep TownSquare running and improving for
                      everyone.
                    </p>
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
  );
}

export default HomePage;
