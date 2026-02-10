import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getJSON } from "../utils/api";

const TOOLS = [
  {
    path: "/review-contract",
    icon: "\u{1F4DD}",
    title: "Contract Review & Redlining",
    desc: "Upload a contract for risk-triage (green/yellow/red), playbook alignment, and contextual clause analysis.",
  },
  {
    path: "/triage-nda",
    icon: "\u{1F4CB}",
    title: "NDA Triage",
    desc: "Quickly classify NDAs as mutual or one-way, extract key dates, and get a go/no-go recommendation.",
  },
  {
    path: "/risk-assessment",
    icon: "\u26A0\uFE0F",
    title: "Risk Assessment",
    desc: "Comprehensive risk analysis with severity scoring, mitigation strategies, and cross-clause interactions.",
  },
  {
    path: "/clause-extraction",
    icon: "\u{1F50D}",
    title: "Clause Extraction",
    desc: "Extract and analyze every clause — indemnity, liability, termination, IP, and more.",
  },
  {
    path: "/compliance-check",
    icon: "\u2705",
    title: "Compliance Check",
    desc: "Verify documents against regulatory frameworks. Get a gap analysis and remediation plan.",
  },
  {
    path: "/summarize",
    icon: "\u{1F4C4}",
    title: "Document Summarization",
    desc: "Get a structured summary with key terms, obligations, financial terms, and an executive brief.",
  },
  {
    path: "/plain-language",
    icon: "\u{1F4AC}",
    title: "Plain Language Translation",
    desc: "Translate legal jargon into clear, everyday English anyone can understand.",
  },
  {
    path: "/compare",
    icon: "\u{1F504}",
    title: "Document Comparison",
    desc: "Compare two versions of a document — see additions, deletions, and material changes.",
  },
  {
    path: "/draft",
    icon: "\u270F\uFE0F",
    title: "Document Drafting",
    desc: "Generate NDAs, service agreements, employment contracts, and more from scratch.",
  },
  {
    path: "/chat",
    icon: "\u{1F4AC}",
    title: "Legal Q&A Chat",
    desc: "Ask any legal question — contract interpretation, regulatory queries, strategy discussions.",
  },
];

export default function Home() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    getJSON("/api/health")
      .then(setStatus)
      .catch(() => setStatus({ status: "error", azureConfigured: false }));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h2>Legal AI Workspace</h2>
        <p>
          AI-powered legal document analysis, review, and drafting — built on
          Azure OpenAI. Select a tool below to get started.
        </p>
        {status && !status.azureConfigured && (
          <div className="error-banner" style={{ marginTop: 16 }}>
            <span>{"\u26A0\uFE0F"}</span>
            Azure OpenAI is not configured. Set AZURE_OPENAI_API_KEY,
            AZURE_OPENAI_ENDPOINT, and AZURE_OPENAI_DEPLOYMENT_NAME in your .env
            file.
          </div>
        )}
      </div>

      <div className="tools-grid">
        {TOOLS.map((tool) => (
          <Link to={tool.path} className="tool-card" key={tool.path}>
            <div className="tool-card-icon">{tool.icon}</div>
            <h3>{tool.title}</h3>
            <p>{tool.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
