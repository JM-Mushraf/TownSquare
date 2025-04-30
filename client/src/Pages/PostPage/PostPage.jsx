"use client"

import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import { useTheme } from "../../components/ThemeProvider"
import "./PostPage.css"
import { Vote, ChevronLeft, ChevronRight, Send } from "lucide-react"
import { useSelector } from "react-redux"
import { toast } from "react-hot-toast"
import "react-toastify/dist/ReactToastify.css"
import { getTimeAgo } from "../HomePage/Helpers"
import { ImageCarousel } from "./ImageCarousel"
// Helper function to format time ago


// Image Carousel Component


const PostPage = () => {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState("")
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [userVote, setUserVote] = useState(null)
  const [upVotes, setUpVotes] = useState(0)
  const [downVotes, setDownVotes] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const { isDarkMode } = useTheme()

  const [showCommentAnimation, setShowCommentAnimation] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [pollResults, setPollResults] = useState(null)
  const [isSubmittingVote, setIsSubmittingVote] = useState(false)

  const { userData, token } = useSelector((state) => state.user)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)

        if (!token) {
          toast.error("Authentication required")
          return
        }

        const response = await axios.get(`http://localhost:3000/post/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        console.log(response)
        if (response.data.success) {
          setPost(response.data.post)
          setUpVotes(response.data.post.upVotes || 0)
          setDownVotes(response.data.post.downVotes || 0)

          // Check if user has already voted on this post
          const votedPosts = JSON.parse(localStorage.getItem("votedPosts") || "{}")
          if (votedPosts[id]) {
            setUserVote(votedPosts[id])
          }

          // Check if post is bookmarked
          const bookmarkedPosts = JSON.parse(localStorage.getItem("bookmarkedPosts") || "[]")
          setIsBookmarked(bookmarkedPosts.includes(id))

          // Fetch comments
          const commentsResponse = await axios.get(`http://localhost:3000/post/${id}/comments`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (commentsResponse.data.success) {
            setComments(commentsResponse.data.comments)
          }

          // Check if user has voted in poll
          if (response.data.post.poll) {
            const hasVoted = response.data.post.poll.options.some(
              (option) => option.voters && option.voters.includes(userData?._id),
            )
            setHasVoted(hasVoted)

            if (hasVoted) {
              setPollResults(response.data.post.poll)
            }
          }
        } else {
          setError("Failed to load post")
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error loading post")
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id, token, userData])

  const handleUpvote = async (e) => {
    e.stopPropagation()

    if (!token) {
      toast.error("Please log in to vote")
      return
    }

    try {
      const endpoint =
        userVote === "upvote" ? `http://localhost:3000/post/remove/${id}` : `http://localhost:3000/post/up/${id}`

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
        votedPosts[id] = newVote
        localStorage.setItem("votedPosts", JSON.stringify(votedPosts))

        if (newVote === "upvote") {
          setIsAnimating(true)
          setTimeout(() => setIsAnimating(false), 1000)
        }
      }
    } catch (error) {
      console.error("Error upvoting post:", error)
    }
  }

  const handleDownvote = async (e) => {
    e.stopPropagation()

    if (!token) {
      toast.error("Please log in to vote")
      return
    }

    try {
      const endpoint =
        userVote === "downvote" ? `http://localhost:3000/post/remove/${id}` : `http://localhost:3000/post/down/${id}`

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
        votedPosts[id] = newVote
        localStorage.setItem("votedPosts", JSON.stringify(votedPosts))
      }
    } catch (error) {
      console.error("Error downvoting post:", error)
    }
  }

  const handleBookmark = (e) => {
    e.stopPropagation()

    if (!token) {
      toast.error("Please log in to bookmark")
      return
    }

    const bookmarkedPosts = JSON.parse(localStorage.getItem("bookmarkedPosts") || "[]")

    if (isBookmarked) {
      const updatedBookmarks = bookmarkedPosts.filter((postId) => postId !== id)
      localStorage.setItem("bookmarkedPosts", JSON.stringify(updatedBookmarks))
    } else {
      bookmarkedPosts.push(id)
      localStorage.setItem("bookmarkedPosts", JSON.stringify(bookmarkedPosts))
    }

    setIsBookmarked(!isBookmarked)
    toast.success(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks")
  }

  const addComment = async (e) => {
    e.preventDefault()

    if (!token) {
      toast.error("Please log in to comment")
      return
    }

    if (!commentText.trim()) {
      return
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/post/comment",
        {
          postId: id,
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
        const commentsResponse = await axios.get(`http://localhost:3000/post/${id}/comments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (commentsResponse.data.success) {
          setComments(commentsResponse.data.comments)
          setShowCommentAnimation(true)
          setTimeout(() => setShowCommentAnimation(false), 1500)
          toast.success("Comment added successfully!")
        }
      }
    } catch (error) {
      console.error("Error adding comment:", error)
      toast.error(error.response?.data?.message || "Error adding comment")
    }
  }

  const handlePollVote = async () => {
    if (selectedOption === null || !token || !post?.poll || !userData?._id) {
      toast.error("Please select an option to vote")
      return
    }

    setIsSubmittingVote(true)

    try {
      const response = await axios.post(
        `http://localhost:3000/post/${id}/vote`,
        {
          option: post.poll.options[selectedOption]._id, // changed from optionId to option
          userId: userData._id, // added userId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success) {
        setHasVoted(true)
        setPollResults(response.data.updatedPost?.poll) // might need to adjust based on your response
        toast.success("Your vote has been recorded!")
      }
    } catch (error) {
      console.error("Error voting in poll:", error)
      toast.error(error.response?.data?.message || "Error voting in poll")
    } finally {
      setIsSubmittingVote(false)
    }
  }

  if (loading) {
    return (
      <div className="neo-loading-container">
        <div className="neo-loading-spinner"></div>
        <p>Loading post...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="neo-error-container">
        <div className="neo-error-icon">
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
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3>Error loading post</h3>
        <p>{error}</p>
        <button className="neo-retry-button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="neo-empty-container">
        <div className="neo-empty-icon">
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
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3>Post not found</h3>
        <p>The post you're looking for doesn't exist or may have been deleted.</p>
      </div>
    )
  }

  // Calculate total votes for poll
  const totalPollVotes = post.poll?.options.reduce((sum, option) => sum + (option.votes || 0), 0) || 0

  return (
    <div className={`neo-post-page ${isDarkMode ? "dark" : ""}`}>
      <div className="cyber-grid"></div>
      <div className="neo-post-container">
        <div className="neo-post-card">
          {/* Post header */}
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

          {/* Post content */}
          <div className="neo-post-content">
            <h2 className="neo-post-title">{post.title}</h2>
            <p className="neo-post-text">{post.description}</p>

            {/* Image carousel */}
            {post.attachments && post.attachments.length > 0 && (
              <ImageCarousel
                images={post.attachments.filter((attachment) => attachment.fileType?.startsWith("image/"))}
              />
            )}

            {/* Poll section */}
            {post.poll && (
              <div className="neo-poll-section">
                <div className="neo-poll-header">
                  <h3 className="neo-poll-title">{post.poll.question}</h3>
                  <div className="neo-poll-meta">
                    <span className={`neo-poll-status ${post.poll.status === "active" ? "active" : ""}`}>
                      {post.poll.status === "active" ? "Active Poll" : "Closed Poll"}
                    </span>
                    <span className="neo-poll-votes">
                      <Vote className="neo-poll-icon" />
                      {totalPollVotes} votes
                    </span>
                  </div>
                </div>

                {hasVoted || post.poll.status !== "active" ? (
                  <div className="neo-poll-results">
                    {post.poll.options.map((option, index) => {
                      const percentage = totalPollVotes > 0 ? Math.round((option.votes / totalPollVotes) * 100) : 0
                      const colorClass = `neo-poll-color-${index % 4}`

                      return (
                        <div key={option._id} className="neo-poll-result">
                          <div className="neo-poll-result-header">
                            <span className="neo-poll-result-label">{option.text}</span>
                            <span className={`neo-poll-result-percentage ${colorClass}`}>{percentage}%</span>
                          </div>
                          <div className="neo-poll-result-bar">
                            <div
                              className={`neo-poll-result-progress ${colorClass}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="neo-poll-result-votes">
                            <span>{option.votes || 0} votes</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="neo-poll-options">
                    {post.poll.options.map((option, index) => (
                      <div
                        key={option._id}
                        className={`neo-poll-option ${selectedOption === index ? "selected" : ""}`}
                        onClick={() => setSelectedOption(index)}
                      >
                        <div className="neo-poll-radio-container">
                          <input
                            type="radio"
                            id={`poll-option-${option._id}`}
                            name="poll-options"
                            checked={selectedOption === index}
                            onChange={() => setSelectedOption(index)}
                            className="neo-poll-radio"
                          />
                          <span className="neo-poll-radio-checkmark"></span>
                        </div>
                        <label htmlFor={`poll-option-${option._id}`} className="neo-poll-option-label">
                          {option.text}
                        </label>
                      </div>
                    ))}

                    <button
                      className={`neo-poll-submit ${selectedOption === null ? "disabled" : ""}`}
                      disabled={selectedOption === null || isSubmittingVote}
                      onClick={handlePollVote}
                    >
                      {isSubmittingVote ? (
                        <>
                          <span className="neo-poll-submit-spinner"></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Vote className="neo-poll-submit-icon" />
                          Submit Vote
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Post actions */}
            <div className="neo-post-actions">
              <div className="neo-action-buttons">
                <button
                  className={`neo-action-button ${userVote === "upvote" ? "neo-active" : ""}`}
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
                <div className="neo-action-spacer"></div>
                <button className={`neo-action-button ${isBookmarked ? "neo-active" : ""}`} onClick={handleBookmark}>
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
              </div>
            </div>
          </div>

          {/* Comments section */}
          <div className="neo-comments-section">
            <div className="neo-comments-header">
              <h4 className="neo-comments-title">Comments</h4>
              <span className="neo-comments-count">{comments.length}</span>
            </div>

            <form className="neo-comment-form" onSubmit={addComment}>
              <div className="neo-comment-input-container">
                <input
                  type="text"
                  className="neo-comment-input"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="neo-input-glow"></div>
              </div>
              <button type="submit" className="neo-comment-submit" disabled={!commentText.trim()}>
                <span className="neo-submit-icon">
                  <Send size={20} />
                </span>
              </button>
            </form>

            {comments.length === 0 ? (
              <div className="neo-comments-empty">
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              <div className={`neo-comments-list ${showCommentAnimation ? "new-comment-added" : ""}`}>
                {comments.map((comment, index) => (
                  <div
                    key={comment._id}
                    className={`neo-comment ${index === 0 && showCommentAnimation ? "neo-comment-new" : ""}`}
                  >
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
                      <div className="neo-comment-avatar-glow"></div>
                    </div>
                    <div className="neo-comment-content">
                      <div className="neo-comment-header">
                        <div className="neo-comment-author-container">
                          <h5 className="neo-comment-author">{comment.userId?.username || "Anonymous"}</h5>
                        </div>
                        <span className="neo-comment-timestamp">{getTimeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="neo-comment-text">{comment.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostPage
