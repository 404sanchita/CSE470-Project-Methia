import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Chatbox.css";

const Chatbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Set user info if logged in
    if (user) {
      setUserEmail(user.email);
      setUserName(user.name);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && userEmail) {
      fetchMessages();
    }
  }, [isOpen, userEmail]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    if (!userEmail) return;

    setLoading(true);
    try {
      let response;
      if (user && user.token) {
        // User is logged in, use protected route
        response = await api.get("/chat", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
      } else {
        // User not logged in, use email-based route
        response = await api.get(`/chat/user/${userEmail}`);
      }
      setMessages(response.data.reverse()); // Reverse to show oldest first
    } catch (error) {
      console.error("Error fetching messages:", error);
      const errorMessage = error.response?.data?.message || error.message || "Unknown error";
      console.error("Full error:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !userEmail || !userName) {
      alert("Please enter your name, email, and message");
      return;
    }

    setSending(true);
    try {
      const response = await api.post("/chat", {
        userEmail,
        userName,
        message: newMessage.trim(),
      });

      setMessages([...messages, response.data]);
      setNewMessage("");
      
      // Refresh messages to get updated list
      setTimeout(() => {
        fetchMessages();
      }, 500);
    } catch (error) {
      console.error("Error sending message:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config?.url
      });
      const errorMessage = error.response?.data?.message || error.message || "Unknown error";
      // Get the actual baseURL from api instance
      const actualBaseURL = api.defaults.baseURL || "http://localhost:5001/api";
      const fullUrl = error.config?.url 
        ? `${actualBaseURL}${error.config.url}`
        : `${actualBaseURL}/chat`;
      console.error("API Base URL:", actualBaseURL);
      console.error("Request URL:", fullUrl);
      console.error("Error config:", error.config);
      alert(`Failed to send message: ${errorMessage}\n\nAPI Base URL: ${actualBaseURL}\nRequest URL: ${fullUrl}\n\nPlease check:\n1. Backend server is running on port 5001\n2. Check browser console (F12) for detailed logs\n3. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)`);
    } finally {
      setSending(false);
    }
  };

  const toggleChatbox = () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);
    
    // If opening and user is not logged in and no email set, prompt for info
    if (willOpen && !userEmail && !user) {
      // Small delay to let state update, then prompt
      setTimeout(() => {
        const email = prompt("Please enter your email to use the chat:");
        const name = prompt("Please enter your name:");
        if (email && name) {
          setUserEmail(email);
          setUserName(name);
        } else {
          // Close if user cancels
          setIsOpen(false);
        }
      }, 100);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button className="chatbox-button" onClick={toggleChatbox}>
        🤖
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbox-container">
          <div className="chatbox-header">
            <h3>💬 Chat Support</h3>
            <button className="chatbox-close" onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>

          <div className="chatbox-messages">
            {loading ? (
              <div className="chatbox-loading">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="chatbox-empty">
                No messages yet. Start a conversation!
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg._id} className="chatbox-message-container">
                  {/* User Message */}
                  <div className="chatbox-message user-message">
                    <div className="message-header">
                      <strong>{msg.userName}</strong>
                      <span className="message-time">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="message-content">{msg.message}</div>
                  </div>

                  {/* Admin Reply */}
                  {msg.reply && (
                    <div className="chatbox-message admin-message">
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

                  {/* Pending indicator */}
                  {msg.status === "pending" && !msg.reply && (
                    <div className="message-pending">
                      Waiting for admin response...
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          {!user && (
            <div className="chatbox-user-info">
              <input
                type="text"
                placeholder="Your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="chatbox-input-name"
              />
              <input
                type="email"
                placeholder="Your email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="chatbox-input-email"
              />
            </div>
          )}

          <form onSubmit={handleSendMessage} className="chatbox-form">
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="chatbox-input"
              disabled={sending}
            />
            <button
              type="submit"
              className="chatbox-send"
              disabled={sending || !newMessage.trim()}
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbox;
