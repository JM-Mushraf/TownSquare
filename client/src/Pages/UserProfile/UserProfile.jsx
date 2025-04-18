"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import {
  User,
  MapPin,
  Calendar,
  Shield,
  Phone,
  Mail,
  Edit,
  CheckCircle,
  Building,
  Home,
  Bookmark,
  Image,
  File,
} from "lucide-react";
import "./UserProfile.css";

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [isFetchingBookmarks, setIsFetchingBookmarks] = useState(false);
  const { token, userData } = useSelector((state) => state.user);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (activeTab === "bookmarks" && token) {
        // Added token check
        setIsFetchingBookmarks(true);
        try {
          const response = await axios.get(
            "http://localhost:3000/user/getbookmarks",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = response.data.data;

          console.log("Bookmarks data:", data); // Debug log
          if (data && data.bookmarks) {
            setBookmarkedPosts(data.bookmarks);
          } else {
            console.error("Unexpected response format:", data);
            setBookmarkedPosts([]);
          }
        } catch (error) {
          console.error(
            "Error fetching bookmarks:",
            error.response?.data?.message || error.message
          );
          setBookmarkedPosts([]);
        } finally {
          setIsFetchingBookmarks(false);
        }
      }
    };

    fetchBookmarks();
  }, [activeTab, token]); // Added token to dependencies

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderAttachment = (attachment) => {
    if (attachment.fileType.startsWith("image/")) {
      return (
        <div className="attachment-preview" key={attachment.publicId}>
          <img
            src={attachment.url}
            alt="attachment"
            className="attachment-image"
          />
        </div>
      );
    } else {
      return (
        <div className="attachment-preview" key={attachment.publicId}>
          <File size={16} />
          <span>File</span>
        </div>
      );
    }
  };

  return (
    <div className="profile-container">
      <motion.div
        className="profile-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="profile-header-content">
          <motion.div
            className="profile-avatar-container"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <img
              src={userData.avatar || "/placeholder.svg"}
              alt={userData.username}
              className="profile-avatar"
            />
            <div className="profile-avatar-badge">
              <CheckCircle size={24} />
            </div>
          </motion.div>

          <motion.div
            className="profile-header-info"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h1 className="profile-name">{userData.username}</h1>
            <div className="profile-role">
              <Shield size={16} />
              <span>{userData.role}</span>
            </div>
            <div className="profile-communities">
              <Building size={16} />
              <span>Communities: {userData.communitiesJoined.join(", ")}</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="profile-actions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <button className="profile-edit-button">
            <Edit size={16} />
            Edit Profile
          </button>
        </motion.div>
      </motion.div>

      <motion.div
        className="profile-tabs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <button
          className={`profile-tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => handleTabChange("overview")}
        >
          Overview
        </button>
        <button
          className={`profile-tab ${activeTab === "bookmarks" ? "active" : ""}`}
          onClick={() => handleTabChange("bookmarks")}
        >
          Bookmarks
        </button>
        <button
          className={`profile-tab ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => handleTabChange("settings")}
        >
          Settings
        </button>
      </motion.div>

      <motion.div
        className="profile-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        {activeTab === "overview" && (
          <div className="profile-overview">
            <motion.div
              className="profile-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <div className="profile-card-header">
                <User size={20} />
                <h2>Personal Information</h2>
              </div>
              <div className="profile-card-content">
                <div className="profile-info-item">
                  <Mail size={16} />
                  <div>
                    <span className="profile-info-label">Email</span>
                    <span className="profile-info-value">
                      {userData.email.replace(/(.{2})(.*)(@.*)/, "$1****$3")}
                    </span>
                  </div>
                </div>
                <div className="profile-info-item">
                  <Phone size={16} />
                  <div>
                    <span className="profile-info-label">Phone</span>
                    <span className="profile-info-value">
                      {userData.phone.replace(
                        /(\d{2})(\d+)(\d{2})/,
                        "$1••••••$3"
                      )}
                    </span>
                  </div>
                </div>
                <div className="profile-info-item">
                  <Calendar size={16} />
                  <div>
                    <span className="profile-info-label">Member Since</span>
                    <span className="profile-info-value">
                      {formatDate(userData.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="profile-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <div className="profile-card-header">
                <MapPin size={20} />
                <h2>Location</h2>
              </div>
              <div className="profile-card-content">
                <div className="profile-info-item">
                  <Home size={16} />
                  <div>
                    <span className="profile-info-label">Address</span>
                    <span className="profile-info-value">
                      {userData.location.address}
                    </span>
                  </div>
                </div>
                <div className="profile-info-item">
                  <MapPin size={16} />
                  <div>
                    <span className="profile-info-label">City</span>
                    <span className="profile-info-value">
                      {userData.location.city}
                    </span>
                  </div>
                </div>
                <div className="profile-info-item">
                  <Building size={16} />
                  <div>
                    <span className="profile-info-label">District</span>
                    <span className="profile-info-value">
                      {userData.location.district}
                    </span>
                  </div>
                </div>
                <div className="profile-info-item">
                  <MapPin size={16} />
                  <div>
                    <span className="profile-info-label">County</span>
                    <span className="profile-info-value">
                      {userData.location.county}
                    </span>
                  </div>
                </div>
                <div className="profile-info-item">
                  <Mail size={16} />
                  <div>
                    <span className="profile-info-label">Postal Code</span>
                    <span className="profile-info-value">
                      {userData.location.postcode}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="profile-card profile-stats-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <div className="profile-card-header">
                <h2>Activity Stats</h2>
              </div>
              <div className="profile-stats">
                <div className="profile-stat">
                  <div className="profile-stat-value">12</div>
                  <div className="profile-stat-label">Posts</div>
                </div>
                <div className="profile-stat">
                  <div className="profile-stat-value">48</div>
                  <div className="profile-stat-label">Comments</div>
                </div>
                <div className="profile-stat">
                  <div className="profile-stat-value">156</div>
                  <div className="profile-stat-label">Points</div>
                </div>
                <div className="profile-stat">
                  <div className="profile-stat-value">3</div>
                  <div className="profile-stat-label">Badges</div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        {activeTab === "bookmarks" && (
          <div className="bookmarks-grid">
            {isFetchingBookmarks ? (
              <p>Loading bookmarks...</p>
            ) : bookmarkedPosts.length === 0 ? (
              <p>No bookmarks available.</p>
            ) : (
              bookmarkedPosts.map((bookmark) => (
                <div
                  key={bookmark._id}
                  className="bookmark-card"
                  onClick={() =>
                    (window.location.href = `http://localhost:5173/post/${bookmark._id}`)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <h3 className="bookmark-title">{bookmark.title}</h3>
                  <p className="bookmark-description">{bookmark.description}</p>
                  {bookmark.attachments && bookmark.attachments.length > 0 && (
                    <div className="bookmark-attachments">
                      {bookmark.attachments.map(renderAttachment)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="profile-settings">
            <div className="profile-card">
              <div className="profile-card-header">
                <h2>Account Settings</h2>
              </div>
              <div className="profile-card-content">
                <p className="profile-empty-state">
                  Settings options will appear here
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UserProfile;
