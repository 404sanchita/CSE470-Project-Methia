import React, { useState, useEffect, useContext } from "react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./adminChat.css";

const AdminChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchMessages();
  }, [user, navigate]);

  const fetchMessages = async () => {
    if (!user || !user.token) return;

    setLoading(true);
    try {
      const response = await api.get("/chat", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      alert("Failed to fetch messages. Please check your authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (messageId) => {
    if (!replyText.trim()) {
      alert("Please enter a reply message");
      return;
    }

    setReplying(true);
    try {
      const response = await api.put(
        `/chat/${messageId}/reply`,
        { reply: replyText.trim() },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      // Update the message in the list
      setMessages(
        messages.map((msg) => (msg._id === messageId ? response.data : msg))
      );

      setReplyText("");
      setSelectedMessage(null);
      alert("Reply sent successfully!");
    } catch (error) {
      console.error("Error replying to message:", error);
      alert("Failed to send reply. Please try again.");
    } finally {
      setReplying(false);
    }
  };

  const openReplyModal = (message) => {
    setSelectedMessage(message);
    setReplyText("");
  };

  const closeReplyModal = () => {
    setSelectedMessage(null);
    setReplyText("");
  };

  const getPendingCount = () => {
    return messages.filter((msg) => msg.status === "pending").length;
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="admin-chat-container">
      <div className="admin-chat-header">
        <h1>💬 Chat Messages Management</h1>
        <div className="admin-chat-stats">
          <span className="stat-item">
            Total: {messages.length}
          </span>
          <span className="stat-item pending">
            Pending: {getPendingCount()}
          </span>
          <span className="stat-item answered">
            Answered: {messages.length - getPendingCount()}
          </span>
        </div>
        <button onClick={fetchMessages} className="refresh-btn" disabled={loading}>
          {loading ? "Loading..." : "🔄 Refresh"}
        </button>
      </div>

      {loading && messages.length === 0 ? (
        <div className="loading-messages">Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="no-messages">No messages yet.</div>
      ) : (
        <div className="messages-list">
          {messages.map((message) => (
            <div
              key={message._id}
              className={`message-card ${message.status}`}
            >
              <div className="message-card-header">
                <div className="message-user-info">
                  <strong>{message.userName}</strong>
                  <span className="user-email">{message.userEmail}</span>
                </div>
                <div className="message-status-badge">
                  {message.status === "pending" ? "⏳ Pending" : "✅ Answered"}
                </div>
              </div>

              <div className="message-content-card">
                <div className="message-question">
                  <strong>Question:</strong>
                  <p>{message.message}</p>
                </div>
                <div className="message-time">
                  Asked: {new Date(message.createdAt).toLocaleString()}
                </div>

                {message.reply && (
                  <div className="message-reply">
                    <strong>Your Reply:</strong>
                    <p>{message.reply}</p>
                    <div className="message-time">
                      Replied:{" "}
                      {message.repliedAt
                        ? new Date(message.repliedAt).toLocaleString()
                        : "N/A"}
                    </div>
                  </div>
                )}

                {message.status === "pending" && (
                  <button
                    onClick={() => openReplyModal(message)}
                    className="reply-btn"
                  >
                    Reply
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {selectedMessage && (
        <div className="modal-overlay" onClick={closeReplyModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reply to {selectedMessage.userName}</h2>
              <button className="modal-close" onClick={closeReplyModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="original-message">
                <strong>Original Question:</strong>
                <p>{selectedMessage.message}</p>
                <small>
                  From: {selectedMessage.userName} ({selectedMessage.userEmail})
                </small>
              </div>

              <div className="reply-form-group">
                <label htmlFor="reply">Your Reply:</label>
                <textarea
                  id="reply"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  rows="5"
                  className="reply-textarea"
                />
              </div>

              <div className="modal-actions">
                <button
                  onClick={closeReplyModal}
                  className="cancel-btn"
                  disabled={replying}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReply(selectedMessage._id)}
                  className="send-reply-btn"
                  disabled={replying || !replyText.trim()}
                >
                  {replying ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChat;
