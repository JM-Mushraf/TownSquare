
import { useState,useEffect } from "react"
import { useSelector } from "react-redux"
import { getTimeAgo,formatDate } from "../Helpers"
import { ImageCarousel } from "../ImageCarousel"
export const PostCard = ({ post, navigate }) => {
    const [isHovered, setIsHovered] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [comments, setComments] = useState([])
    const [showComments, setShowComments] = useState(false)
    const [commentText, setCommentText] = useState("")
    const [isLoadingComments, setIsLoadingComments] = useState(false)
    const [userVote, setUserVote] = useState(null)
    const [upVotes, setUpVotes] = useState(post.upVotes || 0)
    const [downVotes, setDownVotes] = useState(post.downVotes || 0)
    // const [token, setToken] = useState("")
    const [placeholderIndex, setPlaceholderIndex] = useState(0)
  
    const { token, userData } = useSelector((state) => state.user)
    const user = userData
  
    // Function to toggle bookmark
    const toggleBookmark = async (e) => {
      e.stopPropagation()
  
      if (!token) {
        alert("Please log in to bookmark posts")
        return
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
          },
        )
  
        if (response.data.success) {
          setIsBookmarked(!isBookmarked)
          // Optional: Show feedback to user
          console.log(response.data.message)
        }
      } catch (error) {
        console.error("Error toggling bookmark:", error.response?.data?.message || error.message)
        // Optional: Show error message to user
      }
    }
  
    const placeholders = [
      "Transmit your thought...",
      "Share your neural imprint...",
      "Broadcast your perspective...",
      "Quantum-link your ideas...",
    ]
  
    const handleShareClick = (id) => async (e) => {
      e.stopPropagation()
  
      if (navigator.share) {
        // Use Web Share API if available (mobile devices)
        try {
          await navigator.share({
            title: post?.title || "Check out this post",
            url: `http://localhost:5173/post/${id}`,
          })
        } catch (err) {
          console.error("Error sharing:", err)
        }
      } else {
        // Fallback to clipboard copy
        try {
          const postUrl = `http://localhost:5173/post/${id}`
          await navigator.clipboard.writeText(postUrl)
          toast.success("Link copied to clipboard!")
        } catch (err) {
          console.error("Failed to copy: ", err)
          toast.error("Failed to copy link")
        }
      }
    }
  
    // Get token from localStorage on component mount
    useEffect(() => {
      // Check if user has already voted on this post
      const votedPosts = JSON.parse(localStorage.getItem("votedPosts") || "{}")
      if (votedPosts[post._id]) {
        setUserVote(votedPosts[post._id])
      }
    }, [post._id])
  
    // Cycle through placeholder texts
    useEffect(() => {
      const interval = setInterval(() => {
        setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholders.length)
      }, 3000)
  
      return () => clearInterval(interval)
    }, [])
  
    // Function to handle upvoting
    const handleUpvote = async (e) => {
      e.stopPropagation()
  
      if (!token) {
        alert("Please log in to vote")
        return
      }
  
      try {
        // If user already upvoted, we'll remove the vote
        const endpoint =
          userVote === "upvote"
            ? `http://localhost:3000/post/remove/${post._id}`
            : `http://localhost:3000/post/up/${post._id}`
  
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
  
          // Update user vote state
          const newVote = userVote === "upvote" ? null : "upvote"
          setUserVote(newVote)
  
          // Save vote to localStorage
          const votedPosts = JSON.parse(localStorage.getItem("votedPosts") || "{}")
          votedPosts[post._id] = newVote
          localStorage.setItem("votedPosts", JSON.stringify(votedPosts))
  
          if (newVote === "upvote") {
            setIsAnimating(true)
            setTimeout(() => setIsAnimating(false), 1000)
  
            // Play sound effect if enabled
            const soundEnabled = localStorage.getItem("soundEnabled") === "true"
            if (soundEnabled) {
              const upvoteSound = new Audio("/upvote-sound.mp3")
              upvoteSound.volume = 0.3
              upvoteSound.play().catch((e) => console.log("Audio play failed:", e))
            }
          }
        } else {
          alert(response.data.message)
        }
      } catch (error) {
        console.error("Error upvoting post:", error)
        alert(error.response?.data?.message || "Error upvoting post")
      }
    }
  
    // Function to handle downvoting
    const handleDownvote = async (e) => {
      e.stopPropagation()
  
      if (!token) {
        alert("Please log in to vote")
        return
      }
  
      try {
        // If user already downvoted, we'll remove the vote
        const endpoint =
          userVote === "downvote"
            ? `http://localhost:3000/post/remove/${post._id}`
            : `http://localhost:3000/post/down/${post._id}`
  
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
  
          // Update user vote state
          const newVote = userVote === "downvote" ? null : "downvote"
          setUserVote(newVote)
  
          // Save vote to localStorage
          const votedPosts = JSON.parse(localStorage.getItem("votedPosts") || "{}")
          votedPosts[post._id] = newVote
          localStorage.setItem("votedPosts", JSON.stringify(votedPosts))
  
          // Play sound effect if enabled
          if (newVote === "downvote") {
            const soundEnabled = localStorage.getItem("soundEnabled") === "true"
            if (soundEnabled) {
              const downvoteSound = new Audio("/downvote-sound.mp3")
              downvoteSound.volume = 0.3
              downvoteSound.play().catch((e) => console.log("Audio play failed:", e))
            }
          }
        } else {
          alert(response.data.message)
        }
      } catch (error) {
        console.error("Error downvoting post:", error)
        alert(error.response?.data?.message || "Error downvoting post")
      }
    }
  
    // Function to fetch comments
    const fetchComments = async () => {
      if (!showComments) {
        setIsLoadingComments(true)
        try {
          const response = await axios.get(`http://localhost:3000/post/${post._id}/comments`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
  
          if (response.data.success) {
            setComments(response.data.comments)
          }
        } catch (error) {
          console.error("Error fetching comments:", error)
        } finally {
          setIsLoadingComments(false)
        }
      }
      setShowComments(!showComments)
  
      // Play sound effect if enabled
      if (!showComments) {
        const soundEnabled = localStorage.getItem("soundEnabled") === "true"
        if (soundEnabled) {
          const commentSound = new Audio("/comment-sound.mp3")
          commentSound.volume = 0.3
          commentSound.play().catch((e) => console.log("Audio play failed:", e))
        }
      }
    }
  
    // Function to add a comment
    const addComment = async (e) => {
      e.preventDefault()
  
      if (!token) {
        alert("Please log in to comment")
        return
      }
  
      if (!commentText.trim()) {
        return
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
          },
        )
  
        if (response.data.success) {
          setCommentText("")
          // Refresh comments
          const commentsResponse = await axios.get(`http://localhost:3000/post/${post._id}/comments`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
  
          if (commentsResponse.data.success) {
            setComments(commentsResponse.data.comments)
          }
        }
      } catch (error) {
        console.error("Error adding comment:", error)
        alert(error.response?.data?.message || "Error adding comment")
      }
    }
  
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
              <h3 className="neo-author-name">{post.createdBy?.username || "Anonymous"}</h3>
              <span className={`neo-post-type neo-post-type-${post.type}`}>{post.type}</span>
            </div>
            <div className="neo-post-meta">
              <span className="neo-timestamp">{getTimeAgo(post.createdAt)}</span>
              <span className="neo-post-sent-from">Post sent from Mars</span>
            </div>
          </div>
        </div>
      )
    }
  
    // Common post actions component
    const renderPostActions = () => {
      return (
        <div className="neo-post-actions">
          <div className="neo-action-buttons">
            <button
              className={`neo-action-button ${userVote === "upvote" ? "neo-active" : ""}`}
              id={`upvote-${post._id}`}
              onClick={handleUpvote}
            >
              <span className={`neo-action-icon neo-upvote ${isAnimating ? "neo-pulse" : ""}`}>
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
              className={`neo-action-button ${userVote === "downvote" ? "neo-active" : ""}`}
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
                e.stopPropagation()
                fetchComments()
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
              <span className="neo-action-count">{post.commentCount || comments.length || 0}</span>
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
  
            <button className="neo-action-button" id={`share-${post._id}`} onClick={handleShareClick(post._id)}>
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
      )
    }
  
    // Render attachments/images if available
    const renderAttachments = () => {
      if (post.attachments && post.attachments.length > 0) {
        return (
          <div className="neo-post-images">
            <ImageCarousel images={post.attachments.filter((attachment) => attachment.fileType?.startsWith("image/"))} />
          </div>
        )
      }
      return null
    }
  
    // Render post content based on type
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
      )
    }
  
    // Poll post layout
    const renderPollPost = () => {
      // Check if poll is active
      const [selectedPollOption, setSelectedPollOption] = useState(null)
      const isPollActive = post.poll?.status !== "closed"
      const hasVoted = selectedPollOption !== null || post.poll?.options?.some((opt) => opt.voters?.includes(user?._id))
  
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
                  <span className="neo-poll-badge neo-poll-badge-active">Active Poll</span>
                ) : (
                  <span className="neo-poll-badge neo-poll-badge-closed">Closed</span>
                )}
                {post.poll.endDate && (
                  <span className="neo-poll-time-remaining">
                    {isPollActive ? `Ends ${formatDate(post.poll.endDate)}` : `Ended ${formatDate(post.poll.endDate)}`}
                  </span>
                )}
              </div>
  
              <h5 className="neo-poll-question">{post.poll.question}</h5>
  
              <div className="neo-poll-options">
                {post.poll.options?.map((option, index) => {
                  const totalVotes = post.poll.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0)
                  const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
                  const isSelected = selectedPollOption === option._id || option.voters?.includes(user?._id)
  
                  return (
                    <div
                      key={`poll-option-${post._id}-${index}`}
                      className={`neo-poll-option ${isSelected ? "selected" : ""}`}
                    >
                      <div className="neo-poll-option-header">
                        <span>{option.text}</span>
                        {(hasVoted || !isPollActive) && (
                          <span>
                            {option.votes || 0} votes ({percentage}%)
                          </span>
                        )}
                      </div>
  
                      {(hasVoted || !isPollActive) && (
                        <div className="neo-poll-option-bar">
                          <div
                            className={`neo-poll-option-progress neo-poll-color-${index % 4}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      )}
  
                      {isPollActive && !hasVoted && (
                        <button
                          className="neo-poll-vote-button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePollVote(option._id)
                          }}
                        >
                          Vote
                        </button>
                      )}
                    </div>
                  )
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
                  <span>{isPollActive ? "Poll is active" : "Poll has ended"}</span>
                </div>
              </div>
            </div>
          )}
          {renderPostActions()}
        </div>
      )
    }
  
    // Marketplace post layout
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
                  <span className="neo-marketplace-badge">{post.marketplace.itemType || "Sale"}</span>
                  {post.marketplace.condition && (
                    <span className="neo-marketplace-condition">{post.marketplace.condition}</span>
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
  
                <button className="neo-marketplace-contact-button" onClick={handleContactSeller}>
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
                  <div className="neo-marketplace-contact-form" onClick={(e) => e.stopPropagation()}>
                    <textarea
                      className="neo-marketplace-message"
                      placeholder="Write your message to the seller..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      rows={4}
                    ></textarea>
                    <div className="neo-marketplace-form-actions">
                      <button className="neo-marketplace-cancel-button" onClick={handleContactSeller}>
                        Cancel
                      </button>
                      <button className="neo-marketplace-send-button" onClick={handleSendMessage}>
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
                  <div className="neo-event-date-day">{new Date(post.event.date).getDate()}</div>
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
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
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
                  <button className="neo-event-rsvp-button neo-event-rsvp-maybe">Maybe</button>
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
      )
    }
  
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
      )
    }
  
    // Comment section
    const renderCommentSection = () => {
      if (!showComments) return null
  
      return (
        <div className="neo-comments-section" onClick={(e) => e.stopPropagation()}>
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
            <button type="submit" className="neo-comment-submit" disabled={!commentText.trim()}>
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
                        <h5 className="neo-comment-author">{comment.userId?.username || "Anonymous"}</h5>
                      </div>
                      <span className="neo-comment-timestamp">{getTimeAgo(comment.createdAt)}</span>
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
      )
    }
  
    const handlePollVote = async (optionId) => {
      if (!token) {
        alert("Please log in to vote")
        return
      }
  
      try {
        const response = await axios.post(
          "http://localhost:3000/post/vote",
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
          // Refresh the post data to reflect the updated vote counts
          const postResponse = await axios.get(`http://localhost:3000/post/${post._id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
  
          if (postResponse.data.success) {
            // Update the post with the new data
            // This assumes you have a way to update the post in your component's state
            // For example, if you're fetching posts in a parent component and passing them down as props:
            // You would need to call a function passed down from the parent to update the post
            // setPost(postResponse.data.post); // This is just an example, adjust as needed
            window.location.reload()
          }
        } else {
          alert(response.data.message)
        }
      } catch (error) {
        console.error("Error voting on poll:", error)
        alert(error.response?.data?.message || "Error voting on poll")
      }
    }
  
    return (
      <div
        className={`neo-post-card neo-post-card-${post.type} ${isHovered ? "neo-hovered" : ""}`}
        onClick={() => {
          navigate(`/post/${post._id}`)
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        id={`post-${post._id}`}
      >
        {renderPostContent()}
      </div>
    )
  }