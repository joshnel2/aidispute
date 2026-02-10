import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { postJSON } from "../utils/api";
import ErrorBanner from "../components/ErrorBanner";

export default function LegalChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setError("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const data = await postJSON("/api/chat", {
        message: userMsg,
        sessionId,
      });
      setSessionId(data.sessionId);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.result },
      ]);
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

  const handleClear = () => {
    setMessages([]);
    setSessionId(null);
    setError("");
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2>{"\u{1F4AC}"} Legal Q&A Chat</h2>
            <p>
              Ask any legal question — contract interpretation, regulatory
              queries, case analysis, strategy discussions.
            </p>
          </div>
          {messages.length > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={handleClear}>
              Clear Chat
            </button>
          )}
        </div>
      </div>

      <ErrorBanner message={error} />

      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "var(--text-muted)",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>{"\u2696\uFE0F"}</div>
              <h3 style={{ marginBottom: 8, color: "var(--text-secondary)" }}>
                Legal AI Assistant
              </h3>
              <p style={{ maxWidth: 480, margin: "0 auto", fontSize: 14, lineHeight: 1.6 }}>
                Ask me about contract law, regulatory compliance, legal strategy,
                document interpretation, or any other legal topic. I maintain
                conversation context so you can ask follow-up questions.
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
                <div className="loading" style={{ padding: "8px 0" }}>
                  <div className="spinner" />
                  <span>Thinking...</span>
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
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
