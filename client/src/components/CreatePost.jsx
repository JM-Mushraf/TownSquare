import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeProvider";
import { Card } from "../components/Card";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import datepicker styles
import moment from "moment-timezone"; // Import moment-timezone
import {
  FiEdit3,
  FiFileText,
  FiList,
  FiShoppingBag,
  FiMessageCircle,
  FiPlusCircle,
  FiX,
  FiPaperclip,
  FiAlertCircle,
  FiCheckCircle,
  FiImage,
  FiFile,
} from "react-icons/fi";
import { FaBullhorn } from "react-icons/fa";
import "./CreatePost.css";
import { useSelector } from "react-redux";

const MAX_UPLOADS = 3;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

function CreatePost() {
  const { token } = useSelector((state) => state.user);
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "general",
    important: false,
    poll: { question: "", options: ["", ""], deadline: null },
    survey: { questions: [], deadline: null },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [files, setFiles] = useState([]);
  const [activeTab, setActiveTab] = useState("general");
  const [uploadsRemaining, setUploadsRemaining] = useState(MAX_UPLOADS);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (name === "type") {
      setActiveTab(value);
    }
  };

  const handlePollQuestionChange = (e) => {
    setFormData({
      ...formData,
      poll: { ...formData.poll, question: e.target.value },
    });
  };

  const handlePollOptionChange = (index, value) => {
    const newOptions = [...formData.poll.options];
    newOptions[index] = value;
    setFormData({
      ...formData,
      poll: { ...formData.poll, options: newOptions },
    });
  };

  const addPollOption = () => {
    setFormData({
      ...formData,
      poll: { ...formData.poll, options: [...formData.poll.options, ""] },
    });
  };

  const removePollOption = (index) => {
    if (formData.poll.options.length <= 2) return; // Minimum 2 options
    const newOptions = [...formData.poll.options];
    newOptions.splice(index, 1);
    setFormData({
      ...formData,
      poll: { ...formData.poll, options: newOptions },
    });
  };

  const handleSurveyQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.survey.questions];
    newQuestions[index][field] = value;
    setFormData({
      ...formData,
      survey: { ...formData.survey, questions: newQuestions },
    });
  };

  const addSurveyQuestion = () => {
    setFormData({
      ...formData,
      survey: {
        ...formData.survey,
        questions: [
          ...formData.survey.questions,
          { question: "", type: "multiple-choice", options: [] },
        ],
      },
    });
  };

  const removeSurveyQuestion = (index) => {
    const newQuestions = [...formData.survey.questions];
    newQuestions.splice(index, 1);
    setFormData({
      ...formData,
      survey: { ...formData.survey, questions: newQuestions },
    });
  };

  const handleSurveyOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...formData.survey.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setFormData({
      ...formData,
      survey: { ...formData.survey, questions: newQuestions },
    });
  };

  const addSurveyOption = (questionIndex) => {
    const newQuestions = [...formData.survey.questions];
    newQuestions[questionIndex].options.push("");
    setFormData({
      ...formData,
      survey: { ...formData.survey, questions: newQuestions },
    });
  };

  const removeSurveyOption = (questionIndex, optionIndex) => {
    const newQuestions = [...formData.survey.questions];
    newQuestions[questionIndex].options.splice(optionIndex, 1);
    setFormData({
      ...formData,
      survey: { ...formData.survey, questions: newQuestions },
    });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length + files.length > MAX_UPLOADS) {
      alert(`You can only upload a maximum of ${MAX_UPLOADS} files.`);
      return;
    }
    setFiles([...files, ...selectedFiles]);
    setUploadsRemaining(MAX_UPLOADS - (files.length + selectedFiles.length));
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    setUploadsRemaining(MAX_UPLOADS - newFiles.length);
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) {
      return <FiImage className="file-type-icon" />;
    }
    return <FiFile className="file-type-icon" />;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");
  
    try {
      // Validate form
      if (!formData.title || !formData.description) {
        throw new Error("Title and description are required");
      }
  
      if (formData.type === "poll") {
        if (!formData.poll.question) {
          throw new Error("Poll question is required");
        }
        if (formData.poll.options.filter((opt) => opt.trim()).length < 2) {
          throw new Error("Polls require at least 2 options");
        }
        if (!formData.poll.deadline) {
          throw new Error("Poll deadline is required");
        }
      }
  
      if (formData.type === "survey") {
        if (formData.survey.questions.length === 0) {
          throw new Error("Surveys require at least one question");
        }
        if (!formData.survey.deadline) {
          throw new Error("Survey deadline is required");
        }
      }
  
      // Prepare data for submission
      const postData = new FormData();
      postData.append("title", formData.title);
      postData.append("description", formData.description);
      postData.append("type", formData.type);
      postData.append("important", formData.important);
  
      // Only include poll data if type is poll
      if (formData.type === "poll") {
        const pollData = {
          question: formData.poll.question,
          options: formData.poll.options,
          deadline: moment(formData.poll.deadline).format("YYYY-MM-DD"), // Format as date string
        };
        postData.append("poll", JSON.stringify(pollData)); // Send as JSON string
      }
  
      // Only include survey data if type is survey
      if (formData.type === "survey") {
        const surveyData = {
          questions: formData.survey.questions,
          deadline: moment(formData.survey.deadline).format("YYYY-MM-DD"), // Format as date string
        };
        postData.append("survey", JSON.stringify(surveyData)); // Send as JSON string
      }
  
      // Append files if any
      if (files.length > 0) {
        files.forEach((file) => {
          postData.append("attachments", file);
        });
      }
  
      // Debugging: Log FormData contents
      for (let [key, value] of postData.entries()) {
        console.log(key, value);
      }
  
      if (!token) {
        throw new Error("User is not authenticated");
      }
  
      // API call to create post
      const response = await axios.post(
        "http://localhost:3000/post/create",
        postData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      setSuccess("Post created successfully!");
  
      // Reset form after successful submission
      setFormData({
        title: "",
        description: "",
        type: "general",
        important: false,
        poll: { question: "", options: ["", ""], deadline: null },
        survey: { questions: [], deadline: null },
      });
      setFiles([]);
      setActiveTab("general");
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`create-post-container ${theme}`}>
      <motion.main
        className="create-post-main"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="create-post-header" variants={itemVariants}>
          <h1 className="page-title">Create New Post</h1>
          <p className="page-subtitle">
            Share your thoughts, questions, or concerns with the community
          </p>
        </motion.div>

        <motion.div className="post-type-tabs" variants={itemVariants}>
          <button
            className={`post-type-tab ${
              activeTab === "general" ? "active" : ""
            }`}
            onClick={() => {
              setActiveTab("general");
              setFormData({ ...formData, type: "general" });
            }}
          >
            <FiMessageCircle />
            <span>General</span>
          </button>
          <button
            className={`post-type-tab ${activeTab === "issue" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("issue");
              setFormData({ ...formData, type: "issue" });
            }}
          >
            <FiAlertCircle />
            <span>Issue</span>
          </button>
          <button
            className={`post-type-tab ${activeTab === "poll" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("poll");
              setFormData({ ...formData, type: "poll" });
            }}
          >
            <FiList />
            <span>Poll</span>
          </button>
          <button
            className={`post-type-tab ${
              activeTab === "marketplace" ? "active" : ""
            }`}
            onClick={() => {
              setActiveTab("marketplace");
              setFormData({ ...formData, type: "marketplace" });
            }}
          >
            <FiShoppingBag />
            <span>Marketplace</span>
          </button>
          <button
            className={`post-type-tab ${
              activeTab === "announcements" ? "active" : ""
            }`}
            onClick={() => {
              setActiveTab("announcements");
              setFormData({ ...formData, type: "announcements" });
            }}
          >
            <FaBullhorn />
            <span>Announcements</span>
          </button>
          <button
            className={`post-type-tab ${activeTab === "survey" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("survey");
              setFormData({ ...formData, type: "survey" });
            }}
          >
            <FiList />
            <span>Survey</span>
          </button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="create-post-card">
            <AnimatePresence>
              {error && (
                <motion.div
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <FiAlertCircle className="message-icon" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {success && (
                <motion.div
                  className="success-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <FiCheckCircle className="message-icon" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>
              <motion.div className="form-group" variants={fadeIn}>
                <label htmlFor="title">
                  <FiEdit3 className="input-icon" /> Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter a descriptive title"
                  className="form-control"
                  required
                />
              </motion.div>

              <motion.div className="form-group" variants={fadeIn}>
                <label htmlFor="description">
                  <FiFileText className="input-icon" /> Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide details about your post"
                  className="form-control"
                  rows="5"
                  required
                ></textarea>
              </motion.div>

              <AnimatePresence mode="wait">
                {activeTab === "poll" && (
                  <motion.div
                    className="poll-options-container"
                    key="poll-options"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label>
                      <FiList className="input-icon" /> Poll Question
                    </label>
                    <input
                      type="text"
                      value={formData.poll.question}
                      onChange={handlePollQuestionChange}
                      placeholder="Enter your poll question"
                      className="form-control"
                      required
                    />
                    <label>Poll Options</label>
                    {formData.poll.options.map((option, index) => (
                      <motion.div
                        key={index}
                        className="poll-option-input"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <input
                          type="text"
                          value={option}
                          onChange={(e) =>
                            handlePollOptionChange(index, e.target.value)
                          }
                          placeholder={`Option ${index + 1}`}
                          className="form-control"
                          required
                        />
                        {formData.poll.options.length > 2 && (
                          <button
                            type="button"
                            className="remove-option-btn"
                            onClick={() => removePollOption(index)}
                          >
                            <FiX />
                          </button>
                        )}
                      </motion.div>
                    ))}
                    <motion.button
                      type="button"
                      className="add-option-btn"
                      onClick={addPollOption}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiPlusCircle className="btn-icon" /> Add Option
                    </motion.button>
                    <label>Poll Deadline</label>
                    <DatePicker
                      selected={formData.poll.deadline}
                      onChange={(date) =>
                        setFormData({
                          ...formData,
                          poll: { ...formData.poll, deadline: date },
                        })
                      }
                      dateFormat="MMMM d, yyyy" // Only show date
                      className="form-control"
                      placeholderText="Select deadline"
                      minDate={new Date()}
                      required
                    />
                  </motion.div>
                )}

                {activeTab === "survey" && (
                  <motion.div
                    className="survey-questions-container"
                    key="survey-questions"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label>
                      <FiList className="input-icon" /> Survey Questions
                    </label>
                    {formData.survey.questions.map((question, index) => (
                      <motion.div
                        key={index}
                        className="survey-question-input"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) =>
                            handleSurveyQuestionChange(
                              index,
                              "question",
                              e.target.value
                            )
                          }
                          placeholder={`Question ${index + 1}`}
                          className="form-control"
                          required
                        />
                        <select
                          value={question.type}
                          onChange={(e) =>
                            handleSurveyQuestionChange(
                              index,
                              "type",
                              e.target.value
                            )
                          }
                          className="form-control"
                        >
                          <option value="multiple-choice">Multiple Choice</option>
                          <option value="open-ended">Open Ended</option>
                          <option value="rating">Rating</option>
                        </select>
                        {question.type === "multiple-choice" && (
                          <div className="survey-options-container">
                            {question.options.map((option, optIndex) => (
                              <input
                                key={optIndex}
                                type="text"
                                value={option}
                                onChange={(e) =>
                                  handleSurveyOptionChange(
                                    index,
                                    optIndex,
                                    e.target.value
                                  )
                                }
                                placeholder={`Option ${optIndex + 1}`}
                                className="form-control"
                              />
                            ))}
                            <button
                              type="button"
                              className="add-option-btn"
                              onClick={() => addSurveyOption(index)}
                            >
                              <FiPlusCircle className="btn-icon" /> Add Option
                            </button>
                          </div>
                        )}
                        <button
                          type="button"
                          className="remove-question-btn"
                          onClick={() => removeSurveyQuestion(index)}
                        >
                          <FiX />
                        </button>
                      </motion.div>
                    ))}
                    <motion.button
                      type="button"
                      className="add-question-btn"
                      onClick={addSurveyQuestion}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiPlusCircle className="btn-icon" /> Add Question
                    </motion.button>
                    <label>Survey Deadline</label>
                    <DatePicker
                      selected={formData.survey.deadline}
                      onChange={(date) =>
                        setFormData({
                          ...formData,
                          survey: { ...formData.survey, deadline: date },
                        })
                      }
                      dateFormat="MMMM d, yyyy" // Only show date
                      className="form-control"
                      placeholderText="Select deadline"
                      minDate={new Date()}
                      required
                    />
                  </motion.div>
                )}

                {activeTab === "announcements" && (
                  <motion.div
                    className="announcements-fields"
                    key="announcements-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="form-group">
                      <label htmlFor="important">
                        <FiAlertCircle className="input-icon" /> Important
                        Announcement
                      </label>
                      <input
                        type="checkbox"
                        id="important"
                        name="important"
                        checked={formData.important}
                        onChange={handleChange}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div className="form-group" variants={fadeIn}>
                <label htmlFor="attachments">
                  <FiPaperclip className="input-icon" /> Attachments
                </label>
                <div className="file-upload-container">
                  <motion.label
                    className="file-upload-label"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiPaperclip className="upload-icon" /> Choose Files
                    <input
                      type="file"
                      id="attachments"
                      onChange={handleFileChange}
                      multiple
                      className="file-input"
                      disabled={uploadsRemaining === 0}
                    />
                  </motion.label>
                  <span className="file-help-text">
                    Upload images or documents (optional) - {uploadsRemaining}{" "}
                    uploads remaining
                  </span>
                </div>

                {files.length > 0 && (
                  <motion.div
                    className="file-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {files.map((file, index) => (
                      <motion.div
                        key={index}
                        className="file-item"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {getFileIcon(file.type)}
                        <span className="file-name">{file.name}</span>
                        <motion.button
                          type="button"
                          className="remove-file-btn"
                          onClick={() => removeFile(index)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiX />
                        </motion.button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>

              <motion.div className="form-actions" variants={fadeIn}>
                <motion.button
                  type="button"
                  className="cancel-button"
                  onClick={() => window.history.back()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  onClick={handleSubmit}
                  className={`primary-button ${
                    isSubmitting ? "submitting" : ""
                  }`}
                  disabled={isSubmitting}
                  whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Creating...
                    </>
                  ) : (
                    "Create Post"
                  )}
                </motion.button>
              </motion.div>
            </form>
          </Card>
        </motion.div>
      </motion.main>
    </div>
  );
}

export default CreatePost;