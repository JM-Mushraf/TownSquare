import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios'; // Import axios for API calls
import './DiscussionsPage.css';
import { useSelector } from 'react-redux';
import { formatDate } from './utils/formatDate';
import { renderIcon } from './utils/renderIcon';
import {io} from 'socket.io-client'

function DiscussionsPage() {
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isChannelsOpen, setIsChannelsOpen] = useState(false);
  const [channels, setChannels] = useState([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);

  const { userData } = useSelector((state) => state.user);

  // Initialize Socket.IO client
  const socket = useRef(null);

  useEffect(() => {
    // Connect to the Socket.IO server
    socket.current = io("http://localhost:3000", {
      withCredentials: true,
    });

    // Listen for new messages
    socket.current.on("receive-message", (newMessage) => {
      console.log("Received message:", newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // Cleanup on component unmount
    return () => {
      socket.current.disconnect(); // Disconnect the socket when the component unmounts
    };
  }, []);
  useEffect(() => {
    if (userData?._id) {
      socket.current.emit("new-user-add", userData._id);
    }
  }, [userData]);
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
  // Send a new message
// Send a new message
// Send a new message
const handleSendMessage = async (e) => {
  e.preventDefault();
  if (!newMessage.trim() || !activeChannel) return;

  try {
    const response = await axios.post(
      "http://localhost:3000/message/send",
      {
        chatId: activeChannel._id,
        content: newMessage,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    // Add the sender information to the new message
    const newMessageWithSender = {
      ...response.data.newMessage,
      sender: userData, // Assuming userData contains the current user's info
    };

    // Emit the new message to the server
    socket.current.emit("send-group-message", {
      chatId: activeChannel._id, // Send to the active group
      message: newMessageWithSender,
    });

    // Update local state with the new message
    setMessages((prevMessages) => [...prevMessages, newMessageWithSender]);
    setNewMessage("");
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

// Listen for new messages
useEffect(() => {
  // Listen for new group messages
  socket.current.on("receive-group-message", (newMessage) => {
    console.log("Received group message:", newMessage);
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  });

  // Cleanup on component unmount
  return () => {
    socket.current.disconnect(); // Disconnect the socket when the component unmounts
  };
}, []);

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
          <div className="discussions-chat-info">
            <div className="discussions-chat-avatar">{renderIcon(activeChannel?.icon)}</div>
            <div className="discussions-chat-details">
              <div className="discussions-chat-name">{activeChannel?.name}</div>
              <div className="discussions-chat-status">{activeChannel?.members?.length} members</div>
            </div>
          </div>
          <div className="discussions-chat-actions">
            <button className="discussions-input-button" style={{ backgroundColor: "var(--muted)" }}>
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
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                <line x1="9" y1="10" x2="15" y2="10"></line>
                <line x1="12" y1="7" x2="12" y2="13"></line>
              </svg>
            </button>
            <button className="discussions-channels-toggle" onClick={toggleChannels}>
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
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div className="discussions-messages">
  {isLoadingMessages ? (
    <div className="discussions-loader">Loading messages...</div>
  ) : !userData ? (
    <div className="discussions-loader">Loading user data...</div>
  ) : (
    messages.map((message) => {
      const isCurrentUser = message.sender._id === userData._id;
      const uniqueKey = `${message._id}-${message.createdAt}`; // Combine _id and createdAt for a unique key
      return (
        <div
          key={uniqueKey} // Use the unique key here
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

        <form className="discussions-input" onSubmit={handleSendMessage}>
          <div className="discussions-input-container">
            <div className="discussions-input-actions">
              <button type="button" className="discussions-input-button" style={{ backgroundColor: "var(--muted)" }}>
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
              </button>
              <button type="button" className="discussions-input-button" style={{ backgroundColor: "var(--muted)" }}>
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
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <path d="m21 15-5-5L5 21"></path>
                </svg>
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
            <button type="submit" className="discussions-input-button" disabled={!newMessage.trim()}>
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