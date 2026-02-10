import React from "react";

/**
 * Shared drag-and-drop file upload component.
 */
export default function FileUpload({ label, file, onChange, id, hint }) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div className="file-upload">
        <input
          type="file"
          id={id || "file-upload"}
          accept=".pdf,.txt,.doc,.docx,.md"
          onChange={(e) => onChange(e.target.files[0] || null)}
        />
        <div className="file-upload-icon">{"\u{1F4C1}"}</div>
        <div className="file-upload-text">
          <strong>Click to upload</strong> or drag and drop
        </div>
        <div className="file-upload-hint">
          {hint || "PDF, TXT, DOC, DOCX (max 10MB)"}
        </div>
      </div>
      {file && (
        <div className="file-selected">
          {"\u2705"} {file.name} ({(file.size / 1024).toFixed(1)} KB)
        </div>
      )}
    </div>
  );
}
