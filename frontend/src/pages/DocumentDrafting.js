import React, { useState } from "react";
import { postJSON } from "../utils/api";
import ResultPanel from "../components/ResultPanel";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBanner from "../components/ErrorBanner";

const DOC_TYPES = [
  "Non-Disclosure Agreement (NDA)",
  "Master Service Agreement (MSA)",
  "Software License Agreement",
  "Employment Agreement",
  "Independent Contractor Agreement",
  "Terms of Service",
  "Privacy Policy",
  "Partnership Agreement",
  "Letter of Intent (LOI)",
  "Memorandum of Understanding (MOU)",
  "Lease Agreement",
  "Non-Compete Agreement",
  "Release and Settlement Agreement",
  "Power of Attorney",
  "Other (specify in details)",
];

export default function DocumentDrafting() {
  const [documentType, setDocumentType] = useState(DOC_TYPES[0]);
  const [jurisdiction, setJurisdiction] = useState("");
  const [parties, setParties] = useState("");
  const [details, setDetails] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const data = await postJSON("/api/draft", {
        documentType,
        jurisdiction,
        parties,
        details,
      });
      setResult(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>{"\u270F\uFE0F"} Document Drafting</h2>
        <p>
          Generate professional legal documents from scratch. Select a document
          type, specify the details, and get a comprehensive first draft.
        </p>
      </div>

      <ErrorBanner message={error} />

      <div className="card">
        <div className="card-title">Document Specifications</div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Document Type</label>
            <select
              className="form-select"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
            >
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Governing Law / Jurisdiction</label>
            <input
              className="form-input"
              placeholder="e.g. State of Delaware, United Kingdom..."
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Parties</label>
          <input
            className="form-input"
            placeholder='e.g. "Acme Corp" (Discloser) and "Beta Inc" (Recipient)'
            value={parties}
            onChange={(e) => setParties(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Details & Requirements</label>
          <textarea
            className="form-textarea"
            placeholder={`Describe what you need in this document. The more detail, the better.\n\nExamples:\n- Mutual NDA for discussing a potential acquisition\n- 2-year term with 1-year survival period\n- Include non-solicitation clause\n- Standard carve-outs for publicly available information\n- Delaware governing law, arbitration for disputes`}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={10}
          />
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={loading || !details.trim()}
      >
        {loading ? "Drafting..." : "Generate Draft"}
      </button>

      {loading && <LoadingSpinner message="Drafting document..." />}
      <ResultPanel title="Generated Document" result={result} />
    </div>
  );
}
