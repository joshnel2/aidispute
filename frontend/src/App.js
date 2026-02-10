import React, { useState, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation,
} from "react-router-dom";

import Home from "./pages/Home";
import ContractReview from "./pages/ContractReview";
import NdaTriage from "./pages/NdaTriage";
import ClauseExtraction from "./pages/ClauseExtraction";
import DocumentDrafting from "./pages/DocumentDrafting";
import ComplianceCheck from "./pages/ComplianceCheck";
import DocumentCompare from "./pages/DocumentCompare";
import Summarize from "./pages/Summarize";
import PlainLanguage from "./pages/PlainLanguage";
import RiskAssessment from "./pages/RiskAssessment";
import LegalChat from "./pages/LegalChat";

const NAV_SECTIONS = [
  {
    title: "Analysis",
    items: [
      { path: "/review-contract", icon: "\u{1F4DD}", label: "Contract Review" },
      { path: "/triage-nda", icon: "\u{1F4CB}", label: "NDA Triage" },
      { path: "/risk-assessment", icon: "\u26A0\uFE0F", label: "Risk Assessment" },
      { path: "/clause-extraction", icon: "\u{1F50D}", label: "Clause Extraction" },
      { path: "/compliance-check", icon: "\u2705", label: "Compliance Check" },
    ],
  },
  {
    title: "Documents",
    items: [
      { path: "/summarize", icon: "\u{1F4C4}", label: "Summarize" },
      { path: "/plain-language", icon: "\u{1F524}", label: "Plain Language" },
      { path: "/compare", icon: "\u{1F504}", label: "Compare Docs" },
      { path: "/draft", icon: "\u270F\uFE0F", label: "Draft Document" },
    ],
  },
  {
    title: "Assistant",
    items: [{ path: "/chat", icon: "\u{1F4AC}", label: "Legal Q&A" }],
  },
];

function SidebarContent({ onNavigate }) {
  return (
    <>
      <div className="sidebar-header">
        <NavLink to="/" className="sidebar-logo" onClick={onNavigate}>
          <span className="sidebar-logo-icon">{"\u2696\uFE0F"}</span>
          <div className="sidebar-logo-text">
            <h1>Legal AI</h1>
            <span>Azure OpenAI</span>
          </div>
        </NavLink>
      </div>
      {NAV_SECTIONS.map((section) => (
        <div className="sidebar-section" key={section.title}>
          <div className="sidebar-section-title">{section.title}</div>
          <ul className="sidebar-nav">
            {section.items.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => (isActive ? "active" : "")}
                  onClick={onNavigate}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // Close sidebar on route change (mobile)
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-layout">
      {/* Mobile toggle */}
      <button
        className="mobile-toggle"
        onClick={() => setSidebarOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? "\u2715" : "\u2630"}
      </button>

      {/* Sidebar overlay for mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <SidebarContent onNavigate={closeSidebar} />
      </aside>

      {/* Main content */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/review-contract" element={<ContractReview />} />
          <Route path="/triage-nda" element={<NdaTriage />} />
          <Route path="/clause-extraction" element={<ClauseExtraction />} />
          <Route path="/draft" element={<DocumentDrafting />} />
          <Route path="/compliance-check" element={<ComplianceCheck />} />
          <Route path="/compare" element={<DocumentCompare />} />
          <Route path="/summarize" element={<Summarize />} />
          <Route path="/plain-language" element={<PlainLanguage />} />
          <Route path="/risk-assessment" element={<RiskAssessment />} />
          <Route path="/chat" element={<LegalChat />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}
