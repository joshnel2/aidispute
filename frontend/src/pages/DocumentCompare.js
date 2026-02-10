import React, { useState } from "react";
import { postJSON } from "../utils/api";
import ResultPanel from "../components/ResultPanel";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

export default function DocumentCompare() {
  const [documentA, setDocumentA] = useState("");
  const [documentB, setDocumentB] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const data = await postJSON("/api/compare", { documentA, documentB });
      setResult(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !loading && documentA.trim() && documentB.trim();

  return (
    <div>
      <div className="page-header">
        <h2>{"\u{1F504}"} Document Comparison</h2>
        <p>
          Compare two versions of a document. Get a detailed redline showing all
          material changes, additions, deletions, and an overall impact assessment.
        </p>
      </div>

      <ErrorBanner message={error} />

      <div className="form-row">
        <div className="card">
          <div className="card-title">Document A (Original)</div>
          <textarea
            className="form-textarea"
            placeholder="Paste the original document here..."
            value={documentA}
            onChange={(e) => setDocumentA(e.target.value)}
            rows={16}
          />
        </div>

        <div className="card">
          <div className="card-title">Document B (Revised)</div>
          <textarea
            className="form-textarea"
            placeholder="Paste the revised document here..."
            value={documentB}
            onChange={(e) => setDocumentB(e.target.value)}
            rows={16}
          />
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
