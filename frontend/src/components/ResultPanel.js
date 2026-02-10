import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Shared component to display AI analysis results with markdown rendering.
 */
export default function ResultPanel({ title, result, onCopy }) {
  if (!result) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    if (onCopy) onCopy();
  };

  return (
    <div className="result-container">
      <div className="result-header">
        <h3>
          <span>{"\u2728"}</span> {title || "Analysis Results"}
        </h3>
        <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
          {"\u{1F4CB}"} Copy
        </button>
      </div>
      <div className="result-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
      </div>
    </div>
  );
}
