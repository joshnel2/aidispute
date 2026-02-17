/*
 * Legal AI Platform — Express Server
 * Designed for Azure App Service deployment.
 *
 * Azure injects env vars via App Settings (no .env needed in production).
 * Locally, .env is loaded via dotenv.
 */
try {
  require("dotenv").config();
} catch (_) {
  /* dotenv is optional in production */
}

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { azureChat } = require("./azure-openai");
const { SYSTEM_PROMPTS } = require("./prompts");
const { extractTextFromFile } = require("./file-parser");

const app = express();
const PORT = process.env.PORT || 8080;

// ── Middleware ────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Serve the React production build
app.use(express.static(path.join(__dirname, "frontend", "build")));

// File upload config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "text/plain",
      "text/csv",
      "text/markdown",
      "text/rtf",
      "application/rtf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.oasis.opendocument.text",
    ];
    const allowedExtensions = [
      ".pdf", ".txt", ".md", ".csv",
      ".doc", ".docx", ".rtf", ".odt",
      ".xls", ".xlsx",
      ".ppt", ".pptx",
    ];
    const name = (file.originalname || "").toLowerCase();
    if (
      allowed.includes(file.mimetype) ||
      file.mimetype.startsWith("text/") ||
      allowedExtensions.some((ext) => name.endsWith(ext))
    ) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type. Supported formats: PDF, TXT, DOC, DOCX, CSV, XLS, XLSX, RTF, ODT, PPT, PPTX"));
    }
  },
});

// ── Chat session store ───────────────────────────────────────────
const sessions = new Map();

function getOrCreateSession(id) {
  if (!sessions.has(id)) {
    sessions.set(id, { messages: [], createdAt: Date.now() });
  }
  return sessions.get(id);
}

// Purge stale sessions older than 90 days (check every hour)
const SESSION_MAX_AGE_MS = 90 * 24 * 3600000; // 90 days
setInterval(() => {
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (now - s.createdAt > SESSION_MAX_AGE_MS) sessions.delete(id);
  }
}, 3600000);

// ═════════════════════════════════════════════════════════════════
//  API Routes
// ═════════════════════════════════════════════════════════════════

// Health
app.get("/api/health", (_req, res) => {
  const configured = !!(
    process.env.AZURE_OPENAI_API_KEY &&
    process.env.AZURE_OPENAI_ENDPOINT &&
    process.env.AZURE_OPENAI_DEPLOYMENT_NAME
  );
  res.json({ status: "ok", azureConfigured: configured });
});

// 1. Contract Review & Redlining
app.post(
  "/api/review-contract",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "playbook", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      let docText = req.body.text || "";
      let playbookText = req.body.playbookText || "";
      if (req.files?.file?.[0]) docText = await extractTextFromFile(req.files.file[0]);
      if (req.files?.playbook?.[0]) playbookText = await extractTextFromFile(req.files.playbook[0]);
      if (!docText.trim()) return res.status(400).json({ error: "No contract text provided" });

      let msg = `CONTRACT TO REVIEW:\n\n${docText}`;
      if (playbookText.trim()) msg += `\n\n---\n\nFIRM PLAYBOOK (preferred terms & positions):\n\n${playbookText}`;

      const result = await azureChat(SYSTEM_PROMPTS["review-contract"], msg);
      res.json({ result });
    } catch (err) {
      console.error("Contract review error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// 2. NDA Triage
app.post("/api/triage-nda", upload.single("file"), async (req, res) => {
  try {
    let docText = req.body.text || "";
    const thresholds = req.body.riskThresholds || "";
    if (req.file) docText = await extractTextFromFile(req.file);
    if (!docText.trim()) return res.status(400).json({ error: "No NDA text provided" });

    let msg = `NDA DOCUMENT:\n\n${docText}`;
    if (thresholds.trim()) msg += `\n\n---\n\nRISK THRESHOLDS & POLICIES:\n\n${thresholds}`;

    const result = await azureChat(SYSTEM_PROMPTS["triage-nda"], msg);
    res.json({ result });
  } catch (err) {
    console.error("NDA triage error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Clause Extraction
app.post("/api/clause-extraction", upload.single("file"), async (req, res) => {
  try {
    let docText = req.body.text || "";
    if (req.file) docText = await extractTextFromFile(req.file);
    if (!docText.trim()) return res.status(400).json({ error: "No document text provided" });
    const result = await azureChat(SYSTEM_PROMPTS["clause-extraction"], docText);
    res.json({ result });
  } catch (err) {
    console.error("Clause extraction error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Document Drafting
app.post("/api/draft", async (req, res) => {
  try {
    const { documentType, jurisdiction, parties, details } = req.body;
    if (!documentType || !details) return res.status(400).json({ error: "Document type and details are required" });

    let msg = `DOCUMENT TYPE: ${documentType}\n`;
    if (jurisdiction) msg += `JURISDICTION: ${jurisdiction}\n`;
    if (parties) msg += `PARTIES: ${parties}\n`;
    msg += `\nDETAILS & REQUIREMENTS:\n${details}`;

    const result = await azureChat(SYSTEM_PROMPTS["draft"], msg);
    res.json({ result });
  } catch (err) {
    console.error("Drafting error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Compliance Check
app.post("/api/compliance-check", upload.single("file"), async (req, res) => {
  try {
    let docText = req.body.text || "";
    const jurisdiction = req.body.jurisdiction || "General";
    const regulations = req.body.regulations || "";
    if (req.file) docText = await extractTextFromFile(req.file);
    if (!docText.trim()) return res.status(400).json({ error: "No document text provided" });

    const msg = `JURISDICTION: ${jurisdiction}\nREGULATIONS TO CHECK AGAINST: ${regulations || "General best practices"}\n\nDOCUMENT:\n${docText}`;
    const result = await azureChat(SYSTEM_PROMPTS["compliance-check"], msg);
    res.json({ result });
  } catch (err) {
    console.error("Compliance check error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 6. Document Comparison
app.post(
  "/api/compare",
  upload.fields([
    { name: "fileA", maxCount: 1 },
    { name: "fileB", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      let docA = req.body.documentA || "";
      let docB = req.body.documentB || "";
      if (req.files?.fileA?.[0]) docA = await extractTextFromFile(req.files.fileA[0]);
      if (req.files?.fileB?.[0]) docB = await extractTextFromFile(req.files.fileB[0]);
      if (!docA.trim() || !docB.trim()) return res.status(400).json({ error: "Two documents are required" });
      const msg = `=== DOCUMENT A (Original) ===\n${docA}\n\n=== DOCUMENT B (Revised) ===\n${docB}`;
      const result = await azureChat(SYSTEM_PROMPTS["compare"], msg);
      res.json({ result });
    } catch (err) {
      console.error("Comparison error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// 7. Summarization
app.post("/api/summarize", upload.single("file"), async (req, res) => {
  try {
    let docText = req.body.text || "";
    if (req.file) docText = await extractTextFromFile(req.file);
    if (!docText.trim()) return res.status(400).json({ error: "No document text provided" });
    const result = await azureChat(SYSTEM_PROMPTS["summarize"], docText);
    res.json({ result });
  } catch (err) {
    console.error("Summarization error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 8. Plain Language
app.post("/api/plain-language", upload.single("file"), async (req, res) => {
  try {
    let docText = req.body.text || "";
    if (req.file) docText = await extractTextFromFile(req.file);
    if (!docText.trim()) return res.status(400).json({ error: "No document text provided" });
    const result = await azureChat(SYSTEM_PROMPTS["plain-language"], docText);
    res.json({ result });
  } catch (err) {
    console.error("Plain language error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 9. Risk Assessment
app.post("/api/risk-assessment", upload.single("file"), async (req, res) => {
  try {
    let docText = req.body.text || "";
    if (req.file) docText = await extractTextFromFile(req.file);
    if (!docText.trim()) return res.status(400).json({ error: "No document text provided" });
    const result = await azureChat(SYSTEM_PROMPTS["risk-assessment"], docText);
    res.json({ result });
  } catch (err) {
    console.error("Risk assessment error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 10. Chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const sid = sessionId || uuidv4();
    const session = getOrCreateSession(sid);
    session.messages.push({ role: "user", content: message });

    const recent = session.messages.slice(-20);
    const result = await azureChat(SYSTEM_PROMPTS["chat"], null, recent);
    session.messages.push({ role: "assistant", content: result });

    res.json({ result, sessionId: sid });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── SPA fallback ─────────────────────────────────────────────────
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
});

// ── Start ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Legal AI Platform running on port ${PORT}`);
  console.log(`Azure OpenAI configured: ${!!(process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_DEPLOYMENT_NAME)}`);
});
