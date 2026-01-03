import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./ChatWidget.css";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Pre-fill user info if logged in, clear if logged out
    if (user) {
      setUserName(user.name || user.user?.name || "");
      setUserEmail(user.email || user.user?.email || "");
    } else {
      // Clear chat data when user logs out
      setUserName("");
      setUserEmail("");
      setMessages([]);
      setMessage("");
      setIsOpen(false);
    }
  }, [user]);

  const fetchMessages = async () => {
    if (!userEmail) return;
    
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/chat/user/${encodeURIComponent(userEmail)}`
      );
      setMessages(response.data.reverse()); // Reverse to show oldest first
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    if (!userName.trim() || !userEmail.trim()) {
      alert("Please enter your name and email to send a message");
      return;
    }

    setSending(true);
    try {
      await axios.post("http://localhost:5000/api/chat", {
        userName: userName.trim(),
        userEmail: userEmail.trim(),
        message: message.trim()
      });

      setMessage("");
      // Fetch updated messages
      await fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (isOpen && userEmail) {
      fetchMessages();
      // Poll for new messages every 5 seconds when chat is open
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, userEmail]);

  // Don't show chat widget for admin users or non-logged-in users (return after hooks)
  if (!user || user.role === "admin") {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        className="chat-widget-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open chat"
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-widget-container">
          <div className="chat-widget-header">
            <h3>💬 Chat with Us</h3>
            <button
              className="chat-widget-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div className="chat-widget-body">
            {/* Messages */}
            <div className="chat-messages">
              {loading && messages.length === 0 ? (
                <div className="chat-loading">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="chat-empty">
                  No messages yet. Start a conversation!
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg._id} className="chat-message-container">
                    <div className="chat-message user-message">
                      <div className="message-header">
                        <strong>You</strong>
                        <span className="message-time">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="message-content">{msg.message}</div>
                    </div>
                    {msg.reply && (
                      <div className="chat-message admin-message">
                        <div className="message-header">
                          <strong>Admin</strong>
                          <span className="message-time">
                            {msg.repliedAt
                              ? new Date(msg.repliedAt).toLocaleString()
                              : ""}
                          </span>
                        </div>
                        <div className="message-content">{msg.reply}</div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !message.trim()}
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;

