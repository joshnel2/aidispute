import React, { useState } from "react";
import { postForm } from "../utils/api";
import DocumentInput from "../components/DocumentInput";
import ResultPanel from "../components/ResultPanel";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

export default function RiskAssessment() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      } else {
        formData.append("text", text);
      }
      const data = await postForm("/api/risk-assessment", formData);
      setResult(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !loading && (file || text.trim());

  return (
    <div>
      <div className="page-header">
        <h2>{"\u26A0\uFE0F"} Risk Assessment</h2>
        <p>
          Comprehensive risk analysis with severity and likelihood scoring,
          cross-clause risk interactions, mitigation strategies, and a
          prioritized action plan.
        </p>
      </div>

      <ErrorBanner message={error} />

      <div className="card">
        <div className="card-title">Document</div>
        <DocumentInput
          file={file}
          onFileChange={setFile}
          text={text}
          onTextChange={setText}
          fileId="risk-file"
          placeholder="Paste the document text here..."
        />
      </div>

      <button className="btn btn-primary" onClick={handleSubmit} disabled={!canSubmit}>
        {loading ? "Assessing..." : "Assess Risk"}
      </button>

      {loading && <LoadingSpinner message="Analyzing risks..." />}
      <ResultPanel title="Risk Assessment Report" result={result} />
    </div>
  );
}
