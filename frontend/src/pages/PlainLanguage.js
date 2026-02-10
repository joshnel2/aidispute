import React, { useState } from "react";
import { postForm } from "../utils/api";
import DocumentInput from "../components/DocumentInput";
import ResultPanel from "../components/ResultPanel";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

export default function PlainLanguage() {
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
      const data = await postForm("/api/plain-language", formData);
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
        <h2>{"\u{1F524}"} Plain Language Translation</h2>
        <p>
          Translate complex legal documents into clear, everyday English that
          anyone can understand. Important provisions are highlighted so nothing
          gets missed.
        </p>
      </div>

      <ErrorBanner message={error} />

      <div className="card">
        <div className="card-title">Legal Document</div>
        <DocumentInput
          file={file}
          onFileChange={setFile}
          text={text}
          onTextChange={setText}
          fileId="plain-file"
          placeholder="Paste the legal text here..."
        />
      </div>

      <button className="btn btn-primary" onClick={handleSubmit} disabled={!canSubmit}>
        {loading ? "Translating..." : "Translate to Plain English"}
      </button>

      {loading && <LoadingSpinner message="Translating to plain English..." />}
      <ResultPanel title="Plain Language Version" result={result} />
    </div>
  );
}
