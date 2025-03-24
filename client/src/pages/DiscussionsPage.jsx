import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './DiscussionsPage.css';
import { useSelector } from 'react-redux';
import { formatDate } from './utils/formatDate';
import { renderIcon } from './utils/renderIcon';
import { io } from 'socket.io-client';
// Import React Icons
import { 
  IoSearchOutline, IoSendSharp, IoLocationOutline, IoImageOutline, 
  IoAddOutline, IoMenuOutline, IoCheckmarkDoneOutline, IoCheckmarkOutline,
  IoEllipsisHorizontalOutline, IoChevronForwardOutline, IoAttachOutline
} from 'react-icons/io5';

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
    socket.current.on("receive-group-message", (newMessage) => {
      console.log("Received group message:", newMessage);
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

      // Emit the new message to the server
      socket.current.emit("send-group-message", {
        chatId: activeChannel._id, // Send to the active group
        message: response.data.newMessage,
      });

      // Clear the input field
      setNewMessage("");
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

  return (
    <div className="discussions-content">
      {/* Channels sidebar */}
      <div className={`discussions-channels ${isChannelsOpen ? "open" : ""}`}>
        <div className="discussions-channels-header">
          <h2 className="channels-title">Channels</h2>
          <div className="discussions-search">
            <div className="discussions-search-icon">
              <IoSearchOutline />
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
            <div className="discussions-loader">
              <div className="loader-spinner"></div>
              <span>Loading channels...</span>
            </div>
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
                <div className="channel-arrow">
                  <IoChevronForwardOutline />
                </div>
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
            <button className="discussions-input-button action-button">
              <IoEllipsisHorizontalOutline />
            </button>
            <button className="discussions-channels-toggle" onClick={toggleChannels}>
              <IoMenuOutline />
            </button>
          </div>
        </div>

        <div className="discussions-messages">
          {isLoadingMessages ? (
            <div className="discussions-loader">
              <div className="loader-spinner"></div>
              <span>Loading messages...</span>
            </div>
          ) : !userData ? (
            <div className="discussions-loader">
              <div className="loader-spinner"></div>
              <span>Loading user data...</span>
            </div>
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
                    src={message.sender.avatar || "/placeholder.svg"}
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
                          {message.read ? <IoCheckmarkDoneOutline /> : <IoCheckmarkOutline />}
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
            <button type="button" className="discussions-input-button action-button attach-button">
              <IoAttachOutline />
            </button>
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
              <div className="input-actions">
                <button type="button" className="input-action-button">
                  <IoLocationOutline />
                </button>
                <button type="button" className="input-action-button">
                  <IoImageOutline />
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              className={`discussions-input-button send-button ${!newMessage.trim() ? 'disabled' : ''}`} 
              disabled={!newMessage.trim()}
            >
              <IoSendSharp />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DiscussionsPage;
