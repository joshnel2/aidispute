import React, { useState } from "react";
import { postForm } from "../utils/api";
import DocumentInput from "../components/DocumentInput";
import ResultPanel from "../components/ResultPanel";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

export default function ComplianceCheck() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [jurisdiction, setJurisdiction] = useState("");
  const [regulations, setRegulations] = useState("");
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
      formData.append("jurisdiction", jurisdiction);
      formData.append("regulations", regulations);
      const data = await postForm("/api/compliance-check", formData);
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
        <h2>{"\u2705"} Compliance Check</h2>
        <p>
          Verify legal documents against regulatory frameworks. Get a detailed
          gap analysis with remediation recommendations.
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
          fileId="compliance-file"
          placeholder="Paste the document text here..."
        />
      </div>

      <div className="card">
        <div className="card-title">Compliance Parameters</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Jurisdiction</label>
            <input
              className="form-input"
              placeholder="e.g. United States, European Union, California..."
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Regulations / Standards</label>
            <input
              className="form-input"
              placeholder="e.g. GDPR, CCPA, HIPAA, SOX, PCI-DSS..."
              value={regulations}
              onChange={(e) => setRegulations(e.target.value)}
            />
          </div>
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleSubmit} disabled={!canSubmit}>
        {loading ? "Checking..." : "Run Compliance Check"}
      </button>

      {loading && <LoadingSpinner message="Checking compliance..." />}
      <ResultPanel title="Compliance Report" result={result} />
    </div>
  );
}
