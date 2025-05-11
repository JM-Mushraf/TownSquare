

import { useState, useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { getTimeAgo, formatDate } from "../Helpers"
import { ImageCarousel } from "../ImageCarousel"
import axios from "axios"
import { toast } from "react-toastify"
import "./PostCard.css"

export const PostCard = ({ post, navigate }) => {
  const { token, userData } = useSelector((state) => state.user)
  const user = userData
  const [isAnimating, setIsAnimating] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(user?.bookmarks?.includes(post._id) || false)
  const [comments, setComments] = useState([])
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [userVote, setUserVote] = useState(null)
  const [upVotes, setUpVotes] = useState(post.upVotes || 0)
  const [downVotes, setDownVotes] = useState(post.downVotes || 0)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [selectedPollOption, setSelectedPollOption] = useState(null)
  const [syncAnimation, setSyncAnimation] = useState(false)
  const [visualState, setVisualState] = useState(0)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactMessage, setContactMessage] = useState("")
  const cardRef = useRef(null)

  // Visual state effect - changes visual state randomly
  useEffect(() => {
    const interval = setInterval(() => {
      setVisualState(Math.floor(Math.random() * 4))
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  // Sync animation effect
  useEffect(() => {
    if (syncAnimation) {
      const timeout = setTimeout(() => {
        setSyncAnimation(false)
      }, 3000)
      return () => clearTimeout(timeout)
    }
  }, [syncAnimation])

  // Function to toggle bookmark
  const toggleBookmark = async (e) => {
    e.stopPropagation()

    if (!token) {
      toast.error("Authentication required to save")
      return
    }

    try {
      const endpoint = isBookmarked
        ? `${import.meta.env.VITE_BACKEND_BASEURL}/user/bookmark-del`
        : `${import.meta.env.VITE_BACKEND_BASEURL}/user/bookmark`;

      const response = await axios({
        method: isBookmarked ? "DELETE" : "POST",
        url: endpoint,
        data: { postId: post._id },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.data.success) {
        setIsBookmarked(!isBookmarked)
        setSyncAnimation(true)
        toast.success(isBookmarked ? "Bookmark removed" : "Bookmark added")
      }
    } catch (error) {
      toast.error("Error: " + (error.response?.data?.message || error.message))
    }
  }

  const placeholders = ["Share your thoughts...", "Add a comment...", "Join the discussion...", "Post your message..."]

  const handleShareClick = (id) => async (e) => {
    e.stopPropagation()

    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title || "Check out this post",
          url: `${import.meta.env.VITE_FRONTEND_BASEURL}/post/${id}`,
        });
      } catch (err) {
        console.error("Share failed:", err)
      }
    } else {
      try {
        const postUrl = `${import.meta.env.VITE_FRONTEND_BASEURL}/post/${id}`;
        await navigator.clipboard.writeText(postUrl);
        toast.success("Link copied to clipboard!");
      } catch (err) {
        console.error("Copy failed: ", err)
        toast.error("Copy failed")
      }
    }
  }

  useEffect(() => {
    const votedPosts = JSON.parse(localStorage.getItem("votedPosts") || "{}")
    if (votedPosts[post._id]) {
      setUserVote(votedPosts[post._id])
    }
  }, [post._id])

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholders.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleUpvote = async (e) => {
    e.stopPropagation()

    if (!token) {
      toast.error("Authentication required to vote")
      return
    }

    try {
      const endpoint =
        userVote === "upvote"
          ? `${import.meta.env.VITE_BACKEND_BASEURL}/post/remove/${post._id}`
          : `${import.meta.env.VITE_BACKEND_BASEURL}/post/up/${post._id}`;

      const response = await axios.post(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success) {
        setUpVotes(response.data.upVotes)
        setDownVotes(response.data.downVotes)

        const newVote = userVote === "upvote" ? null : "upvote"
        setUserVote(newVote)

        const votedPosts = JSON.parse(localStorage.getItem("votedPosts") || "{}")
        votedPosts[post._id] = newVote
        localStorage.setItem("votedPosts", JSON.stringify(votedPosts))

        if (newVote === "upvote") {
          setIsAnimating(true)
          setTimeout(() => setIsAnimating(false), 1000)
          setSyncAnimation(true)

          const soundEnabled = localStorage.getItem("soundEnabled") === "true"
          if (soundEnabled) {
            const upvoteSound = new Audio("/upvote-sound.mp3")
            upvoteSound.volume = 0.3
            upvoteSound.play().catch((e) => console.log("Audio failed:", e))
          }
        }
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error("Vote failed:", error)
      toast.error(error.response?.data?.message || "Vote failed")
    }
  }

  const handleDownvote = async (e) => {
    e.stopPropagation()

    if (!token) {
      toast.error("Authentication required to vote")
      return
    }

    try {
      const endpoint =
        userVote === "downvote"
          ? `${import.meta.env.VITE_BACKEND_BASEURL}/post/remove/${post._id}`
          : `${import.meta.env.VITE_BACKEND_BASEURL}/post/down/${post._id}`;

      const response = await axios.post(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success) {
        setUpVotes(response.data.upVotes)
        setDownVotes(response.data.downVotes)

        const newVote = userVote === "downvote" ? null : "downvote"
        setUserVote(newVote)

        const votedPosts = JSON.parse(localStorage.getItem("votedPosts") || "{}")
        votedPosts[post._id] = newVote
        localStorage.setItem("votedPosts", JSON.stringify(votedPosts))

        if (newVote === "downvote") {
          setSyncAnimation(true)
          const soundEnabled = localStorage.getItem("soundEnabled") === "true"
          if (soundEnabled) {
            const downvoteSound = new Audio("/downvote-sound.mp3")
            downvoteSound.volume = 0.3
            downvoteSound.play().catch((e) => console.log("Audio failed:", e))
          }
        }
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error("Vote failed:", error)
      toast.error(error.response?.data?.message || "Vote failed")
    }
  }

  const fetchComments = async () => {
    if (!showComments) {
      setIsLoadingComments(true)
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_BASEURL}/post/${post._id}/comments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data.success) {
          setComments(response.data.comments)
        }
      } catch (error) {
        console.error("Failed to fetch comments:", error)
        toast.error("Failed to retrieve comments")
      } finally {
        setIsLoadingComments(false)
      }
    }
    setShowComments(!showComments)

    if (!showComments) {
      setSyncAnimation(true)
      const soundEnabled = localStorage.getItem("soundEnabled") === "true"
      if (soundEnabled) {
        const commentSound = new Audio("/comment-sound.mp3")
        commentSound.volume = 0.3
        commentSound.play().catch((e) => console.log("Audio failed:", e))
      }
    }
  }

  const addComment = async (e) => {
    e.preventDefault()

    if (!token) {
      toast.error("Authentication required to comment")
      return
    }

    if (!commentText.trim()) {
      return
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASEURL}/post/comment`,
        {
          postId: post._id,
          message: commentText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success) {
        setCommentText("")
        setSyncAnimation(true)
        toast.success("Comment posted successfully")
        setCommentText("");
        const commentsResponse = await axios.get(`${import.meta.env.VITE_BACKEND_BASEURL}/post/${post._id}/comments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (commentsResponse.data.success) {
          setComments(commentsResponse.data.comments)
        }
      }
    } catch (error) {
      console.error("Failed to post comment:", error)
      toast.error(error.response?.data?.message || "Failed to post comment")
    }
  }

  const renderPostHeader = () => {
    return (
      <div className="post-header">
        <div className="avatar-container">
          {post.createdBy?.avatar ? (
            <img src={post.createdBy.avatar || "/placeholder.svg"} alt={post.createdBy.username} className="avatar" />
          ) : (
            <div className="avatar">
              <span>{post.createdBy?.username?.charAt(0) || "U"}</span>
            </div>
          )}
          <div className="avatar-glow"></div>
          <div className="avatar-ring"></div>
          <div className="avatar-particles">
            <span className="avatar-particle"></span>
            <span className="avatar-particle"></span>
          </div>
        </div>
        <div className="author-info">
          <div className="author-name-container">
            <h3 className="author-name">{post.createdBy?.username || "Anonymous"}</h3>
            <span className={`post-type post-type-${post.type}`}>
              <span className="post-type-text">{post.type}</span>
            </span>
            <div className="verification-badge" title="Verified">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 22 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 12L10.5 14.5L16 9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <div className="post-meta">
            <span className="timestamp">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="meta-icon">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {getTimeAgo(post.createdAt)}
            </span>
            <div className="sync-indicator" title="Sync Status">
              <div className={`sync-dot ${syncAnimation ? "active" : ""}`}></div>
              <span>Sync</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderPostActions = () => {
    return (
      <div className="post-actions">
        <div className="action-buttons">
          <button
            className={`action-button neo-action ${userVote === "upvote" ? "active" : ""}`}
            id={`upvote-${post._id}`}
            onClick={handleUpvote}
          >
            <span className={`action-icon upvote ${isAnimating ? "pulse" : ""}`}>
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
            <div className="action-data">
              <span className="action-count">{upVotes}</span>
            </div>
            <div className="action-particles"></div>
          </button>
          <button
            className={`action-button neo-action ${userVote === "downvote" ? "active" : ""}`}
            id={`downvote-${post._id}`}
            onClick={handleDownvote}
          >
            <span className="action-icon downvote">
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
            <div className="action-data">
              <span className="action-count">{downVotes}</span>
            </div>
          </button>
          <button
            className={`action-button neo-action ${showComments ? "active" : ""}`}
            id={`comment-${post._id}`}
            onClick={(e) => {
              e.stopPropagation()
              fetchComments()
            }}
          >
            <span className="action-icon comment">
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
            <div className="action-data">
              <span className="action-count">{post.commentCount || comments.length || 0}</span>
            </div>
          </button>
          <button
            className={`action-button neo-action ${isBookmarked ? "active" : ""}`}
            id={`bookmark-${post._id}`}
            onClick={toggleBookmark}
          >
            <span className="action-icon bookmark">
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
            <div className="action-data"></div>
          </button>
          <div className="action-spacer"></div>
          <button className="action-button neo-action" id={`share-${post._id}`} onClick={handleShareClick(post._id)}>
            <span className="action-icon share">
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
            <div className="action-data"></div>
          </button>
        </div>
      </div>
    )
  }

  const renderAttachments = () => {
    if (post.attachments && post.attachments.length > 0) {
      return (
        <div className="post-images">
          <ImageCarousel images={post.attachments.filter((attachment) => attachment.fileType?.startsWith("image/"))} />
        </div>
      )
    }
    return null
  }

  const renderPostContent = () => {
    let content
    switch (post.type) {
      case "issue":
        content = renderIssuePost()
        break
      case "poll":
        content = renderPollPost()
        break
      case "marketplace":
        content = renderMarketplacePost()
        break
      case "announcements":
        content = renderAnnouncementPost()
        break
      default:
        content = renderGeneralPost()
    }

    return (
      <>
        {content}
        {renderCommentSection()}
      </>
    )
  }

  const renderIssuePost = () => {
    return (
      <div className="post-content">
        {renderPostHeader()}
        <div className="issue-container">
          <div className="issue-status">
            <span className="issue-badge">Issue</span>
            <span className="issue-priority">High Priority</span>
          </div>
          <h4 className="post-title">{post.title}</h4>
          <p className="post-text">{post.description}</p>
          {renderAttachments()}
          <div className="issue-details">
            <div className="issue-detail">
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
                className="issue-icon"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                <path d="M12 6v6l4 2"></path>
              </svg>
              <span>Status: Open</span>
            </div>
            <div className="issue-detail">
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
                className="issue-icon"
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

  const renderPollPost = () => {
    const isPollActive = post.poll?.status !== "closed"
    const hasVoted = selectedPollOption !== null || post.poll?.options?.some((opt) => opt.voters?.includes(user?._id))

    const handlePollVote = async (optionId) => {
      if (!token) {
        toast.error("Authentication required to vote")
        return
      }

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_BASEURL}/post/vote`,
          {
            postId: post._id,
            optionId: optionId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (response.data.success) {
          setSelectedPollOption(optionId)
          setSyncAnimation(true)
          toast.success("Vote registered")

          const postResponse = await axios.get(`${import.meta.env.VITE_BACKEND_BASEURL}/post/${post._id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (postResponse.data.success) {
            window.location.reload()
          }
        } else {
          toast.error(response.data.message)
        }
      } catch (error) {
        console.error("Vote failed:", error)
        toast.error(error.response?.data?.message || "Vote failed")
      }
    }

    return (
      <div className="post-content">
        {renderPostHeader()}
        <h4 className="post-title">{post.title}</h4>
        <p className="post-text">{post.description}</p>
        {renderAttachments()}

        {post.poll && (
          <div className="poll-details">
            <div className="poll-status">
              {isPollActive ? (
                <span className="poll-badge active">
                  <span className="badge-pulse"></span>
                  Active Poll
                </span>
              ) : (
                <span className="poll-badge closed">Closed</span>
              )}
              {post.poll.endDate && (
                <span className="poll-time-remaining">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="poll-icon">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1.5" strokeacronym="round" />
                  </svg>
                  {isPollActive ? `Ends ${formatDate(post.poll.endDate)}` : `Ended ${formatDate(post.poll.endDate)}`}
                </span>
              )}
            </div>

            <h5 className="poll-question">{post.poll.question}</h5>

            <div className="poll-options">
              {post.poll.options?.map((option, index) => {
                const totalVotes = post.poll.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0)
                const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
                const isSelected = selectedPollOption === option._id || option.voters?.includes(user?._id)

                return (
                  <div
                    key={`poll-option-${post._id}-${index}`}
                    className={`poll-option ${isSelected ? "selected" : ""}`}
                  >
                    <div className="poll-option-header">
                      <span>{option.text}</span>
                      {(hasVoted || !isPollActive) && (
                        <span className="poll-votes">
                          {option.votes || 0} votes ({percentage}%)
                        </span>
                      )}
                    </div>

                    {(hasVoted || !isPollActive) && (
                      <div className="poll-option-bar">
                        <div
                          className={`poll-option-progress poll-color-${index % 4}`}
                          style={{ width: `${percentage}%` }}
                        >
                          <div className="progress-particles"></div>
                        </div>
                      </div>
                    )}

                    {isPollActive && !hasVoted && (
                      <button
                        className="poll-vote-button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePollVote(option._id)
                        }}
                      >
                        <span className="vote-icon">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </span>
                        Vote
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="poll-meta">
              <div className="poll-votes">
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
                  className="poll-icon"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                <span>{post.poll.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0} total votes</span>
              </div>
              <div className="poll-time-left">
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
                  className="poll-icon"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>{isPollActive ? "Poll is active" : "Poll has ended"}</span>
              </div>
            </div>
          </div>
        )}
        {renderPostActions()}
      </div>
    )
  }

  const renderMarketplacePost = () => {
    const handleContactSeller = (e) => {
      e.stopPropagation()
      setShowContactForm(!showContactForm)
    }

    const handleSendMessage = async (e) => {
      e.stopPropagation()
      
      if (!token) {
        toast.error("Authentication required to send message")
        return
      }

      if (!contactMessage.trim()) {
        toast.error("Please enter a message")
        return
      }

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_BASEURL}/post/marketplacePosts/${post._id}/message`,
          { message: contactMessage },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        )

        if (response.data.success) {
          toast.success("Completed")
          setContactMessage("")
          setShowContactForm(false)
          setSyncAnimation(true)
        } else {
          toast.error(response.data.message || "Failed to send message")
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Error sending message")
      }
    }

    return (
      <div className="post-content">
        {renderPostHeader()}
        <h4 className="post-title">{post.title}</h4>

        {renderAttachments()} 

        <div className="marketplace-details">
          {post.marketplace && (
            <>
              <div className="marketplace-price">
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
                  className="price-icon"
                >
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                <span className="price-value">${post.marketplace.price}</span>
                <span className="marketplace-badge">{post.marketplace.itemType || "Sale"}</span>
                {post.marketplace.condition && (
                  <span className="marketplace-condition">{post.marketplace.condition}</span>
                )}
              </div>

              <p className="post-text">{post.description}</p>

              {post.marketplace.location && (
                <div className="marketplace-location">
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
                    className="location-icon"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{post.marketplace.location}</span>
                </div>
              )}

              {post.marketplace.tags && post.marketplace.tags.length > 0 && (
                <div className="marketplace-tags">
                  {post.marketplace.tags.map((tag, index) => (
                    <span key={`tag-${index}`} className="marketplace-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <button className="marketplace-contact-button" onClick={handleContactSeller}>
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
                  className="contact-icon"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Contact Seller
              </button>

              {showContactForm && (
                <div className="marketplace-contact-form" onClick={(e) => e.stopPropagation()}>
                  <textarea
                    className="marketplace-message"
                    placeholder="Compose message..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    rows={4}
                  ></textarea>
                  <div className="marketplace-form-actions">
                    <button className="marketplace-cancel-button" onClick={handleContactSeller}>
                      Cancel
                    </button>
                    <button className="marketplace-send-button" onClick={handleSendMessage}>
                      <span className="send-icon">
                        <svg viewBox="0 0 24  Regards,24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M22 2L11 13"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M22 2L15 22L11 13L2 9L22 2Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      Send
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

  const renderAnnouncementPost = () => {
    return (
      <div className="post-content">
        {renderPostHeader()}
        <div className="announcement-container">
          <div className="announcement-header">
            <h4 className="post-title">{post.title}</h4>
            {post.important && (
              <span className="announcement-badge">
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
                  className="announcement-icon"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Important
              </span>
            )}
          </div>

          <p className="post-text">{post.description}</p>
          {renderAttachments()}

          {post.event && (
            <div className="announcement-event">
              <div className="event-date-badge">
                <div className="event-date-month">
                  {new Date(post.event.date).toLocaleString("default", {
                    month: "short",
                  })}
                </div>
                <div className="event-date-day">{new Date(post.event.date).getDate()}</div>
              </div>
              <div className="event-info">
                <div className="event-info-item">
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
                    className="event-icon"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>{post.event.formattedDate}</span>
                </div>
                {post.event.time && (
                  <div className="event-info-item">
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
                      className="event-icon"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>{post.event.time}</span>
                  </div>
                )}
                {post.event.location && (
                  <div className="event-info-item">
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
                      className="event-icon"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{post.event.location}</span>
                  </div>
                )}
                <div className="event-rsvp">
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
                    className="event-icon"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 00-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <span>{post.event.rsvpCount || 0} people attending</span>
                </div>
              </div>
              <div className="event-rsvp-actions">
                <button className="event-rsvp-button event-rsvp-yes">
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
                    className="rsvp-icon"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Going
                </button>
                <button className="event-rsvp-button event-rsvp-maybe">Maybe</button>
                <button className="event-rsvp-button event-rsvp-no">
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
                    className="rsvp-icon"
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

  const renderGeneralPost = () => {
    return (
      <div className="post-content">
        {renderPostHeader()}
        <h4 className="post-title">{post.title}</h4>
        <p className="post-text">{post.description}</p>
        {renderAttachments()}
        {renderPostActions()}
      </div>
    )
  }

  const renderCommentSection = () => {
    if (!showComments) return null

    return (
      <div className="comments-section" onClick={(e) => e.stopPropagation()}>
        <div className="comments-header">
          <h4 className="comments-title">Comments</h4>
          <span className="comments-count">{comments.length}</span>
        </div>

        <form className="comment-form" onSubmit={addComment}>
          <div className="comment-input-container">
            <input
              type="text"
              className="comment-input"
              placeholder={placeholders[placeholderIndex]}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <div className="input-glow"></div>
          </div>
          <button type="submit" className="comment-submit" disabled={!commentText.trim()}>
            <span className="submit-icon">
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
          <div className="comments-loading">
            <div className="loading-spinner"></div>
            <p>Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="comments-empty">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment._id} className="comment">
                <div className="comment-avatar-container">
                  {comment.userId?.avatar ? (
                    <img
                      src={comment.userId.avatar || "/placeholder.svg"}
                      alt={comment.userId.username}
                      className="comment-avatar"
                    />
                  ) : (
                    <div className="comment-avatar">
                      <span>{comment.userId?.username?.charAt(0) || "U"}</span>
                    </div>
                  )}
                  <div className="comment-avatar-glow"></div>
                </div>
                <div className="comment-content">
                  <div className="comment-header">
                    <div className="comment-author-container">
                      <h5 className="comment-author">{comment.userId?.username || "Anonymous"}</h5>
                      <div className="connection-level" title="Connection Level">
                        <span className="connection-level-indicator">L4</span>
                      </div>
                    </div>
                    <span className="comment-timestamp">{getTimeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="comment-text">{comment.message}</p>
                  <div className="comment-actions">
                    <button className="comment-action">
                      <span className="comment-action-icon upvote">
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
                    <button className="comment-action">
                      <span className="comment-action-icon reply">
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

  const handlePollVote = async (optionId) => {
    if (!token) {
      alert("Please log in to vote");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASEURL}/post/vote`,
        {
          postId: post._id,
          optionId: optionId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const postResponse = await axios.get(`${import.meta.env.VITE_BACKEND_BASEURL}/post/${post._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (postResponse.data.success) {
          window.location.reload();
        }
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error voting on poll:", error);
      alert(error.response?.data?.message || "Error voting on poll");
    }
  };

  return (
    <div
      ref={cardRef}
      className={`post-card post-card-${post.type} state-${visualState} futuristic-card`}
      onClick={() => {
        navigate(`/post/${post._id}`)
      }}
      id={`post-${post._id}`}
    >
      <div className="card-background"></div>
      <div className="card-glow"></div>
      <div className="card-content">{renderPostContent()}</div>
      <div className="card-particles">
        <span className="particle particle-1"></span>
        <span className="particle particle-2"></span>
        <span className="particle particle-3"></span>
        <span className="particle particle-4"></span>
      </div>
      <div className="card-holographic-edge"></div>
      <div className="card-circuit-lines">
        <span className="circuit-line line-1"></span>
        <span className="circuit-line line-2"></span>
        <span className="circuit-line line-3"></span>
      </div>
    </div>
  )
}