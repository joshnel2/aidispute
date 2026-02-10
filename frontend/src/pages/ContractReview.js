import React, { useState } from "react";
import { postForm } from "../utils/api";
import FileUpload from "../components/FileUpload";
import ResultPanel from "../components/ResultPanel";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

export default function ContractReview() {
  const [tab, setTab] = useState("paste"); // paste | upload
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [playbookTab, setPlaybookTab] = useState("none"); // none | paste | upload
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
      if (tab === "upload" && file) {
        formData.append("file", file);
      } else {
        formData.append("text", text);
      }

      if (playbookTab === "upload" && playbookFile) {
        formData.append("playbook", playbookFile);
      } else if (playbookTab === "paste" && playbookText.trim()) {
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

  const canSubmit =
    !loading && ((tab === "paste" && text.trim()) || (tab === "upload" && file));

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
          Optionally upload your firm's playbook for deviation analysis.
        </p>
      </div>

      <ErrorBanner message={error} />

      {/* Contract input */}
      <div className="card">
        <div className="card-title">Contract Document</div>

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
            placeholder="Paste the full contract text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
          />
        ) : (
          <FileUpload
            file={file}
            onChange={setFile}
            id="contract-file"
          />
        )}
      </div>

      {/* Playbook (optional) */}
      <div className="card">
        <div className="card-title">Firm Playbook (Optional)</div>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
          Upload your firm's preferred terms and positions. The AI will flag any
          deviations from your playbook.
        </p>

        <div className="tabs">
          <button
            className={`tab ${playbookTab === "none" ? "active" : ""}`}
            onClick={() => setPlaybookTab("none")}
          >
            No Playbook
          </button>
          <button
            className={`tab ${playbookTab === "paste" ? "active" : ""}`}
            onClick={() => setPlaybookTab("paste")}
          >
            Paste
          </button>
          <button
            className={`tab ${playbookTab === "upload" ? "active" : ""}`}
            onClick={() => setPlaybookTab("upload")}
          >
            Upload
          </button>
        </div>

        {playbookTab === "paste" && (
          <textarea
            className="form-textarea"
            placeholder="Paste your firm's playbook / preferred positions here..."
            value={playbookText}
            onChange={(e) => setPlaybookText(e.target.value)}
            rows={8}
          />
        )}
        {playbookTab === "upload" && (
          <FileUpload
            file={playbookFile}
            onChange={setPlaybookFile}
            id="playbook-file"
          />
        )}
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
