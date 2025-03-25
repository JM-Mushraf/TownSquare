import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './DiscussionsPage.css';
import { useSelector } from 'react-redux';
import { formatDate } from './utils/formatDate';
import { renderIcon } from './utils/renderIcon';
import { io } from 'socket.io-client';

function DiscussionsPage() {
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isChannelsOpen, setIsChannelsOpen] = useState(false);
  const [channels, setChannels] = useState([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const { userData } = useSelector((state) => state.user);

  // Initialize Socket.IO client
  const socket = useRef(null);

  useEffect(() => {
    // Connect to the Socket.IO server
    socket.current = io("http://localhost:3000", {
      withCredentials: true,
    });

    // Listen for new group messages
    socket.current.on("receive-group-message", (newMessage) => {
      console.log("Received group message:", newMessage);
      setMessages((prevMessages) => {
        // Check if message already exists to prevent duplicates
        if (!prevMessages.some(msg => msg._id === newMessage._id)) {
          return [...prevMessages, newMessage];
        }
        return prevMessages;
      });
    });

    // Cleanup on component unmount
    return () => {
      socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (userData?._id) {
      socket.current.emit("new-user-add", userData._id);
    }
  }, [userData]);

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert('You can only upload up to 5 files at once');
      return;
    }

    setSelectedFiles(files);
    
    // Create preview URLs for images
    const urls = files.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
      return null;
    });
    setPreviewUrls(urls);
  };

  // Clear preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [previewUrls]);

  // Remove a file from selection
  const removeFile = (index) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);

    const newUrls = [...previewUrls];
    if (newUrls[index]) URL.revokeObjectURL(newUrls[index]);
    newUrls.splice(index, 1);
    setPreviewUrls(newUrls);
  };

  // Fetch user chats on component mount
  useEffect(() => {
    const fetchUserChats = async () => {
      try {
        setIsLoadingChannels(true);
        const { data } = await axios.get("http://localhost:3000/user/chats", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setChannels(data.chats);
        if (data.chats.length > 0) {
          setActiveChannel(data.chats[0]);
          fetchMessages(data.chats[0]._id);
        }
      } catch (error) {
        console.error("Error fetching user chats:", error);
      } finally {
        setIsLoadingChannels(false);
      }
    };

    fetchUserChats();
  }, []);

  // Fetch messages for a specific chat
  const fetchMessages = async (chatId) => {
    try {
      setIsLoadingMessages(true);
      const response = await axios.get(`http://localhost:3000/message/all/${chatId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const sortedMessages = response.data.messages.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      setMessages(sortedMessages);

      // Join the group room
      socket.current.emit("join-group", chatId);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Send a new message with attachments
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFiles.length && !activeChannel) return;

    try {
      const formData = new FormData();
      formData.append('chatId', activeChannel._id);
      if (newMessage.trim()) {
        formData.append('content', newMessage);
      }
      
      // Append all selected files
      selectedFiles.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await axios.post(
        "http://localhost:3000/message/send",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const newMessageWithSender = {
        ...response.data.newMessage,
        sender: userData,
      };

      socket.current.emit("send-group-message", {
        chatId: activeChannel._id,
        message: newMessageWithSender,
      });

      setMessages((prevMessages) => [...prevMessages, newMessageWithSender]);
      setNewMessage("");
      setSelectedFiles([]);
      setPreviewUrls([]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Toggle channels sidebar on mobile
  const toggleChannels = () => {
    setIsChannelsOpen(!isChannelsOpen);
  };

  // Filter channels based on search query
  const filteredChannels = channels.filter(
    (channel) =>
      channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Render file preview or icon based on file type
  const renderAttachment = (attachment) => {
    if (attachment.fileType === 'image') {
      return (
        <div className="attachment-image-container">
          <img 
            src={attachment.url} 
            alt={attachment.fileName} 
            className="attachment-image"
          />
        </div>
      );
    } else {
      return (
        <div className="attachment-file">
          <div className="attachment-icon">
            {attachment.fileType === 'application' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
              </svg>
            )}
          </div>
          <div className="attachment-name">{attachment.fileName}</div>
        </div>
      );
    }
  };

  return (
    <div className="discussions-content">
      {/* Channels sidebar */}
      <div className={`discussions-channels ${isChannelsOpen ? "open" : ""}`}>
        <div className="discussions-channels-header">
          <div className="discussions-search">
            <div className="discussions-search-icon">
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
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input
              type="text"
              className="discussions-search-input"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="discussions-channels-list">
          {isLoadingChannels ? (
            <div className="discussions-loader">Loading channels...</div>
          ) : (
            filteredChannels.map((channel) => (
              <div
                key={channel._id}
                className={`discussions-channel ${activeChannel?._id === channel._id ? "active" : ""}`}
                onClick={() => {
                  setActiveChannel(channel);
                  fetchMessages(channel._id);
                  setIsChannelsOpen(false);
                }}
              >
                <div className="discussions-channel-icon">{renderIcon(channel.icon)}</div>
                <div className="discussions-channel-info">
                  <div className="discussions-channel-name">{channel.name}</div>
                  <div className="discussions-channel-description">{channel.description}</div>
                </div>
                {channel.unread > 0 && <div className="discussions-channel-badge">{channel.unread}</div>}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mobile backdrop */}
      <div
        className={`discussions-backdrop ${isChannelsOpen ? "active" : ""}`}
        onClick={() => setIsChannelsOpen(false)}
      ></div>

      {/* Chat area */}
      <div className="discussions-chat">
        <div className="discussions-chat-header">
          {/* ... (keep existing chat header code) ... */}
        </div>

        <div className="discussions-messages">
          {isLoadingMessages ? (
            <div className="discussions-loader">Loading messages...</div>
          ) : !userData ? (
            <div className="discussions-loader">Loading user data...</div>
          ) : (
            messages.map((message) => {
              const isCurrentUser = message.sender._id === userData._id;
              const uniqueKey = `${message._id}-${message.createdAt}`;
              return (
                <div
                  key={uniqueKey}
                  className={`discussions-message ${isCurrentUser ? "discussions-message-outgoing" : ""}`}
                >
                  <img
                    className="discussions-message-avatar"
                    src={message.sender.avatar}
                    alt={message.sender.username}
                  />
                  <div className="discussions-message-content">
                    <div className="discussions-message-bubble">
                      <div className="discussions-message-author">{message.sender.username}</div>
                      {message.content}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="message-attachments">
                          {message.attachments.map((attachment, index) => (
                            <div key={index} className="message-attachment">
                              {renderAttachment(attachment)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="discussions-message-meta">
                      <div className="discussions-message-time">{formatDate(message.createdAt)}</div>
                      {isCurrentUser && (
                        <div className={`discussions-message-status ${message.read ? "read" : ""}`}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* File preview area */}
        {previewUrls.length > 0 && (
          <div className="file-previews">
            {previewUrls.map((url, index) => (
              <div key={index} className="file-preview">
                {url ? (
                  <>
                    <img src={url} alt="Preview" className="image-preview" />
                    <button 
                      className="remove-file-btn" 
                      onClick={() => removeFile(index)}
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <div className="file-preview-info">
                    <span>{selectedFiles[index].name}</span>
                    <button 
                      className="remove-file-btn" 
                      onClick={() => removeFile(index)}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <form className="discussions-input" onSubmit={handleSendMessage}>
          <div className="discussions-input-container">
            <div className="discussions-input-actions">
              <button 
                type="button" 
                className="discussions-input-button" 
                style={{ backgroundColor: "var(--muted)" }}
                onClick={() => fileInputRef.current.click()}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  multiple
                  accept="image/*, application/pdf, .doc, .docx"
                />
              </button>
            </div>
            <div className="discussions-input-field">
              <textarea
                className="discussions-input-textarea"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                rows={1}
              />
            </div>
            <button 
              type="submit" 
              className="discussions-input-button" 
              disabled={!newMessage.trim() && !selectedFiles.length}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DiscussionsPage;