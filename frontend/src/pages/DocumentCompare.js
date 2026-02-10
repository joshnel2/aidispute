import React, { useState } from "react";
import { postForm } from "../utils/api";
import FileUpload from "../components/FileUpload";
import ResultPanel from "../components/ResultPanel";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

export default function DocumentCompare() {
  const [textA, setTextA] = useState("");
  const [fileA, setFileA] = useState(null);
  const [textB, setTextB] = useState("");
  const [fileB, setFileB] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const formData = new FormData();
      if (fileA) {
        formData.append("fileA", fileA);
      } else {
        formData.append("documentA", textA);
      }
      if (fileB) {
        formData.append("fileB", fileB);
      } else {
        formData.append("documentB", textB);
      }
      const data = await postForm("/api/compare", formData);
      setResult(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasA = fileA || textA.trim();
  const hasB = fileB || textB.trim();
  const canSubmit = !loading && hasA && hasB;

  return (
    <div>
      <div className="page-header">
        <h2>{"\u{1F504}"} Document Comparison</h2>
        <p>
          Compare two versions of a document. Upload files or paste text for
          each version to get a detailed redline showing all material changes,
          additions, deletions, and an overall impact assessment.
        </p>
      </div>

      <ErrorBanner message={error} />

      <div className="form-row">
        {/* Document A */}
        <div className="card">
          <div className="card-title">Document A (Original)</div>
          <div className="form-group">
            <label className="form-label">Upload File</label>
            <FileUpload file={fileA} onChange={setFileA} id="compare-file-a" />
            {fileA && (
              <div style={{ fontSize: 12, color: "var(--green)", marginTop: 6 }}>
                File will be used instead of pasted text
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Or Paste Text</label>
            <textarea
              className="form-textarea"
              placeholder="Paste the original document here..."
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              rows={12}
              disabled={!!fileA}
            />
          </div>
        </div>

        {/* Document B */}
        <div className="card">
          <div className="card-title">Document B (Revised)</div>
          <div className="form-group">
            <label className="form-label">Upload File</label>
            <FileUpload file={fileB} onChange={setFileB} id="compare-file-b" />
            {fileB && (
              <div style={{ fontSize: 12, color: "var(--green)", marginTop: 6 }}>
                File will be used instead of pasted text
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Or Paste Text</label>
            <textarea
              className="form-textarea"
              placeholder="Paste the revised document here..."
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              rows={12}
              disabled={!!fileB}
            />
          </div>
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleSubmit} disabled={!canSubmit}>
        {loading ? "Comparing..." : "Compare Documents"}
      </button>

      {loading && <LoadingSpinner message="Comparing documents..." />}
      <ResultPanel title="Comparison Results" result={result} />
    </div>
  );
}
