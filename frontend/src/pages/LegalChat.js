import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { postJSON } from "../utils/api";
import ErrorBanner from "../components/ErrorBanner";

const STORAGE_KEY = "legalai_chat_history";
const MAX_AGE_MS = 90 * 24 * 3600000; // 90 days

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const sessions = JSON.parse(raw);
    const now = Date.now();
    return sessions.filter((s) => now - s.createdAt < MAX_AGE_MS);
  } catch {
    return [];
  }
}

function saveHistory(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    /* storage full — silently ignore */
  }
}

function generateTitle(messages) {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New Chat";
  const text = firstUser.content.slice(0, 60);
  return text.length < firstUser.content.length ? text + "..." : text;
}

function formatDate(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

export default function LegalChat() {
  const [history, setHistory] = useState(() => loadHistory());
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [serverSessionId, setServerSessionId] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const persistSession = useCallback(
    (msgs, srvId) => {
      setHistory((prev) => {
        const existing = prev.find((s) => s.id === activeSessionId);
        if (existing) {
          return prev.map((s) =>
            s.id === activeSessionId
              ? { ...s, messages: msgs, serverSessionId: srvId, updatedAt: Date.now() }
              : s
          );
        }
        if (!activeSessionId) return prev;
        return [
          {
            id: activeSessionId,
            messages: msgs,
            serverSessionId: srvId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          ...prev,
        ];
      });
    },
    [activeSessionId]
  );

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setServerSessionId(null);
    setError("");
    setInput("");
    setHistoryOpen(false);
  };

  const handleSelectSession = (session) => {
    setActiveSessionId(session.id);
    setMessages(session.messages || []);
    setServerSessionId(session.serverSessionId || null);
    setError("");
    setInput("");
    setHistoryOpen(false);
  };

  const handleDeleteSession = (e, sessionId) => {
    e.stopPropagation();
    setHistory((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      handleNewChat();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setError("");

    let currentId = activeSessionId;
    if (!currentId) {
      currentId = "chat_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
      setActiveSessionId(currentId);
    }

    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const data = await postJSON("/api/chat", {
        message: userMsg,
        sessionId: serverSessionId,
      });
      setServerSessionId(data.sessionId);
      const updatedMessages = [
        ...newMessages,
        { role: "assistant", content: data.result },
      ];
      setMessages(updatedMessages);

      setHistory((prev) => {
        const existing = prev.find((s) => s.id === currentId);
        if (existing) {
          return prev.map((s) =>
            s.id === currentId
              ? {
                  ...s,
                  messages: updatedMessages,
                  serverSessionId: data.sessionId,
                  updatedAt: Date.now(),
                }
              : s
          );
        }
        return [
          {
            id: currentId,
            messages: updatedMessages,
            serverSessionId: data.sessionId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          ...prev,
        ];
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sortedHistory = [...history].sort(
    (a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt)
  );

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <h2>{"\u{1F4AC}"} Chat</h2>
            <p>
              Ask any legal question. Conversation history is saved for 90 days.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0, marginTop: 4 }}>
            {sortedHistory.length > 0 && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setHistoryOpen((o) => !o)}
              >
                {historyOpen ? "Hide History" : "History"} ({sortedHistory.length})
              </button>
            )}
            <button className="btn btn-primary btn-sm" onClick={handleNewChat}>
              New Chat
            </button>
          </div>
        </div>
      </div>

      <ErrorBanner message={error} />

      {/* Chat history panel */}
      {historyOpen && sortedHistory.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title">Chat History (90 days)</div>
          <div
            style={{
              maxHeight: 300,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {sortedHistory.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background:
                    session.id === activeSessionId
                      ? "var(--accent-subtle, rgba(99,102,241,0.1))"
                      : "var(--bg-secondary, #f8f9fa)",
                  border:
                    session.id === activeSessionId
                      ? "1px solid var(--accent, #6366f1)"
                      : "1px solid transparent",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (session.id !== activeSessionId)
                    e.currentTarget.style.background = "var(--bg-hover, #f0f0f0)";
                }}
                onMouseLeave={(e) => {
                  if (session.id !== activeSessionId)
                    e.currentTarget.style.background = "var(--bg-secondary, #f8f9fa)";
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 500,
                      fontSize: 14,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {generateTitle(session.messages || [])}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted, #999)",
                      marginTop: 2,
                    }}
                  >
                    {(session.messages || []).length} messages{" "}
                    {"\u00B7"}{" "}
                    {formatDate(session.updatedAt || session.createdAt)}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(e, session.id)}
                  title="Delete conversation"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted, #999)",
                    fontSize: 16,
                    padding: "4px 8px",
                    borderRadius: 4,
                    flexShrink: 0,
                  }}
                >
                  {"\u2715"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-empty">
              <div className="chat-empty-icon">{"\u2696\uFE0F"}</div>
              <h3>Legal AI Assistant</h3>
              <p>
                Ask about contract law, regulatory compliance, legal strategy,
                document interpretation, or any other legal topic.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div className={`chat-message ${msg.role}`} key={i}>
              <div className="chat-avatar">
                {msg.role === "assistant" ? "\u2696\uFE0F" : "\u{1F464}"}
              </div>
              <div className="chat-bubble">
                {msg.role === "assistant" ? (
                  <div className="result-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-message assistant">
              <div className="chat-avatar">{"\u2696\uFE0F"}</div>
              <div className="chat-bubble">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "4px 0",
                  }}
                >
                  <div className="loading-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-row">
          <input
            className="form-input"
            placeholder="Ask a legal question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={!input.trim() || loading}
            style={{ borderRadius: 24, padding: "12px 24px" }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
