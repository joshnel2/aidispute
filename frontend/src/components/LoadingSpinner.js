import React from "react";

export default function LoadingSpinner({ message }) {
  return (
    <div className="loading">
      <div className="loading-dots">
        <span />
        <span />
        <span />
      </div>
      <span>{message || "Analyzing document..."}</span>
    </div>
  );
}
