import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getJSON } from "../utils/api";

const ANALYSIS_TOOLS = [
  {
    path: "/review-contract",
    icon: "\u{1F4DD}",
    title: "Contract Review & Redlining",
    desc: "Upload a contract for risk-triage (green/yellow/red), playbook alignment, and contextual clause analysis.",
    accent: "blue",
  },
  {
    path: "/triage-nda",
    icon: "\u{1F4CB}",
    title: "NDA Triage",
    desc: "Classify NDAs as mutual or one-way, extract key dates, and get a go/no-go recommendation.",
    accent: "emerald",
  },
  {
    path: "/risk-assessment",
    icon: "\u26A0\uFE0F",
    title: "Risk Assessment",
    desc: "Severity-scored risk matrix with cross-clause interactions, mitigation strategies, and prioritized actions.",
    accent: "amber",
  },
  {
    path: "/clause-extraction",
    icon: "\u{1F50D}",
    title: "Clause Extraction",
    desc: "Extract and analyze every clause with plain-English explanations and missing clause detection.",
    accent: "purple",
  },
  {
    path: "/compliance-check",
    icon: "\u2705",
    title: "Compliance Check",
    desc: "Verify documents against GDPR, CCPA, HIPAA, and other frameworks with gap analysis.",
    accent: "teal",
  },
];

const DOC_TOOLS = [
  {
    path: "/summarize",
    icon: "\u{1F4C4}",
    title: "Document Summarization",
    desc: "Structured summary with key terms, obligations, financial terms, and an executive brief.",
    accent: "cyan",
  },
  {
    path: "/plain-language",
    icon: "\u{1F524}",
    title: "Plain Language Translation",
    desc: "Translate legal jargon into clear, everyday English with highlighted gotcha provisions.",
    accent: "orange",
  },
  {
    path: "/compare",
    icon: "\u{1F504}",
    title: "Document Comparison",
    desc: "Detailed redline analysis showing material changes, additions, deletions, and impact scores.",
    accent: "rose",
  },
  {
    path: "/draft",
    icon: "\u270F\uFE0F",
    title: "Document Drafting",
    desc: "Generate NDAs, MSAs, employment agreements, and 12+ document types from specifications.",
    accent: "indigo",
  },
  {
    path: "/chat",
    icon: "\u{1F4AC}",
    title: "Legal Q&A Chat",
    desc: "Multi-turn conversation for contract interpretation, regulatory questions, and legal strategy.",
    accent: "pink",
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
      {/* Hero */}
      <div className="home-hero">
        <div className="home-hero-icon">{"\u2696\uFE0F"}</div>
        <h2>Legal AI Workspace</h2>
        <p>
          AI-powered legal document analysis, review, and drafting. Built on
          Azure OpenAI for enterprise-grade reliability and security.
        </p>

        {status && (
          <div
            className={`home-status ${status.azureConfigured ? "connected" : "disconnected"}`}
          >
            <span className="home-status-dot" />
            {status.azureConfigured
              ? "Azure OpenAI Connected"
              : "Azure OpenAI Not Configured"}
          </div>
        )}
      </div>

      {/* Analysis Tools */}
      <div className="tools-section-title">Analysis Tools</div>
      <div className="tools-grid">
        {ANALYSIS_TOOLS.map((tool) => (
          <Link
            to={tool.path}
            className="tool-card"
            key={tool.path}
            data-accent={tool.accent}
          >
            <div className="tool-card-icon">{tool.icon}</div>
            <h3>{tool.title}</h3>
            <p>{tool.desc}</p>
            <div className="tool-card-arrow">
              Open tool {"\u2192"}
            </div>
          </Link>
        ))}
      </div>

      {/* Document & Chat Tools */}
      <div className="tools-section-title">Documents & Chat</div>
      <div className="tools-grid">
        {DOC_TOOLS.map((tool) => (
          <Link
            to={tool.path}
            className="tool-card"
            key={tool.path}
            data-accent={tool.accent}
          >
            <div className="tool-card-icon">{tool.icon}</div>
            <h3>{tool.title}</h3>
            <p>{tool.desc}</p>
            <div className="tool-card-arrow">
              Open tool {"\u2192"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
