"use client";

import { useState, useEffect } from "react";
import {
  User,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  History,
  Star,
  FileText,
  MessageSquare,
  ClipboardList,
  Vote,
  AlertTriangle,
  RefreshCw,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Bell,
  Info,
  HelpCircle,
  Award,
  ThumbsUp,
  PieChart,
  TrendingUp,
  Filter,
  Search,
  Bookmark,
  Share2,
  MoreHorizontal,
} from "lucide-react";
import { useSelector } from "react-redux";
import "./SurveysPage.css";

const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
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

  return (
    <div className="image-carousel">
      <div
        className="carousel-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`carousel-track ${isTransitioning ? "transitioning" : ""}`}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="carousel-slide">
              <img
                src={image || "/placeholder.svg"}
                alt={`Image ${index + 1}`}
                className="carousel-image"
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="carousel-button carousel-button-prev"
              aria-label="Previous image"
            >
              <ChevronLeft className="carousel-icon" />
            </button>
            <button
              onClick={handleNext}
              className="carousel-button carousel-button-next"
              aria-label="Next image"
            >
              <ChevronRight className="carousel-icon" />
            </button>
            <div className="carousel-indicators">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`carousel-indicator ${
                    index === currentIndex ? "active" : ""
                  }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const SurveyCard = ({ post, onVote, onViewResults }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [openEndedResponse, setOpenEndedResponse] = useState("");
  const [rating, setRating] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const isPoll = post.type === "poll";
  const item = isPoll ? post.poll : post.survey;
  const status = item.status;
  const deadline = new Date(item.deadline);
  const question = isPoll ? item.question : item.questions[0]?.question || "";
  const options = isPoll
    ? post.poll.options
    : post.survey.questions[0]?.options.map((opt, index) => ({
        _id: opt._id || index, // Use _id if available, otherwise use index
        text: opt,
      }));
  const hasImages = post.attachments && post.attachments.length > 0;
  const questionType = isPoll
    ? "multiple-choice"
    : item.questions[0]?.type || "";

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="status-icon" />;
      case "upcoming":
        return <Clock className="status-icon" />;
      case "past":
        return <History className="status-icon" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "active":
        return "status-active";
      case "upcoming":
        return "status-upcoming";
      case "past":
        return "status-past";
      default:
        return "status-default";
    }
  };

  const getDeadlineText = () => {
    const formattedDate = deadline.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    switch (status) {
      case "active":
        return `Ends on ${formattedDate}`;
      case "upcoming":
        return `Starts on ${formattedDate}`;
      case "past":
        return `Ended on ${formattedDate}`;
      default:
        return formattedDate;
    }
  };
  const {userData} = useSelector((state) => state.user)
  const handleSubmit = async () => {
    
    // console.log("id",userData._id);
    // console.log("Name",userData.username);
    if (selectedOption !== null || openEndedResponse || rating > 0) {
      setIsSubmitting(true);
    
      const voteData = {
        option: null,
        response: null,
        rating: null,
        userId: userData._id, // Use the actual userId
      };

      if (isPoll) {
        // For polls, send the _id of the selected option
        voteData.option = options[selectedOption]?._id;
      } else if (post.type === "survey") {
        if (questionType === "multiple-choice") {
          // For multiple-choice surveys, send the _id of the selected option
          voteData.option = options[selectedOption]?._id; // Use _id instead of index
        } else if (questionType === "open-ended") {
          // For open-ended surveys, send the response text
          voteData.response = openEndedResponse;
        } else if (questionType === "rating") {
          // For rating surveys, send the selected rating
          voteData.rating = rating;
        }
      }

      console.log("Vote Data:", voteData); // Debugging

      await onVote(post._id, voteData);
      setIsSubmitting(false);
    }
  };

  const handleOptionChange = (index) => {
    setSelectedOption(index);
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleTextareaChange = (e) => {
    setOpenEndedResponse(e.target.value);
    setCharCount(e.target.value.length);
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  return (
    <div
      className={`survey-card ${isHovered ? "hovered" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="survey-card-header">
        <div className="survey-card-title-container">
          <h3 className="survey-card-title">{post.title}</h3>
          <div className="survey-card-description-container">
            <FileText className="description-icon" />
            <p className="survey-card-description">{post.description}</p>
          </div>
          <div className="survey-card-meta">
            <span className="survey-card-type">
              <BarChart3 className="meta-icon" /> {post.type}
            </span>
            <span className="survey-card-creator">
              <User className="meta-icon" />
              <span className="creator-name">{post.createdBy.username}</span>
            </span>
          </div>
        </div>
        <span className={`survey-card-badge ${getStatusClass(status)}`}>
          {getStatusIcon(status)}
          {status}
        </span>
      </div>

      <div className="survey-card-deadline">
        <Calendar className="deadline-icon" />
        {getDeadlineText()}
      </div>

      {hasImages && (
        <div className="survey-card-images">
          <ImageCarousel
            images={post.attachments.map((attachment) => attachment.url)}
          />
        </div>
      )}

      <div className="survey-card-content">
        <div className="survey-card-question-container">
          <Lightbulb className="question-icon" />
          <p className="survey-card-question">{question}</p>
        </div>

        {status === "active" ? (
          <div className="survey-card-options">
            {questionType === "multiple-choice" && (
              <>
                {options.map((option, index) => (
                  <div
                    key={isPoll ? option._id : index}
                    className={`survey-card-option ${
                      selectedOption === index ? "selected" : ""
                    }`}
                    onClick={() => handleOptionChange(index)}
                  >
                    <div className="survey-card-radio-container">
                      <input
                        type="radio"
                        id={`option-${post._id}-${isPoll ? option._id : index}`}
                        name={`survey-${post._id}`}
                        value={isPoll ? option.text : option}
                        checked={selectedOption === index}
                        onChange={() => handleOptionChange(index)}
                        className="survey-card-radio"
                      />
                      <span className="survey-card-radio-checkmark"></span>
                    </div>
                    <label
                      htmlFor={`option-${post._id}-${
                        isPoll ? option._id : index
                      }`}
                      className="survey-card-option-label"
                    >
                      {isPoll ? option.text : option.text}{" "}
                      {/* Render the `text` property */}
                    </label>
                  </div>
                ))}
              </>
            )}
            {questionType === "open-ended" && (
              <div
                className={`survey-card-open-ended ${
                  isFocused ? "focused" : ""
                }`}
              >
                <div className="textarea-container">
                  <MessageSquare className="textarea-icon" />
                  <textarea
                    className="survey-card-textarea"
                    placeholder="Type your response here..."
                    value={openEndedResponse}
                    onChange={handleTextareaChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  />
                  <div className="textarea-border"></div>
                </div>
                <div className="textarea-footer">
                  <div className="char-count">
                    <span className={charCount > 0 ? "has-text" : ""}>
                      {charCount}
                    </span>{" "}
                    characters
                  </div>
                  <div className="textarea-hint">
                    <Info className="hint-icon" />
                    <span>Be concise and specific in your response</span>
                  </div>
                </div>
              </div>
            )}
            {questionType === "rating" && (
              <div className="survey-card-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`survey-card-star ${
                      star <= rating ? "filled" : ""
                    }`}
                    onClick={() => handleRatingChange(star)}
                  >
                    {star <= rating ? (
                      <Star className="star-icon filled" />
                    ) : (
                      <Star className="star-icon" />
                    )}
                  </span>
                ))}
                <div className="rating-label">
                  {rating === 0 && "Select a rating"}
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </div>
              </div>
            )}
          </div>
        ) : status === "past" ? (
          <div className="survey-card-results">
            {options.map((option, index) => {
              const optionText = isPoll ? option.text : option;
              const votes = isPoll
                ? option.votes
                : item.questions[0].votes[index];
              const totalVotes = isPoll
                ? options.reduce((sum, opt) => sum + opt.votes, 0)
                : item.questions[0].votes.reduce((sum, v) => sum + v, 0);
              const percentage =
                totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

              const gradientClasses = ["red", "green", "yellow", "blue"];
              const gradientClass =
                gradientClasses[index % gradientClasses.length];

              return (
                <div key={index} className="survey-card-result">
                  <div className="survey-card-result-header">
                    <span className="survey-card-result-label">
                      {optionText}
                    </span>
                    <span className="survey-card-result-percentage">
                      {percentage}%
                    </span>
                  </div>
                  <div className="survey-card-result-bar">
                    <div
                      className={`survey-card-result-progress ${gradientClass}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="survey-card-result-votes">
                    <Vote className="votes-icon" />
                    <span>
                      {votes} {votes === 1 ? "vote" : "votes"}
                    </span>
                  </div>
                </div>
              );
            })}
            <div className="survey-card-total-votes">
              <PieChart className="total-votes-icon" />
              <span>
                Total Responses:{" "}
                {options.reduce(
                  (sum, opt) => sum + (isPoll ? opt.votes : 0),
                  0
                )}
              </span>
            </div>
          </div>
        ) : (
          <div className="survey-card-upcoming">
            <Clock className="upcoming-icon" />
            <div className="upcoming-content">
              <p>This {isPoll ? "poll" : "survey"} is not yet active.</p>
              <p>You can set a reminder to be notified when it starts.</p>
            </div>
          </div>
        )}
      </div>

      <div className="survey-card-footer">
        <div className="survey-card-actions">
          <button
            className={`survey-card-action-button ${
              isBookmarked ? "active" : ""
            }`}
            onClick={toggleBookmark}
            aria-label={
              isBookmarked ? "Remove bookmark" : "Bookmark this survey"
            }
          >
            <Bookmark className="action-icon" />
          </button>
          <button
            className="survey-card-action-button"
            aria-label="Share this survey"
          >
            <Share2 className="action-icon" />
          </button>
          <button
            className="survey-card-action-button"
            aria-label="More options"
          >
            <MoreHorizontal className="action-icon" />
          </button>
        </div>

        {status === "active" ? (
          <button
            className={`survey-card-button submit-button ${
              selectedOption === null && !openEndedResponse && rating === 0
                ? "disabled"
                : ""
            } ${isSubmitting ? "submitting" : ""}`}
            disabled={
              (selectedOption === null && !openEndedResponse && rating === 0) ||
              isSubmitting
            }
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <span className="button-spinner"></span>
                Submitting...
              </>
            ) : (
              <>
                <Vote className="button-icon" />
                Submit Response
              </>
            )}
          </button>
        ) : status === "upcoming" ? (
          <button
            className="survey-card-button reminder-button"
            onClick={() => {}}
          >
            <Bell className="button-icon" />
            Set Reminder
          </button>
        ) : (
          <button
            className="survey-card-button results-button"
            onClick={() => onViewResults(post._id)}
          >
            <BarChart3 className="button-icon" />
            View Full Results
          </button>
        )}
      </div>
    </div>
  );
};

function SurveysPage() {
  const [activeTab, setActiveTab] = useState("active");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabTransitioning, setTabTransitioning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { token } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/post/survey-and-poll-posts"
        );
        if (!response.ok) throw new Error("Failed to fetch posts");
        const data = await response.json();
        setPosts(data.posts);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
        console.error("Error fetching posts:", error.message);
      }
    };

    fetchPosts();
  }, []);

  const handleTabChange = (tab) => {
    if (tab === activeTab || tabTransitioning) return;

    setTabTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setTabTransitioning(false);
    }, 300);
  };

  const getFilteredPosts = () => {
    let filtered = posts.filter((post) => {
      const status = post.poll ? post.poll.status : post.survey.status;
      return status === activeTab;
    });

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const handleVote = async (postId, voteData) => {
    try {
      if (!token) {
        throw new Error("You must be logged in to vote.");
      }

      const response = await fetch(
        `http://localhost:3000/post/${postId}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify(voteData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit vote");
      }

      const updatedPosts = posts.map((post) => {
        if (post._id === postId) {
          if (post.poll) {
            // Update poll votes
            const updatedOptions = post.poll.options.map((opt) =>
              opt._id === voteData.option
                ? { ...opt, votes: opt.votes + 1 }
                : opt
            );
            return { ...post, poll: { ...post.poll, options: updatedOptions } };
          } else if (post.survey) {
            const surveyQuestion = post.survey.questions[0];

            if (surveyQuestion.type === "multiple-choice") {
              // Update multiple-choice votes
              const updatedVotes = [
                ...surveyQuestion.votes,
                { optionIndex: voteData.option, userId: voteData.userId },
              ];
              return {
                ...post,
                survey: {
                  ...post.survey,
                  questions: [
                    {
                      ...surveyQuestion,
                      votes: updatedVotes,
                    },
                  ],
                },
              };
            } else if (surveyQuestion.type === "open-ended") {
              // Update open-ended responses
              const updatedResponses = [
                ...surveyQuestion.responses,
                { response: voteData.response, userId: voteData.userId },
              ];
              return {
                ...post,
                survey: {
                  ...post.survey,
                  questions: [
                    {
                      ...surveyQuestion,
                      responses: updatedResponses,
                    },
                  ],
                },
              };
            } else if (surveyQuestion.type === "rating") {
              // Update ratings
              const updatedRatings = [
                ...surveyQuestion.ratings,
                { rating: voteData.rating, userId: voteData.userId },
              ];
              return {
                ...post,
                survey: {
                  ...post.survey,
                  questions: [
                    {
                      ...surveyQuestion,
                      ratings: updatedRatings,
                    },
                  ],
                },
              };
            }
          }
        }
        return post;
      });

      setPosts(updatedPosts);
    } catch (error) {
      console.error("Error submitting vote:", error.message);
    }
  };

  const handleViewResults = async (postId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/post/${postId}/results`
      );
      if (!response.ok) throw new Error("Failed to fetch results");
      const data = await response.json();

      const updatedPosts = posts.map((post) => {
        if (post._id === postId) {
          return { ...post, results: data.results };
        }
        return post;
      });

      setPosts(updatedPosts);
    } catch (error) {
      console.error("Error fetching results:", error.message);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  if (loading) {
    return (
      <div className="surveys-loading">
        <div className="surveys-loading-spinner"></div>
        <p>Loading surveys and polls...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="surveys-error">
        <AlertTriangle className="error-icon" />
        <h3 className="surveys-error-title">Error Loading Surveys</h3>
        <p className="surveys-error-message">{error}</p>
        <button
          className="surveys-error-button"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="button-icon" />
          Try Again
        </button>
      </div>
    );
  }

  const filteredPosts = getFilteredPosts();

  return (
    <div className="surveys-container">
      <div className="surveys-header">
        <h1 className="surveys-title">
          Surveys & <span className="gradient-text">Polls</span>
        </h1>
        <p className="surveys-subtitle">
          Share your opinion on community matters
        </p>

        <div className="surveys-search-container">
          <div className="surveys-search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search surveys and polls..."
              className="surveys-search-input"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button
                className="search-clear-button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <button
            className={`filter-button ${isFilterOpen ? "active" : ""}`}
            onClick={toggleFilter}
            aria-label="Filter options"
          >
            <Filter className="filter-icon" />
          </button>
        </div>

        {isFilterOpen && (
          <div className="filter-dropdown">
            <div className="filter-option">
              <input type="checkbox" id="filter-polls" />
              <label htmlFor="filter-polls">Polls only</label>
            </div>
            <div className="filter-option">
              <input type="checkbox" id="filter-surveys" />
              <label htmlFor="filter-surveys">Surveys only</label>
            </div>
            <div className="filter-option">
              <input type="checkbox" id="filter-participated" />
              <label htmlFor="filter-participated">Participated</label>
            </div>
            <button className="filter-apply-button">Apply Filters</button>
          </div>
        )}
      </div>

      <div className="surveys-tabs">
        <div className="surveys-tabs-list">
          <button
            className={`surveys-tab ${activeTab === "active" ? "active" : ""}`}
            onClick={() => handleTabChange("active")}
          >
            <CheckCircle className="tab-icon" />
            Active
          </button>
          <button
            className={`surveys-tab ${
              activeTab === "upcoming" ? "active" : ""
            }`}
            onClick={() => handleTabChange("upcoming")}
          >
            <Clock className="tab-icon" />
            Upcoming
          </button>
          <button
            className={`surveys-tab ${activeTab === "past" ? "active" : ""}`}
            onClick={() => handleTabChange("past")}
          >
            <History className="tab-icon" />
            Past
          </button>
        </div>

        <div
          className={`surveys-tab-content ${
            tabTransitioning ? "tab-transitioning" : ""
          }`}
        >
          {filteredPosts.length > 0 ? (
            <div className="surveys-grid">
              {filteredPosts.map((post) => (
                <SurveyCard
                  key={post._id}
                  post={post}
                  onVote={handleVote}
                  onViewResults={handleViewResults}
                />
              ))}
            </div>
          ) : (
            <div className="surveys-empty">
              <div className="empty-icon-container">
                <ClipboardList className="empty-icon" />
              </div>
              <p>
                No {activeTab} surveys or polls{" "}
                {searchQuery ? "matching your search" : "at the moment"}.
              </p>
              {searchQuery && (
                <button
                  className="clear-search-button"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="surveys-footer">
        <div className="surveys-stats">
          <div className="stat-item">
            <TrendingUp className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{posts.length}</span>
              <span className="stat-label">Total Surveys & Polls</span>
            </div>
          </div>
          <div className="stat-item">
            <Award className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">
                {
                  posts.filter(
                    (post) =>
                      post.poll?.status === "active" ||
                      post.survey?.status === "active"
                  ).length
                }
              </span>
              <span className="stat-label">Active Now</span>
            </div>
          </div>
          <div className="stat-item">
            <ThumbsUp className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">98%</span>
              <span className="stat-label">Participation Rate</span>
            </div>
          </div>
        </div>

        <div className="surveys-help">
          <HelpCircle className="help-icon" />
          <p>
            Need help creating your own survey?{" "}
            <a href="#" className="help-link">
              Check our guide
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SurveysPage;
