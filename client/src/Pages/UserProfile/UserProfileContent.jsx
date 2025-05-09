"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useTheme } from "../../components/ThemeProvider";
import { useToast } from "./UserProfile";
import { useAsyncError, useNavigate } from "react-router-dom";
import {
  User,
  MapPin,
  Calendar,
  Shield,
  Edit,
  CheckCircle,
  Building,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Activity,
  Settings,
  Clock,
  DollarSign,
  AlertCircle,
  Search,
  Filter,
  ExternalLink,
  Trash2,
  RefreshCw,
  Bell,
  Eye,
  EyeOff,
  ArrowUpRight,
  MoreHorizontal,
  Zap,
  Star,
  Award,
  Bookmark,
  Heart,
  Share2,
  Mail,
  Phone,
  Lock,
  FileText,
  Camera,
  X,
  ArrowLeft,
  Loader,
  Save,
  AlertTriangle,
  Send,
  File,
} from "lucide-react";

// Debounce utility to limit API calls
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Image carousel component for bookmarks
const BookmarkImageCarousel = ({ attachments }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const imageAttachments = attachments.filter((att) =>
    att.fileType?.startsWith("image/")
  );

  if (imageAttachments.length === 0) return null;

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex === imageAttachments.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? imageAttachments.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index, e) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  // If there's only one image, render it without carousel controls
  if (imageAttachments.length === 1) {
    return (
      <div className="neo-bookmark-featured-image">
        <img
          src={imageAttachments[0].url || "/placeholder.svg"}
          alt="bookmark"
        />
      </div>
    );
  }

  return (
    <div className="neo-bookmark-carousel">
      <div
        className="neo-carousel-container"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {imageAttachments.map((image, index) => (
          <div className="neo-carousel-slide" key={image.publicId || index}>
            <img
              src={image.url || "/placeholder.svg"}
              alt={`slide-${index}`}
              className="neo-carousel-image"
            />
          </div>
        ))}
      </div>

      <button className="neo-carousel-arrow prev" onClick={prevSlide}>
        <ArrowLeft size={16} />
      </button>

      <button className="neo-carousel-arrow next" onClick={nextSlide}>
        <ArrowLeft size={16} style={{ transform: "rotate(180deg)" }} />
      </button>

      <div className="neo-carousel-nav">
        {imageAttachments.map((_, index) => (
          <button
            key={index}
            className={`neo-carousel-dot ${
              index === currentIndex ? "active" : ""
            }`}
            onClick={(e) => goToSlide(index, e)}
          />
        ))}
      </div>
    </div>
  );
};

// Message grouping utility
const groupMessagesByPost = (messages) => {
  const uniquePostIds = [...new Set(messages.map((msg) => msg.postId))];

  return uniquePostIds.map((postId) => {
    const postMessages = messages.filter((msg) => msg.postId === postId);
    const sortedMessages = [...postMessages].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return {
      postId,
      postTitle: postMessages[0]?.postTitle || "Unknown Post",
      postDescription: postMessages[0]?.postDescription || "",
      postPrice: postMessages[0]?.postPrice || 0,
      postLocation: postMessages[0]?.postLocation || "",
      postStatus: postMessages[0]?.postStatus || "unknown",
      postAttachments: postMessages[0]?.postAttachments || [],
      messageCount: postMessages.length,
      unreadCount: postMessages.filter((msg) => !msg.isRead).length,
      latestMessage: sortedMessages[0],
      messages: sortedMessages,
    };
  });
};

// Child component containing the main profile logic
export const UserProfileContent = () => {
  const [activeTab, setActiveTab] = useState("messages");
  const { userData, token } = useSelector((state) => state.user);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [allMessages, setAllMessages] = useState([]);
  const [expandedPost, setExpandedPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [error, setError] = useState(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const { isDarkMode } = useTheme();
  const { addToast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();
  // Bookmarks state
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [isFetchingBookmarks, setIsFetchingBookmarks] = useState(false);

  // Edit Profile State
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeSection, setActiveSection] = useState("general");
  const [editLoading, setEditLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [editError, setEditError] = useState(null);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activityStats, setActivitystats] = useState({ postCount: 0, commentCount: 0 });
  const [isGettingActivityStats,setIsGettingActivityStats]=useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    bio: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState({});
  const [formErrors, setFormErrors] = useState({});

  // Stats for the overview tab
  const stats = {
    posts: 42,
    upvotes: 128,
    comments: 76,
    communities: userData?.communitiesJoined?.length || 3,
    reputation: 750,
    badges: [
      { name: "Early Adopter", icon: <Zap size={14} /> },
      { name: "Top Contributor", icon: <Star size={14} /> },
      { name: "Community Leader", icon: <Award size={14} /> },
    ],
  };

  // Recent activity for the activity tab
  const recentActivity = [
    {
      type: "post",
      title: "Looking for recommendations on local restaurants",
      date: new Date(Date.now() - 86400000 * 2),
    },
    {
      type: "comment",
      title: "Commented on 'Community Garden Project'",
      date: new Date(Date.now() - 86400000 * 5),
    },
    {
      type: "upvote",
      title: "Upvoted 'Weekend Hiking Group'",
      date: new Date(Date.now() - 86400000 * 7),
    },
    {
      type: "bookmark",
      title: "Bookmarked 'Vintage Bicycle for Sale'",
      date: new Date(Date.now() - 86400000 * 10),
    },
  ];

  // Create axios instance with default config
  const api = axios.create({
    baseURL: "http://localhost:3000",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add request interceptor to inject token
  api.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token.trim()}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add response interceptor to handle errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      return Promise.reject(error);
    }
  );

  // Initialize form data when edit profile is opened
  useEffect(() => {
    if (showEditProfile && userData) {
      setFormData({
        username: userData.username || "",
        email: userData.email || "",
        phone: userData.phone || "",
        bio: userData.bio || "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setAvatarPreview(null);
      setAvatarFile(null);
      setUploadProgress(0);
      setEditError(null);
      setSuccess(null);
      setVerificationRequired(false);
      setVerificationCode("");
      setVerifyError(null);
      setTouched({});
      setFormErrors({});
      setResendSuccess(false);
      setTimeRemaining(30);

      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [showEditProfile, userData]);

  // Timer effect
  useEffect(() => {
    if (verificationRequired) {
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Start new timer
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            addToast(
              "Verification code has expired. You can now request a new one.",
              "info"
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [verificationRequired, addToast]);

  // Form validation
  useEffect(() => {
    const newErrors = {};

    if (touched.username && !formData.username) {
      newErrors.username = "Username is required";
    }

    if (touched.email && !formData.email) {
      newErrors.email = "Email is required";
    } else if (touched.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (touched.phone && formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (touched.bio && formData.bio && formData.bio.length > 500) {
      newErrors.bio = "Bio must be less than 500 characters";
    }

    if (touched.newPassword && formData.newPassword) {
      if (!formData.oldPassword) {
        newErrors.oldPassword = "Current password is required";
      }

      if (formData.newPassword.length < 8) {
        newErrors.newPassword = "Password must be at least 8 characters";
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setFormErrors(newErrors);
  }, [formData, touched]);

  useEffect(()=>{
    const fetchUserActivityStats = async () => {
      if (activeTab === "overview" && token) {
        setIsGettingActivityStats(true);
        try {
          console.log("Making API call..."); // Debug log
      const response = await api.get('/user/getUserActivityStats');
          console.log(response);
          
          // Check for successful response and expected data structure
          if (response.data?.success && response.data?.data?.activityStats) {
            setActivitystats(response.data.data.activityStats);
            console.log(response.data.data.activityStats);
            
          } else {
            // Set default values if data is not in expected format
            setActivitystats({ postCount: 0, commentCount: 0 });
          }
        } catch (error) {
          console.error("Error fetching activity stats:", error);
          // Set default values on error
          setActivitystats({ postCount: 0, commentCount: 0 });
          addToast("Failed to load activity stats", "error");
        } finally {
          setIsGettingActivityStats(false);
        }
      }
    };
    fetchUserActivityStats()
  },[activeTab,token])
  // Fetch bookmarks when bookmarks tab is active
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (activeTab === "bookmarks" && token) {
        setIsFetchingBookmarks(true);
        try {
          const response = await api.get("/user/getbookmarks");
          const data = response.data.data;

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
          setError("Failed to fetch bookmarks. Please try again.");
        } finally {
          setIsFetchingBookmarks(false);
        }
      }
    };

    fetchBookmarks();
  }, [activeTab, token]);

  // Memoize grouped messages
  const groupedMessages = useMemo(() => {
    return groupMessagesByPost(allMessages);
  }, [allMessages]);

  // Apply filters and search
  const filteredMessages = useMemo(() => {
    return groupedMessages
      .filter((post) => {
        if (filterStatus !== "all" && post.postStatus !== filterStatus) {
          return false;
        }
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            post.postTitle.toLowerCase().includes(query) ||
            post.postDescription.toLowerCase().includes(query) ||
            post.postLocation.toLowerCase().includes(query) ||
            post.messages.some(
              (msg) =>
                msg.message?.toLowerCase().includes(query) ||
                msg.sender?.username?.toLowerCase().includes(query)
            )
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (b.unreadCount !== a.unreadCount) {
          return b.unreadCount - a.unreadCount;
        }
        return (
          new Date(b.latestMessage?.createdAt) -
          new Date(a.latestMessage?.createdAt)
        );
      });
  }, [groupedMessages, searchQuery, filterStatus]);

  const fetchAllMessages = useCallback(
    debounce(async () => {
      if (!token) {
        setError("You are not authenticated. Please log in.");
        setMessagesLoading(false);
        return;
      }

      try {
        setMessagesLoading(true);
        setError(null);
        const response = await api.get("/post/marketplace/messages");
        if (response.data.success) {
          setAllMessages(response.data.messages || []);
        } else {
          setError(response.data.message || "Failed to fetch messages");
        }
      } catch (error) {
        console.error("Error fetching messages:", error.message);
      } finally {
        setMessagesLoading(false);
        setRefreshing(false);
      }
    }, 500),
    [token]
  );

  const refreshMessages = () => {
    setRefreshing(true);
    fetchAllMessages();
  };

  useEffect(() => {
    if (activeTab === "messages" && !allMessages.length) {
      fetchAllMessages();
    }
  }, [activeTab, fetchAllMessages, allMessages.length]);

  const markMessageAsRead = async (postId, messageId) => {
    if (!token) return;

    try {
      const response = await api.patch(
        `/post/marketplace/messages/${postId}/${messageId}/read`
      );
      if (response.data.success) {
        setAllMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.messageId === messageId ? { ...msg, isRead: true } : msg
          )
        );
      }
    } catch (error) {
      console.error("Error marking message as read:", error.message);
      setError("Failed to mark message as read. Please try again.");
    }
  };

  const markAllPostMessagesAsRead = async (postId) => {
    if (!token) return;

    try {
      const response = await api.patch(
        `/post/marketplace/messages/${postId}/read-all`
      );
      if (response.data.success) {
        setAllMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.postId === postId ? { ...msg, isRead: true } : msg
          )
        );
      }
    } catch (error) {
      console.error("Error marking all messages as read:", error.message);
      setError("Failed to mark messages as read. Please try again.");
    }
  };

  const toggleExpandPost = (postId) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      const post = groupedMessages.find((p) => p.postId === postId);
      if (post && post.unreadCount > 0) {
        markAllPostMessagesAsRead(postId);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
      }).format(date);
    } else {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(date);
    }
  };

  const formatTimeAgo = (dateString) => {
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "neo-status-available";
      case "pending":
        return "neo-status-pending";
      case "sold":
        return "neo-status-sold";
      default:
        return "neo-status-default";
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "post":
        return <MessageCircle size={16} />;
      case "comment":
        return <MessageCircle size={16} />;
      case "upvote":
        return <Heart size={16} />;
      case "bookmark":
        return <Bookmark size={16} />;
      default:
        return <Activity size={16} />;
    }
  };

  // Render attachment for bookmarks
  const renderAttachment = (attachment) => {
    if (attachment.fileType.startsWith("image/")) {
      return (
        <div className="attachment-preview" key={attachment.publicId}>
          <img
            src={attachment.url || "/placeholder.svg"}
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
  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const response = await api.delete("/user/delete");
      if (response.data.success) {
        addToast("Account deleted successfully", "success");
        // Redirect to home or login page after deletion
        navigate("/");
        // You might also want to dispatch a logout action here
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      addToast(
        error.response?.data?.message || "Failed to delete account",
        "error"
      );
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };
  // Edit Profile Functions
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return null;

    const formData = new FormData();
    formData.append("avatar", avatarFile);

    try {
      setEditLoading(true);

      const response = await api.patch("/user/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (response.data.success) {
        return response.data.data.avatar;
      }

      return null;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      setEditError(error.response?.data?.message || "Failed to upload avatar");
      addToast("Failed to upload avatar", "error");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if there are any validation errors
    if (Object.keys(formErrors).length > 0) {
      // Mark all fields as touched to show errors
      const allTouched = {};
      Object.keys(formData).forEach((key) => {
        allTouched[key] = true;
      });
      setTouched(allTouched);
      return;
    }

    setEditLoading(true);
    setEditError(null);
    setSuccess(null);

    try {
      // First upload avatar if changed
      let avatarUrl = null;
      if (avatarFile) {
        avatarUrl = await uploadAvatar();
        if (!avatarUrl && avatarFile) {
          setEditLoading(false);
          return;
        }
      }

      // Prepare data for account update
      const updateData = {};

      if (formData.username && formData.username !== userData.username) {
        updateData.username = formData.username;
      }

      if (formData.email && formData.email !== userData.email) {
        updateData.email = formData.email;
      }

      if (formData.phone && formData.phone !== userData.phone) {
        updateData.phone = formData.phone;
      }

      if (formData.bio && formData.bio !== userData.bio) {
        updateData.bio = formData.bio;
      }

      if (formData.newPassword && formData.oldPassword) {
        updateData.oldPassword = formData.oldPassword;
        updateData.newPassword = formData.newPassword;
      }

      // Only proceed if there are changes
      if (Object.keys(updateData).length === 0 && !avatarUrl) {
        setEditError("No changes to save");
        addToast("No changes to save", "info");
        setEditLoading(false);
        return;
      }

      // Update account details
      if (Object.keys(updateData).length > 0) {
        const response = await api.put("/user/update", updateData);

        if (response.data.success) {
          if (response.data.data.verificationRequired) {
            setVerificationRequired(true);
            setTimeRemaining(30);
            addToast(
              "Verification required. Please check your email for the code.",
              "info"
            );
          } else {
            setSuccess("Profile updated successfully");
            addToast("Profile updated successfully", "success");
            setTimeout(() => {
              setShowEditProfile(false);
              window.location.reload();
            }, 1500);
          }
        }
      } else if (avatarUrl) {
        setSuccess("Profile picture updated successfully");
        addToast("Profile picture updated successfully", "success");
        setTimeout(() => {
          setShowEditProfile(false);
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setEditError(error.response?.data?.message || "Failed to update profile");
      addToast(
        error.response?.data?.message || "Failed to update profile",
        "error"
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();

    if (!verificationCode) {
      setVerifyError("Verification code is required");
      addToast("Verification code is required", "error");
      return;
    }

    setVerifyLoading(true);
    setVerifyError(null);

    try {
      const response = await api.post("/user/verify-email", {
        verificationCode,
      });

      if (response.data.success) {
        setSuccess("Email updated successfully");
        addToast("Email verified successfully", "success");
        setVerificationRequired(false);

        setTimeout(() => {
          setShowEditProfile(false);
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error("Error verifying email:", error);
      setVerifyError(error.response?.data?.message || "Failed to verify email");
      addToast(
        error.response?.data?.message || "Failed to verify email",
        "error"
      );
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    setVerifyError(null);

    try {
      const response = await api.post(
        "http://localhost:3000/user/resend-verification"
      );

      if (response.data.success) {
        setResendSuccess(true);
        addToast("Verification code sent successfully", "success");
        setTimeRemaining(30); // Reset timer to 30 seconds

        // Clear existing timer if any
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }

        // Start new timer
        timerRef.current = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              timerRef.current = null;
              addToast(
                "Verification code has expired. You can now request a new one.",
                "info"
              );
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.error("Error resending OTP:", error);
      setVerifyError(
        error.response?.data?.message || "Failed to resend verification code"
      );
      addToast(
        error.response?.data?.message || "Failed to resend verification code",
        "error"
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const renderGeneralSection = () => (
    <div className="neo-ep-edit-section">
      <div className="neo-ep-form-group">
        <label htmlFor="username" className="neo-ep-form-label">
          <User size={16} />
          <span>Username</span>
        </label>
        <input
          type="text"
          id="username"
          name="username"
          className={`neo-ep-form-input ${
            formErrors.username ? "neo-ep-input-error" : ""
          }`}
          value={formData.username}
          onChange={handleInputChange}
          onBlur={() => handleBlur("username")}
          placeholder={userData.username || "Enter your username"}
        />
        {formErrors.username && (
          <div className="neo-ep-error-message">{formErrors.username}</div>
        )}
      </div>

      <div className="neo-ep-form-group">
        <label htmlFor="email" className="neo-ep-form-label">
          <Mail size={16} />
          <span>Email</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className={`neo-ep-form-input ${
            formErrors.email ? "neo-ep-input-error" : ""
          }`}
          value={formData.email}
          onChange={handleInputChange}
          onBlur={() => handleBlur("email")}
          placeholder={userData.email || "Enter your email"}
        />
        {formErrors.email && (
          <div className="neo-ep-error-message">{formErrors.email}</div>
        )}
        <div className="neo-ep-form-note">
          <AlertTriangle size={14} />
          <span>Changing email requires verification</span>
        </div>
      </div>

      <div className="neo-ep-form-group">
        <label htmlFor="phone" className="neo-ep-form-label">
          <Phone size={16} />
          <span>Phone</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          className={`neo-ep-form-input ${
            formErrors.phone ? "neo-ep-input-error" : ""
          }`}
          value={formData.phone}
          onChange={handleInputChange}
          onBlur={() => handleBlur("phone")}
          placeholder={userData.phone || "Enter your phone number"}
        />
        {formErrors.phone && (
          <div className="neo-ep-error-message">{formErrors.phone}</div>
        )}
      </div>

      <div className="neo-ep-form-group">
        <label htmlFor="bio" className="neo-ep-form-label">
          <FileText size={16} />
          <span>Bio</span>
        </label>
        <textarea
          id="bio"
          name="bio"
          className={`neo-ep-form-textarea ${
            formErrors.bio ? "neo-ep-input-error" : ""
          }`}
          value={formData.bio}
          onChange={handleInputChange}
          onBlur={() => handleBlur("bio")}
          placeholder={userData.bio || "Tell us about yourself"}
          rows={4}
        ></textarea>
        {formErrors.bio && (
          <div className="neo-ep-error-message">{formErrors.bio}</div>
        )}
        <div className="neo-ep-char-count">
          {formData.bio?.length || 0}/500 characters
        </div>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="neo-ep-edit-section">
      <div className="neo-ep-security-header">
        <Shield size={20} />
        <h3>Change Password</h3>
      </div>

      <div className="neo-ep-form-group">
        <label htmlFor="oldPassword" className="neo-ep-form-label">
          <Lock size={16} />
          <span>Current Password</span>
        </label>
        <input
          type="password"
          id="oldPassword"
          name="oldPassword"
          className={`neo-ep-form-input ${
            formErrors.oldPassword ? "neo-ep-input-error" : ""
          }`}
          value={formData.oldPassword}
          onChange={handleInputChange}
          onBlur={() => handleBlur("oldPassword")}
          placeholder="Enter your current password"
        />
        {formErrors.oldPassword && (
          <div className="neo-ep-error-message">{formErrors.oldPassword}</div>
        )}
      </div>

      <div className="neo-ep-form-group">
        <label htmlFor="newPassword" className="neo-ep-form-label">
          <Lock size={16} />
          <span>New Password</span>
        </label>
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          className={`neo-ep-form-input ${
            formErrors.newPassword ? "neo-ep-input-error" : ""
          }`}
          value={formData.newPassword}
          onChange={handleInputChange}
          onBlur={() => handleBlur("newPassword")}
          placeholder="Enter your new password"
        />
        {formErrors.newPassword && (
          <div className="neo-ep-error-message">{formErrors.newPassword}</div>
        )}
      </div>

      <div className="neo-ep-form-group">
        <label htmlFor="confirmPassword" className="neo-ep-form-label">
          <Lock size={16} />
          <span>Confirm Password</span>
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          className={`neo-ep-form-input ${
            formErrors.confirmPassword ? "neo-ep-input-error" : ""
          }`}
          value={formData.confirmPassword}
          onChange={handleInputChange}
          onBlur={() => handleBlur("confirmPassword")}
          placeholder="Confirm your new password"
        />
        {formErrors.confirmPassword && (
          <div className="neo-ep-error-message">
            {formErrors.confirmPassword}
          </div>
        )}
      </div>

      <div className="neo-ep-form-note">
        <AlertTriangle size={14} />
        <span>Password must be at least 8 characters long</span>
      </div>
    </div>
  );

  const renderVerificationForm = () => (
    <div className="neo-ep-verification-container">
      <div className="neo-ep-verification-header">
        <Mail size={24} />
        <h3>Verify Your Email</h3>
      </div>

      <p className="neo-ep-verification-message">
        We've sent a verification code to <strong>{formData.email}</strong>.
        Please enter the code below to complete your email update.
      </p>

      <div className="neo-ep-verification-timer">
        <div className="neo-ep-timer-icon">
          <Clock size={20} className="neo-ep-timer-clock" />
        </div>
        <div className="neo-ep-timer-text">
          {timeRemaining > 0 ? (
            <div className="neo-ep-timer-countdown-container">
              <span>Code expires in </span>
              <strong className="neo-ep-timer-countdown">
                {timeRemaining}
              </strong>
              <span> seconds</span>
            </div>
          ) : (
            <span className="neo-ep-timer-expired">Code expired</span>
          )}
        </div>
        <div
          className="neo-ep-timer-progress"
          style={{ width: `${(timeRemaining / 30) * 100}%` }}
        ></div>
      </div>

      <form onSubmit={handleVerifySubmit} className="neo-ep-verification-form">
        <div className="neo-ep-form-group">
          <label htmlFor="verificationCode" className="neo-ep-form-label">
            <CheckCircle size={16} />
            <span>Verification Code</span>
          </label>
          <input
            type="text"
            id="verificationCode"
            className={`neo-ep-form-input ${
              verifyError ? "neo-ep-input-error" : ""
            }`}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter verification code"
          />
          {verifyError && (
            <div className="neo-ep-error-message">{verifyError}</div>
          )}
        </div>

        {resendSuccess && (
          <div className="neo-ep-alert neo-ep-alert-success">
            <CheckCircle size={16} />
            <span>New verification code sent successfully!</span>
          </div>
        )}

        <div className="neo-ep-verification-actions">
          <button
            type="button"
            className="neo-ep-button neo-ep-button-secondary"
            onClick={() => setVerificationRequired(false)}
          >
            <X size={16} />
            <span>Cancel</span>
          </button>

          <button
            type="button"
            className={`neo-ep-button ${
              timeRemaining > 0
                ? "neo-ep-button-outline"
                : "neo-ep-button-primary"
            }`}
            onClick={handleResendOTP}
            disabled={timeRemaining > 0 || resendLoading}
          >
            {resendLoading ? (
              <>
                <Loader size={16} className="neo-ep-spinner" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>
                  {timeRemaining > 0
                    ? `Resend Code (${timeRemaining}s)`
                    : "Resend Code"}
                </span>
              </>
            )}
          </button>

          <button
            type="submit"
            className="neo-ep-button neo-ep-button-primary"
            disabled={verifyLoading}
          >
            {verifyLoading ? (
              <>
                <Loader size={16} className="neo-ep-spinner" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                <span>Verify</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderEditProfile = () => (
    <div className="neo-ep-overlay">
      <div className={`neo-ep-container ${isFlipped ? "flipped" : ""}`}>
        <div className="neo-ep-card-inner">
          {/* Front side - Profile View */}
          <div className="neo-ep-card-front">
            <div className="neo-ep-header">
              <button
                className="neo-ep-back-button"
                onClick={() => setShowEditProfile(false)}
              >
                <ArrowLeft size={20} />
              </button>
              <h2>Your Profile</h2>
              <button className="neo-ep-edit-button" onClick={handleFlip}>
                <span>Edit</span>
              </button>
            </div>

            <div className="neo-ep-profile-preview">
              <div className="neo-ep-avatar-preview">
                <img
                  src={
                    userData.avatar || "/placeholder.svg?height=120&width=120"
                  }
                  alt={userData.username}
                />
                <div className="neo-ep-avatar-glow"></div>
              </div>

              <div className="neo-ep-profile-info">
                <h3>{userData.username}</h3>
                <div className="neo-ep-profile-meta">
                  <div className="neo-ep-profile-meta-item">
                    <Mail size={16} />
                    <span>{userData.email}</span>
                  </div>
                  {userData.phone && (
                    <div className="neo-ep-profile-meta-item">
                      <Phone size={16} />
                      <span>{userData.phone}</span>
                    </div>
                  )}
                </div>

                {userData.bio && (
                  <div className="neo-ep-profile-bio">
                    <h4>Bio</h4>
                    <p>{userData.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Back side - Edit Form */}
          <div className="neo-ep-card-back">
            {verificationRequired ? (
              renderVerificationForm()
            ) : (
              <>
                <div className="neo-ep-header">
                  <button className="neo-ep-back-button" onClick={handleFlip}>
                    <ArrowLeft size={20} />
                  </button>
                  <h2>Edit Profile</h2>
                  <div></div> {/* Empty div for flex spacing */}
                </div>

                <div className="neo-ep-edit-content">
                  <div className="neo-ep-avatar-editor">
                    <div
                      className="neo-ep-avatar-upload"
                      onClick={handleAvatarClick}
                    >
                      <img
                        src={
                          avatarPreview ||
                          userData.avatar ||
                          "/placeholder.svg?height=120&width=120"
                        }
                        alt={userData.username}
                      />
                      <div className="neo-ep-avatar-overlay">
                        <Camera size={24} />
                        <span>Change</span>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        style={{ display: "none" }}
                      />
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="neo-ep-upload-progress">
                          <div
                            className="neo-ep-upload-progress-bar"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                    <div className="neo-ep-avatar-hint">
                      Click to upload a new profile picture
                    </div>
                  </div>

                  <div className="neo-ep-edit-tabs">
                    <button
                      className={`neo-ep-tab ${
                        activeSection === "general" ? "active" : ""
                      }`}
                      onClick={() => setActiveSection("general")}
                    >
                      <User size={16} />
                      <span>General</span>
                    </button>
                    <button
                      className={`neo-ep-tab ${
                        activeSection === "security" ? "active" : ""
                      }`}
                      onClick={() => setActiveSection("security")}
                    >
                      <Lock size={16} />
                      <span>Security</span>
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="neo-ep-edit-form">
                    {activeSection === "general"
                      ? renderGeneralSection()
                      : renderSecuritySection()}

                    {(editError || success) && (
                      <div
                        className={`neo-ep-alert ${
                          editError
                            ? "neo-ep-alert-error"
                            : "neo-ep-alert-success"
                        }`}
                      >
                        {editError ? (
                          <AlertTriangle size={16} />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                        <span>{editError || success}</span>
                      </div>
                    )}

                    <div className="neo-ep-form-actions">
                      <button
                        type="button"
                        className="neo-ep-button neo-ep-button-secondary"
                        onClick={handleFlip}
                      >
                        <X size={16} />
                        <span>Cancel</span>
                      </button>

                      <button
                        type="submit"
                        className="neo-ep-button neo-ep-button-primary"
                        disabled={editLoading}
                      >
                        {editLoading ? (
                          <>
                            <Loader size={16} className="neo-ep-spinner" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`neo-profile-container ${isDarkMode ? "dark" : ""}`}>
      <header className="neo-profile-header">
        <div className="neo-profile-header-backdrop"></div>
        <div className="neo-profile-header-content">
          <div className="neo-profile-avatar-container">
            <img
              src={userData.avatar || "/placeholder.svg?height=140&width=140"}
              alt={userData.username}
              className="neo-profile-avatar"
            />
            <div className="neo-profile-avatar-glow"></div>
            <div className="neo-profile-avatar-badge">
              <CheckCircle />
            </div>
          </div>
          <div className="neo-profile-header-info">
            <h1 className="neo-profile-name">{userData.username}</h1>
            <div className="neo-profile-meta">
              <div className="neo-profile-role">
                <Shield color="var(--neo-text-secondary)" />
                <span>{userData.role || "Member"}</span>
              </div>
              <div className="neo-profile-communities">
                <Building color="var(--neo-text-secondary)" />
                <span>
                  {userData.communitiesJoined?.length || 0} Communities
                </span>
              </div>
              <div className="neo-profile-joined">
                <Calendar color="var(--neo-text-secondary)" />
                <span>
                  Joined{" "}
                  {userData.createdAt
                    ? formatDate(userData.createdAt)
                    : "Recently"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="neo-profile-actions">
          <button
            className="neo-profile-edit-button"
            onClick={() => setShowEditProfile(true)}
          >
            <Edit />
            <span>Edit Profile</span>
          </button>
        </div>
      </header>

      <nav className="neo-profile-tabs">
        <button
          className={`neo-profile-tab ${
            activeTab === "overview" ? "active" : ""
          }`}
          onClick={() => setActiveTab("overview")}
        >
          <User />
          <span className="neo-tab-text">Overview</span>
        </button>
        <button
          className={`neo-profile-tab ${
            activeTab === "messages" ? "active" : ""
          }`}
          onClick={() => setActiveTab("messages")}
        >
          <MessageCircle />
          <span className="neo-tab-text">Messages</span>
          {allMessages.filter((m) => !m.isRead).length > 0 && (
            <span className="neo-tab-badge">
              {allMessages.filter((m) => !m.isRead).length}
            </span>
          )}
        </button>
        <button
          className={`neo-profile-tab ${
            activeTab === "bookmarks" ? "active" : ""
          }`}
          onClick={() => setActiveTab("bookmarks")}
        >
          <Bookmark />
          <span className="neo-tab-text">Bookmarks</span>
        </button>

        <button
          className={`neo-profile-tab ${
            activeTab === "settings" ? "active" : ""
          }`}
          onClick={() => setActiveTab("settings")}
        >
          <Settings />
          <span className="neo-tab-text">Settings</span>
        </button>
      </nav>

      <main className="neo-profile-content">
        {error && (
          <div className="neo-error-message">
            <AlertCircle />
            <p>{error}</p>
            {error.includes("log in") && (
              <button
                onClick={() => (window.location.href = "/login")}
                className="neo-error-action-button"
              >
                Go to Login
              </button>
            )}
          </div>
        )}

        {activeTab === "messages" && (
          <div className="neo-messages-section">
            <div className="neo-messages-header">
              <h2>
                <MessageCircle />
                <span>Marketplace Messages</span>
              </h2>
              <div className="neo-messages-count">
                {allMessages.length} Messages
              </div>
            </div>

            <div className="neo-messages-controls">
              <div className="neo-search-container">
                <Search className="neo-search-icon" />
                <input
                  type="text"
                  placeholder="Search neural transmissions..."
                  className="neo-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="neo-filter-controls">
                <div className="neo-filter-dropdown">
                  <button
                    className="neo-filter-button"
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  >
                    <Filter />
                    <span>
                      Filter: {filterStatus === "all" ? "All" : filterStatus}
                    </span>
                  </button>
                  {showFilterDropdown && (
                    <div className="neo-filter-dropdown-content">
                      <button
                        className={`neo-filter-option ${
                          filterStatus === "all" ? "selected" : ""
                        }`}
                        onClick={() => {
                          setFilterStatus("all");
                          setShowFilterDropdown(false);
                        }}
                      >
                        All Posts
                      </button>
                      <button
                        className={`neo-filter-option ${
                          filterStatus === "available" ? "selected" : ""
                        }`}
                        onClick={() => {
                          setFilterStatus("available");
                          setShowFilterDropdown(false);
                        }}
                      >
                        Available
                      </button>
                      <button
                        className={`neo-filter-option ${
                          filterStatus === "pending" ? "selected" : ""
                        }`}
                        onClick={() => {
                          setFilterStatus("pending");
                          setShowFilterDropdown(false);
                        }}
                      >
                        Pending
                      </button>
                      <button
                        className={`neo-filter-option ${
                          filterStatus === "sold" ? "selected" : ""
                        }`}
                        onClick={() => {
                          setFilterStatus("sold");
                          setShowFilterDropdown(false);
                        }}
                      >
                        Sold
                      </button>
                    </div>
                  )}
                </div>
                <button
                  className={`neo-refresh-button ${
                    refreshing ? "refreshing" : ""
                  }`}
                  onClick={refreshMessages}
                  disabled={refreshing}
                >
                  <RefreshCw />
                  <span className="neo-tooltip">Refresh Messages</span>
                </button>
              </div>
            </div>

            {messagesLoading ? (
              <div className="neo-messages-loading">
                <div className="neo-loading-spinner"></div>
                <span>Loading neural transmissions...</span>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="neo-empty-messages">
                <div className="neo-empty-icon">
                  <MessageCircle />
                </div>
                <h3>No messages found</h3>
                <p>
                  {allMessages.length > 0
                    ? "Try adjusting your search or filters to see more results."
                    : "When buyers contact you about your marketplace posts, messages will appear here."}
                </p>
                {allMessages.length > 0 && (
                  <button
                    className="neo-clear-filters-button"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterStatus("all");
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="neo-messages-list">
                {filteredMessages.map((post) => (
                  <div
                    key={post.postId}
                    className={`neo-message-card ${
                      expandedPost === post.postId ? "expanded" : ""
                    }`}
                  >
                    <div className="neo-message-card-header">
                      <div className="neo-message-post-info">
                        <h3>{post.postTitle}</h3>
                        <div className="neo-message-post-meta">
                          <div className="neo-post-price">
                            <DollarSign />
                            <span>{formatPrice(post.postPrice)}</span>
                          </div>
                          <div className="neo-post-location">
                            <MapPin />
                            <span>{post.postLocation}</span>
                          </div>
                          <div
                            className={`neo-post-status ${getStatusColor(
                              post.postStatus
                            )}`}
                          >
                            <span>{post.postStatus}</span>
                          </div>
                        </div>
                      </div>
                      <div className="neo-message-card-actions">
                        {post.unreadCount > 0 && (
                          <div className="neo-unread-badge">
                            <Bell className="neo-unread-icon" />
                            <span>{post.unreadCount} unread</span>
                          </div>
                        )}
                        <button
                          className={`neo-expand-button ${
                            expandedPost === post.postId ? "active" : ""
                          }`}
                          onClick={() => toggleExpandPost(post.postId)}
                        >
                          {expandedPost === post.postId ? (
                            <>
                              <ChevronUp />
                              <span>Collapse</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown />
                              <span>View All ({post.messageCount})</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {post.latestMessage && (
                      <div className="neo-message-preview">
                        <div className="neo-message-item">
                          <div className="neo-message-avatar">
                            <img
                              src={
                                post.latestMessage.sender?.avatar ||
                                "/placeholder.svg?height=40&width=40"
                              }
                              alt={
                                post.latestMessage.sender?.username || "User"
                              }
                            />
                            {!post.latestMessage.isRead && (
                              <span className="neo-unread-dot"></span>
                            )}
                          </div>
                          <div className="neo-message-details">
                            <div className="neo-message-sender-info">
                              <div className="neo-message-sender-name">
                                {post.latestMessage.sender?.username ||
                                  "Unknown User"}
                              </div>
                              <div className="neo-message-time">
                                <Clock />
                                <span>
                                  {formatMessageDate(
                                    post.latestMessage.createdAt
                                  )}
                                </span>
                              </div>
                            </div>
                            <p className="neo-message-text">
                              {post.latestMessage.message}
                            </p>
                            {!post.latestMessage.isRead && (
                              <button
                                className="neo-mark-read-button"
                                onClick={() =>
                                  markMessageAsRead(
                                    post.postId,
                                    post.latestMessage.messageId
                                  )
                                }
                              >
                                <CheckCircle />
                                <span>Mark as Read</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {expandedPost === post.postId && (
                      <div className="neo-message-expanded">
                        {post.postAttachments?.length > 0 && (
                          <div className="neo-post-details">
                            <div className="neo-post-image">
                              <img
                                src={
                                  post.postAttachments[0].url ||
                                  "/placeholder.svg?height=120&width=120"
                                }
                                alt={post.postTitle}
                              />
                            </div>
                            <div className="neo-post-info">
                              <h4>{post.postTitle}</h4>
                              <p>{post.postDescription}</p>
                              <div className="neo-post-badges">
                                <div className="neo-post-badge price">
                                  <DollarSign />
                                  <span>{formatPrice(post.postPrice)}</span>
                                </div>
                                <div className="neo-post-badge location">
                                  <MapPin />
                                  <span>{post.postLocation}</span>
                                </div>
                                <div
                                  className={`neo-post-badge status ${getStatusColor(
                                    post.postStatus
                                  )}`}
                                >
                                  <span>{post.postStatus}</span>
                                </div>
                              </div>
                            </div>
                            <button className="neo-post-link-button">
                              <ExternalLink />
                            </button>
                          </div>
                        )}

                        <div className="neo-thread-header">
                          <h4>All Messages ({post.messageCount})</h4>
                          <div className="neo-thread-actions">
                            <button
                              className="neo-mark-all-read-button"
                              onClick={() =>
                                markAllPostMessagesAsRead(post.postId)
                              }
                            >
                              <Eye />
                              <span>Mark All as Read</span>
                            </button>
                            <div className="neo-thread-menu">
                              <button className="neo-thread-menu-button">
                                <MoreHorizontal />
                              </button>
                              <div className="neo-thread-menu-dropdown">
                                <button className="neo-thread-menu-item">
                                  <ArrowUpRight />
                                  <span>View Post</span>
                                </button>
                                <button className="neo-thread-menu-item">
                                  <EyeOff />
                                  <span>Mute Notifications</span>
                                </button>
                                <div className="neo-thread-menu-divider"></div>
                                <button className="neo-thread-menu-item delete">
                                  <Trash2 />
                                  <span>Delete Thread</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="neo-messages-thread">
                          {post.messages.map((message) => (
                            <div
                              key={message.messageId}
                              className={`neo-thread-message ${
                                !message.isRead ? "unread" : ""
                              }`}
                            >
                              <div className="neo-message-avatar">
                                <img
                                  src={
                                    message.sender?.avatar ||
                                    "/placeholder.svg?height=40&width=40"
                                  }
                                  alt={message.sender?.username || "User"}
                                />
                              </div>
                              <div className="neo-message-content">
                                <div className="neo-message-header">
                                  <div className="neo-sender-name">
                                    {message.sender?.username || "Unknown User"}
                                  </div>
                                  <div className="neo-message-meta">
                                    <span>
                                      {formatMessageDate(message.createdAt)}
                                    </span>
                                    {message.isRead ? (
                                      <CheckCircle className="neo-read-icon" />
                                    ) : (
                                      <span className="neo-unread-dot"></span>
                                    )}
                                  </div>
                                </div>
                                <div className="neo-message-text">
                                  <p>{message.message}</p>
                                </div>
                                {!message.isRead && (
                                  <button
                                    className="neo-mark-read-button"
                                    onClick={() =>
                                      markMessageAsRead(
                                        post.postId,
                                        message.messageId
                                      )
                                    }
                                  >
                                    <CheckCircle />
                                    <span>Mark as Read</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "overview" && (
          <div className="neo-overview-section">
            <h2>
              <User />
              <span>User Activity Stats</span>
            </h2>

            <div className="neo-overview-grid">
              <div className="neo-overview-card neo-stats-card">
                <h3 className="neo-card-title">
                  <Activity />
                  <span>Neural Stats</span>
                </h3>
                <div className="neo-stats-grid">
                  <div className="neo-stat-item">
                    <div className="neo-stat-icon">
                      <MessageCircle />
                    </div>
                    {isGettingActivityStats ? (
  <div className="neo-loading-spinner"></div>
) : (
  <div className="neo-stat-value">{activityStats.postCount}</div>
)}
                    <div className="neo-stat-label">Posts</div>
                  </div>
                  <div className="neo-stat-item">
                    <div className="neo-stat-icon">
                      <Heart />
                    </div>
                    <div className="neo-stat-value">{stats.upvotes}</div>
                    <div className="neo-stat-label">Upvotes</div>
                  </div>
                  <div className="neo-stat-item">
                    <div className="neo-stat-icon">
                      <MessageCircle />
                    </div>
                    <div className="neo-stat-value">{activityStats?.commentCount}</div>
                    <div className="neo-stat-label">Comments</div>
                  </div>
                  <div className="neo-stat-item">
                    <div className="neo-stat-icon">
                      <Building />
                    </div>
                    <div className="neo-stat-value">{stats.communities}</div>
                    <div className="neo-stat-label">Communities</div>
                  </div>
                </div>
              </div>

              <div className="neo-overview-card neo-communities-card">
                <h3 className="neo-card-title">
                  <Building />
                  <span>Communities</span>
                </h3>
                <div className="neo-communities-list">
                  <div className="neo-community-item">
                    <div className="neo-community-icon">🏙️</div>
                    <div className="neo-community-name">{userData?.location?.county}</div>
                  </div>
                  
                  
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "bookmarks" && (
          <div className="neo-bookmarks-section">
            <div className="neo-bookmarks-header">
              <h2>
                <Bookmark />
                <span>Bookmarked Posts</span>
              </h2>
            </div>

            {isFetchingBookmarks ? (
              <div className="neo-bookmarks-loading">
                <div className="neo-loading-spinner"></div>
                <span>Loading bookmarks...</span>
              </div>
            ) : bookmarkedPosts.length === 0 ? (
              <div className="neo-empty-bookmarks">
                <div className="neo-empty-icon">
                  <Bookmark />
                </div>
                <h3>No bookmarks found</h3>
                <p>
                  When you bookmark posts, they will appear here for easy
                  access.
                </p>
              </div>
            ) : (
              <div className="neo-bookmarks-grid">
                {bookmarkedPosts.map((bookmark) => (
                  <div
                    key={bookmark._id}
                    className="neo-bookmark-card"
                    onClick={() =>
                      (window.location.href = `http://localhost:5173/post/${bookmark._id}`)
                    }
                  >
                    <h3 className="neo-bookmark-title">{bookmark.title}</h3>
                    <p className="neo-bookmark-description">
                      {bookmark.description}
                    </p>

                    {bookmark.attachments &&
                      bookmark.attachments.length > 0 && (
                        <BookmarkImageCarousel
                          attachments={bookmark.attachments}
                        />
                      )}

                    <div className="neo-bookmark-footer">
                      <div className="neo-bookmark-meta">
                        <div className="neo-bookmark-date">
                          <Calendar size={14} />
                          <span>{formatDate(bookmark.createdAt)}</span>
                        </div>
                        {bookmark.location && (
                          <div className="neo-bookmark-location">
                            <MapPin size={14} />
                            <span>{bookmark.location}</span>
                          </div>
                        )}
                      </div>
                      <button className="neo-bookmark-view-button">
                        <ExternalLink size={14} />
                        <span>View Post</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="neo-activity-section">
            <h2>
              <Activity />
              <span>Neural Activity</span>
            </h2>

            <div className="neo-activity-timeline">
              {recentActivity.map((activity, index) => (
                <div key={index} className="neo-activity-item">
                  <div className="neo-activity-icon">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="neo-activity-content">
                    <div className="neo-activity-title">{activity.title}</div>
                    <div className="neo-activity-time">
                      {formatTimeAgo(activity.date)}
                    </div>
                  </div>
                  <div className="neo-activity-actions">
                    <button className="neo-activity-action">
                      <Share2 size={14} />
                    </button>
                    <button className="neo-activity-action">
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              ))}

              <div className="neo-activity-load-more">
                <button className="neo-load-more-button">
                  <RefreshCw size={14} />
                  <span>Load More Activity</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="neo-settings-section">
            <h2>
              <Settings />
              <span>Neural Settings</span>
            </h2>

            <div className="neo-settings-grid">
              {/* Existing settings cards... */}

              {/* Add Danger Zone card */}
              <div className="neo-settings-card neo-danger-zone">
                <h3 className="neo-settings-card-title">
                  <AlertTriangle size={20} />
                  <span>Danger Zone</span>
                </h3>
                <div className="neo-settings-options">
                  <div className="neo-settings-danger-option">
                    <div className="neo-danger-content">
                      <h4>Delete Account</h4>
                      <p>
                        Permanently remove your account and all associated data
                      </p>
                    </div>
                    <button
                      className="neo-danger-button"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <Trash2 size={16} />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>
              </div>

              
            </div>
          </div>
        )}
      </main>

      {/* Edit Profile Modal */}
      {showEditProfile && renderEditProfile()}
      {showDeleteModal && (
        <div className="neo-delete-modal-overlay">
          <div className="neo-delete-modal">
            <div className="neo-delete-modal-header">
              <AlertTriangle size={24} />
              <h3>Delete Account</h3>
            </div>
            <div className="neo-delete-modal-content">
              <p>
                Are you sure you want to delete your account? This action cannot
                be undone.
              </p>
              <p>All your data will be permanently removed.</p>
            </div>
            <div className="neo-delete-modal-actions">
              <button
                className="neo-button neo-button-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="neo-button neo-button-danger"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <Loader size={16} className="neo-spinner" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Delete Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
