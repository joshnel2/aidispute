import React, { useRef } from "react";

/**
 * File upload component with drag-and-drop visual and clear button.
 */
export default function FileUpload({ label, file, onChange, id, hint }) {
  const inputRef = useRef(null);

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}

      {!file ? (
        <div className="file-upload">
          <input
            ref={inputRef}
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
      ) : (
        <div className="file-selected-card">
          <div className="file-selected-info">
            <span className="file-selected-icon">{"\u{1F4C4}"}</span>
            <div>
              <div className="file-selected-name">{file.name}</div>
              <div className="file-selected-size">
                {file.size < 1024 * 1024
                  ? `${(file.size / 1024).toFixed(1)} KB`
                  : `${(file.size / (1024 * 1024)).toFixed(2)} MB`}
              </div>
            </div>
          </div>
          <button
            className="file-selected-remove"
            onClick={handleClear}
            title="Remove file"
          >
            {"\u2715"}
          </button>
        </div>
      )}
    </div>
  );
}
