import React, { useState } from "react";
import { postForm } from "../utils/api";
import DocumentInput from "../components/DocumentInput";
import ResultPanel from "../components/ResultPanel";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

export default function Summarize() {
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
      const data = await postForm("/api/summarize", formData);
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
        <h2>{"\u{1F4C4}"} Document Summarization</h2>
        <p>
          Get a structured summary of any legal document -- key terms,
          obligations, financial terms, important dates, and an executive brief.
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
          fileId="summarize-file"
          placeholder="Paste the document text here..."
        />
      </div>

      <button className="btn btn-primary" onClick={handleSubmit} disabled={!canSubmit}>
        {loading ? "Summarizing..." : "Summarize Document"}
      </button>

      {loading && <LoadingSpinner message="Summarizing..." />}
      <ResultPanel title="Document Summary" result={result} />
    </div>
  );
}
