import React from "react";

export default function LoadingSpinner({ message }) {
  return (
    <div className="loading">
      <div className="spinner" />
      <span>{message || "Analyzing document..."}</span>
    </div>
  );
}
