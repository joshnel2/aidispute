import React from "react";
import FileUpload from "./FileUpload";

/**
 * Combined document input: file upload + paste textarea shown side by side.
 * File upload takes precedence over pasted text.
 */
export default function DocumentInput({
  file,
  onFileChange,
  text,
  onTextChange,
  fileId,
  placeholder,
}) {
  return (
    <div className="input-methods">
      <div>
        <label className="form-label">Upload File</label>
        <FileUpload file={file} onChange={onFileChange} id={fileId} />
        {file && (
          <div style={{ fontSize: 12, color: "var(--green)", marginTop: 6 }}>
            File will be used instead of pasted text
          </div>
        )}
      </div>
      <div>
        <label className="form-label">Or Paste Text</label>
        <textarea
          className="form-textarea"
          placeholder={placeholder || "Paste document text here..."}
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          style={{ minHeight: 180 }}
          disabled={!!file}
        />
      </div>
    </div>
  );
}
