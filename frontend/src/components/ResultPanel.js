import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ResultPanel({ title, result }) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard API not available */
    }
  };

  return (
    <div className="result-container">
      <div className="result-header">
        <h3>{title || "Analysis Results"}</h3>
        <div className="result-actions">
          {copied && <span className="copy-feedback">Copied!</span>}
          <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
            {copied ? "\u2705" : "\u{1F4CB}"} {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <div className="result-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
      </div>
    </div>
  );
}
