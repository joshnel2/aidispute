import React from "react";

export default function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="error-banner">
      <span>{"\u274C"}</span> {message}
    </div>
  );
}
