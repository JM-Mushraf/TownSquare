import React, { useState, useRef, useEffect } from 'react';
import './DiscussionsPage.css';

// Sample community channels data
const COMMUNITY_CHANNELS = [
  {
    id: 1,
    name: "General Discussion",
    description: "Community-wide discussions",
    members: 156,
    unread: 3,
    icon: "hash",
  },
  {
    id: 2,
    name: "Local Events",
    description: "Upcoming events in our area",
    members: 124,
    unread: 0,
    icon: "calendar",
  },
  {
    id: 3,
    name: "Infrastructure",
    description: "Roads, utilities, and public works",
    members: 98,
    unread: 0,
    icon: "tool",
  },
  {
    id: 4,
    name: "Education",
    description: "Schools and learning resources",
    members: 87,
    unread: 0,
    icon: "book",
  },
  {
    id: 5,
    name: "Emergency Updates",
    description: "Critical community alerts",
    members: 203,
    unread: 0,
    icon: "alert-triangle",
  },
];

// Sample messages for the General Discussion channel
const SAMPLE_MESSAGES = [
  {
    id: 1,
    userId: 1,
    userName: "Jane Cooper",
    userInitials: "JC",
    text: "Hi everyone! I think we should organize a community cleanup event next month. Who's interested?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isOutgoing: false,
  },
  {
    id: 2,
    userId: 2,
    userName: "Robert Johnson",
    userInitials: "RJ",
    text: "That's a great idea, Jane! I'd be happy to help organize it.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
    isOutgoing: false,
  },
  {
    id: 3,
    userId: 3,
    userName: "Sarah Lee",
    userInitials: "SL",
    text: "Count me in! I can bring some supplies and refreshments for volunteers.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1),
    isOutgoing: false,
  },
  {
    id: 4,
    userId: "me",
    userName: "You",
    userInitials: "YO",
    text: "I'd love to participate too. Which areas are we thinking of focusing on?",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    isOutgoing: true,
  },
  {
    id: 5,
    userId: 1,
    userName: "Jane Cooper",
    userInitials: "JC",
    text: "I was thinking we could start with the park near Main Street. It's been getting a bit neglected lately.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    isOutgoing: false,
  },
  {
    id: 6,
    userId: 1,
    userName: "Jane Cooper",
    userInitials: "JC",
    text: "We could also extend to the creek area if we get enough volunteers.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    isOutgoing: false,
  },
  {
    id: 7,
    userId: "me",
    userName: "You",
    userInitials: "YO",
    text: "That makes sense. The creek definitely needs some attention. Do you have a specific date in mind?",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    isOutgoing: true,
  },
  {
    id: 8,
    userId: 1,
    userName: "Jane Cooper",
    userInitials: "JC",
    text: "I was thinking the first Saturday of next month. Would that work for you all?",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    isOutgoing: false,
  },
];

// Helper function to format date
function formatDate(date) {
  const now = new Date();
  const messageDate = new Date(date);
  const diffInSeconds = Math.floor((now - messageDate) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  // If it's today, show time only
  if (messageDate.toDateString() === now.toDateString()) {
    return messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // If it's yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${messageDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  // Otherwise show date and time
  return messageDate.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Helper function to render the appropriate icon
const renderIcon = (iconName) => {
  switch (iconName) {
    case "hash":
      return (
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
        >
          <line x1="4" y1="9" x2="20" y2="9"></line>
          <line x1="4" y1="15" x2="20" y2="15"></line>
          <line x1="10" y1="3" x2="8" y2="21"></line>
          <line x1="16" y1="3" x2="14" y2="21"></line>
        </svg>
      );
    case "calendar":
      return (
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
        >
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      );
    case "tool":
      return (
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
        >
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
      );
    case "book":
      return (
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
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      );
    case "alert-triangle":
      return (
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
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      );
    default:
      return null;
  }
};

function DiscussionsPage() {
  const [activeChannel, setActiveChannel] = useState(COMMUNITY_CHANNELS[0]);
  const [messages, setMessages] = useState(SAMPLE_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isChannelsOpen, setIsChannelsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Filter channels based on search query
  const filteredChannels = COMMUNITY_CHANNELS.filter(
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

  // Send a new message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      userId: "me",
      userName: "You",
      userInitials: "YO",
      text: newMessage,
      timestamp: new Date(),
      isOutgoing: true,
    };

    setMessages([...messages, newMsg]);
    setNewMessage("");

    // Simulate reply after 2 seconds
    setTimeout(() => {
      const users = [
        { id: 1, name: "Jane Cooper", initials: "JC" },
        { id: 2, name: "Robert Johnson", initials: "RJ" },
        { id: 3, name: "Sarah Lee", initials: "SL" },
      ];

      const randomUser = users[Math.floor(Math.random() * users.length)];

      const reply = {
        id: messages.length + 2,
        userId: randomUser.id,
        userName: randomUser.name,
        userInitials: randomUser.initials,
        text: "Thanks for your message! I'll get back to you soon.",
        timestamp: new Date(),
        isOutgoing: false,
      };

      setMessages((prev) => [...prev, reply]);
    }, 2000);
  };

  // Toggle channels sidebar on mobile
  const toggleChannels = () => {
    setIsChannelsOpen(!isChannelsOpen);
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
          {filteredChannels.map((channel) => (
            <div
              key={channel.id}
              className={`discussions-channel ${activeChannel.id === channel.id ? "active" : ""}`}
              onClick={() => {
                setActiveChannel(channel);
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
          ))}
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
            <div className="discussions-chat-avatar">{renderIcon(activeChannel.icon)}</div>
            <div className="discussions-chat-details">
              <div className="discussions-chat-name">{activeChannel.name}</div>
              <div className="discussions-chat-status">{activeChannel.members} members</div>
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
          {messages.map((message) => (
            <div
              key={message.id}
              className={`discussions-message ${message.isOutgoing ? "discussions-message-outgoing" : ""}`}
            >
              <div className="discussions-message-avatar">{message.userInitials}</div>
              <div className="discussions-message-content">
                <div className="discussions-message-bubble">
                  <div className="discussions-message-author">{message.userName}</div>
                  {message.text}
                </div>
                <div className="discussions-message-meta">
                  <div className="discussions-message-time">{formatDate(message.timestamp)}</div>
                  {message.isOutgoing && (
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
          ))}
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