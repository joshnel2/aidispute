import React, { useState } from "react";
import { postForm } from "../utils/api";
import FileUpload from "../components/FileUpload";
import ResultPanel from "../components/ResultPanel";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

export default function NdaTriage() {
  const [tab, setTab] = useState("paste");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [riskThresholds, setRiskThresholds] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const formData = new FormData();
      if (tab === "upload" && file) {
        formData.append("file", file);
      } else {
        formData.append("text", text);
      }
      if (riskThresholds.trim()) {
        formData.append("riskThresholds", riskThresholds);
      }

      const data = await postForm("/api/triage-nda", formData);
      setResult(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    !loading && ((tab === "paste" && text.trim()) || (tab === "upload" && file));

  return (
    <div>
      <div className="page-header">
        <h2>{"\u{1F4CB}"} NDA Triage & Processing</h2>
        <p>
          Quickly triage Non-Disclosure Agreements. Identifies mutual vs.
          one-way, extracts key dates and terms, and provides a go/no-go
          recommendation based on your risk thresholds.
        </p>
      </div>

      <ErrorBanner message={error} />

      <div className="card">
        <div className="card-title">NDA Document</div>

        <div className="tabs">
          <button
            className={`tab ${tab === "paste" ? "active" : ""}`}
            onClick={() => setTab("paste")}
          >
            Paste Text
          </button>
          <button
            className={`tab ${tab === "upload" ? "active" : ""}`}
            onClick={() => setTab("upload")}
          >
            Upload File
          </button>
        </div>

        {tab === "paste" ? (
          <textarea
            className="form-textarea"
            placeholder="Paste the NDA text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
          />
        ) : (
          <FileUpload file={file} onChange={setFile} id="nda-file" />
        )}
      </div>

      <div className="card">
        <div className="card-title">Risk Thresholds (Optional)</div>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
          Define your organization's acceptable risk parameters. The AI will
          evaluate the NDA against these criteria for the go/no-go
          recommendation.
        </p>
        <textarea
          className="form-textarea"
          placeholder={`Example:\n- Maximum term: 3 years\n- Survival period must not exceed 2 years\n- No non-solicitation clauses\n- Mutual obligations only\n- Must allow residuals\n- Governing law: Delaware or New York only`}
          value={riskThresholds}
          onChange={(e) => setRiskThresholds(e.target.value)}
          rows={6}
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={!canSubmit}
      >
        {loading ? "Triaging..." : "Triage NDA"}
      </button>

      {loading && <LoadingSpinner message="Analyzing NDA..." />}
      <ResultPanel title="NDA Triage Results" result={result} />
    </div>
  );
}
