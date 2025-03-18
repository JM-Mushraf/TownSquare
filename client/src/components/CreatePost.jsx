import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeProvider";
import { Card } from "../components/Card";
import axios from "axios";
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
  FiMapPin,
  FiDollarSign,
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
  });

  const [pollOptions, setPollOptions] = useState(["", ""]);
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
  const [isImportant, setIsImportant] = useState(false);

  const toggleImportance = async () => {
    const newImportantState = !isImportant;
    setIsImportant(newImportantState);
    setFormData({
      ...formData,
      important: newImportantState,
    });
  };

  const handlePollOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const addPollOption = () => {
    setPollOptions([...pollOptions, ""]);
  };

  const removePollOption = (index) => {
    if (pollOptions.length <= 2) return; // Minimum 2 options
    const newOptions = [...pollOptions];
    newOptions.splice(index, 1);
    setPollOptions(newOptions);
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
    const updatedFiles = files.filter((_, i) => i !== index);
    newFiles.splice(index, 1);
    setFiles(newFiles);
    setUploadsRemaining(MAX_UPLOADS - updatedFiles.length);
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

      if (
        formData.type === "poll" &&
        pollOptions.filter((opt) => opt.trim()).length < 2
      ) {
        throw new Error("Polls require at least 2 options");
      }

      // Prepare data for submission
      const postData = new FormData();
      postData.append("title", formData.title);
      postData.append("description", formData.description);
      postData.append("type", formData.type);
      postData.append("important", formData.important);

      // Add poll options if type is poll
      if (formData.type === "poll") {
        postData.append(
          "solutions",
          JSON.stringify(
            pollOptions
              .filter((opt) => opt.trim())
              .map((text) => ({ text, votes: 0 }))
          )
        );
      }

      // Append files if any
      if (files.length > 0) {
        files.forEach((file) => {
          postData.append("attachments", file);
        });
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
      });
      setPollOptions(["", ""]);
      setFiles([]);
      setActiveTab("general");
    } catch (error) {
      setError(error.message);
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
                      <FiList className="input-icon" /> Poll Options
                    </label>
                    {pollOptions.map((option, index) => (
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
                        {pollOptions.length > 2 && (
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
                  </motion.div>
                )}

                {activeTab === "marketplace" && (
                  <motion.div
                    className="marketplace-fields"
                    key="marketplace-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="form-group">
                      <label htmlFor="price">
                        <FiDollarSign className="input-icon" /> Price (optional)
                      </label>
                      <input
                        type="text"
                        id="price"
                        name="price"
                        placeholder="Enter price or 'Free'"
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="location">
                        <FiMapPin className="input-icon" /> Location (optional)
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        placeholder="Where is this item available?"
                        className="form-control"
                      />
                    </div>
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
                      <motion.div
                        className="toggle-switch"
                        onClick={toggleImportance}
                        style={{
                          backgroundColor: isImportant ? "rgb(76 106 175)" : "rgb(30 46 82)", // Background color
                        }}
                        initial={false} // Disable initial animation
                        animate={{
                          backgroundColor: isImportant ? "rgb(76 106 175)" : "rgb(30 46 82)", // Animate background color
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div
                          className="slider"
                          animate={{
                            x: isImportant ? 25 : 0, // Move slider to the right or left
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                        />
                      </motion.div>
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
