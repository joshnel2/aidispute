import React, { useState } from "react";
import { postForm } from "../utils/api";
import DocumentInput from "../components/DocumentInput";
import FileUpload from "../components/FileUpload";
import ResultPanel from "../components/ResultPanel";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

export default function ContractReview() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [playbookText, setPlaybookText] = useState("");
  const [playbookFile, setPlaybookFile] = useState(null);
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

      if (playbookFile) {
        formData.append("playbook", playbookFile);
      } else if (playbookText.trim()) {
        formData.append("playbookText", playbookText);
      }

      const data = await postForm("/api/review-contract", formData);
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
        <h2>{"\u{1F4DD}"} Contract Review & Redlining</h2>
        <p>
          Upload or paste a contract for comprehensive first-pass review.
          Clauses are triaged as{" "}
          <span style={{ color: "var(--green)" }}>green (standard)</span>,{" "}
          <span style={{ color: "var(--yellow)" }}>yellow (risky)</span>, or{" "}
          <span style={{ color: "var(--red)" }}>red (critical)</span>.
          Optionally provide your firm's playbook for deviation analysis.
        </p>
      </div>

      <ErrorBanner message={error} />

      {/* Contract input — upload + paste side by side */}
      <div className="card">
        <div className="card-title">Contract Document</div>

        <DocumentInput
          file={file}
          onFileChange={setFile}
          text={text}
          onTextChange={setText}
          fileId="contract-file"
          placeholder="Paste the full contract text here..."
        />
      </div>

      {/* Playbook (optional) — upload + paste side by side */}
      <div className="card">
        <div className="card-title">Firm Playbook (Optional)</div>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
          Provide your firm's preferred terms and positions. The AI will flag any
          deviations from your playbook.
        </p>

        <div className="input-methods">
          <div>
            <label className="form-label">Upload Playbook</label>
            <FileUpload
              file={playbookFile}
              onChange={setPlaybookFile}
              id="playbook-file"
            />
          </div>
          <div>
            <label className="form-label">Or Paste Playbook</label>
            <textarea
              className="form-textarea"
              placeholder="Paste your firm's playbook / preferred positions..."
              value={playbookText}
              onChange={(e) => setPlaybookText(e.target.value)}
              style={{ minHeight: 180 }}
              disabled={!!playbookFile}
            />
          </div>
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={!canSubmit}
      >
        {loading ? "Analyzing..." : "Review Contract"}
      </button>

      {loading && <LoadingSpinner message="Reviewing contract... this may take a moment." />}
      <ResultPanel title="Contract Review Results" result={result} />
    </div>
  );
}
