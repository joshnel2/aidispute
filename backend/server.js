require("dotenv").config({ path: "../.env" });
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { azureChat } = require("./azure-openai");
const { SYSTEM_PROMPTS } = require("./prompts");
const { extractTextFromFile } = require("./file-parser");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Serve static frontend in production
app.use(express.static(path.join(__dirname, "../frontend/build")));

// File upload config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (
      allowed.includes(file.mimetype) ||
      file.originalname.endsWith(".txt") ||
      file.originalname.endsWith(".md")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, TXT, DOC, and DOCX files are supported"));
    }
  },
});

// In-memory session store for chat conversations
const sessions = new Map();

function getOrCreateSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { messages: [], createdAt: Date.now() });
  }
  return sessions.get(sessionId);
}

// Purge stale sessions every 30 min
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.createdAt > 2 * 60 * 60 * 1000) sessions.delete(id);
  }
}, 30 * 60 * 1000);

// =================================================================
//  Health check
// =================================================================
app.get("/api/health", (_req, res) => {
  const configured = !!(
    process.env.AZURE_OPENAI_API_KEY &&
    process.env.AZURE_OPENAI_ENDPOINT &&
    process.env.AZURE_OPENAI_DEPLOYMENT_NAME
  );
  res.json({ status: "ok", azureConfigured: configured });
});

// =================================================================
//  1. /review-contract  –  Automated Contract Review & Redlining
// =================================================================
app.post(
  "/api/review-contract",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "playbook", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      let documentText = req.body.text || "";
      let playbookText = req.body.playbookText || "";

      if (req.files?.file?.[0]) {
        documentText = await extractTextFromFile(req.files.file[0]);
      }
      if (req.files?.playbook?.[0]) {
        playbookText = await extractTextFromFile(req.files.playbook[0]);
      }
      if (!documentText.trim()) {
        return res.status(400).json({ error: "No contract text provided" });
      }

      let userMessage = `CONTRACT TO REVIEW:\n\n${documentText}`;
      if (playbookText.trim()) {
        userMessage += `\n\n---\n\nFIRM PLAYBOOK (preferred terms & positions):\n\n${playbookText}`;
      }

      const result = await azureChat(
        SYSTEM_PROMPTS["review-contract"],
        userMessage
      );
      res.json({ result });
    } catch (err) {
      console.error("Contract review error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// =================================================================
//  2. /triage-nda  –  NDA Triage & Processing
// =================================================================
app.post("/api/triage-nda", upload.single("file"), async (req, res) => {
  try {
    let documentText = req.body.text || "";
    const riskThresholds = req.body.riskThresholds || "";

    if (req.file) {
      documentText = await extractTextFromFile(req.file);
    }
    if (!documentText.trim()) {
      return res.status(400).json({ error: "No NDA text provided" });
    }

    let userMessage = `NDA DOCUMENT:\n\n${documentText}`;
    if (riskThresholds.trim()) {
      userMessage += `\n\n---\n\nRISK THRESHOLDS & POLICIES:\n\n${riskThresholds}`;
    }

    const result = await azureChat(SYSTEM_PROMPTS["triage-nda"], userMessage);
    res.json({ result });
  } catch (err) {
    console.error("NDA triage error:", err);
    res.status(500).json({ error: err.message });
  }
});

// =================================================================
//  3. /clause-extraction  –  Extract & Analyze Specific Clauses
// =================================================================
app.post(
  "/api/clause-extraction",
  upload.single("file"),
  async (req, res) => {
    try {
      let documentText = req.body.text || "";
      if (req.file) {
        documentText = await extractTextFromFile(req.file);
      }
      if (!documentText.trim()) {
        return res.status(400).json({ error: "No document text provided" });
      }

      const result = await azureChat(
        SYSTEM_PROMPTS["clause-extraction"],
        documentText
      );
      res.json({ result });
    } catch (err) {
      console.error("Clause extraction error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// =================================================================
//  4. /draft  –  Legal Document Drafting
// =================================================================
app.post("/api/draft", async (req, res) => {
  try {
    const { documentType, jurisdiction, parties, details } = req.body;
    if (!documentType || !details) {
      return res
        .status(400)
        .json({ error: "Document type and details are required" });
    }

    let userMessage = `DOCUMENT TYPE: ${documentType}\n`;
    if (jurisdiction) userMessage += `JURISDICTION: ${jurisdiction}\n`;
    if (parties) userMessage += `PARTIES: ${parties}\n`;
    userMessage += `\nDETAILS & REQUIREMENTS:\n${details}`;

    const result = await azureChat(SYSTEM_PROMPTS["draft"], userMessage);
    res.json({ result });
  } catch (err) {
    console.error("Drafting error:", err);
    res.status(500).json({ error: err.message });
  }
});

// =================================================================
//  5. /compliance-check  –  Regulatory Compliance Analysis
// =================================================================
app.post(
  "/api/compliance-check",
  upload.single("file"),
  async (req, res) => {
    try {
      let documentText = req.body.text || "";
      const jurisdiction = req.body.jurisdiction || "General";
      const regulations = req.body.regulations || "";

      if (req.file) {
        documentText = await extractTextFromFile(req.file);
      }
      if (!documentText.trim()) {
        return res.status(400).json({ error: "No document text provided" });
      }

      const userMessage = `JURISDICTION: ${jurisdiction}\nREGULATIONS TO CHECK AGAINST: ${regulations || "General best practices"}\n\nDOCUMENT:\n${documentText}`;
      const result = await azureChat(
        SYSTEM_PROMPTS["compliance-check"],
        userMessage
      );
      res.json({ result });
    } catch (err) {
      console.error("Compliance check error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// =================================================================
//  6. /compare  –  Document Comparison / Redline
// =================================================================
app.post("/api/compare", async (req, res) => {
  try {
    const { documentA, documentB } = req.body;
    if (!documentA || !documentB) {
      return res.status(400).json({ error: "Two documents are required" });
    }

    const userMessage = `=== DOCUMENT A (Original) ===\n${documentA}\n\n=== DOCUMENT B (Revised) ===\n${documentB}`;
    const result = await azureChat(SYSTEM_PROMPTS["compare"], userMessage);
    res.json({ result });
  } catch (err) {
    console.error("Comparison error:", err);
    res.status(500).json({ error: err.message });
  }
});

// =================================================================
//  7. /summarize  –  Legal Document Summarization
// =================================================================
app.post("/api/summarize", upload.single("file"), async (req, res) => {
  try {
    let documentText = req.body.text || "";
    if (req.file) {
      documentText = await extractTextFromFile(req.file);
    }
    if (!documentText.trim()) {
      return res.status(400).json({ error: "No document text provided" });
    }

    const result = await azureChat(SYSTEM_PROMPTS["summarize"], documentText);
    res.json({ result });
  } catch (err) {
    console.error("Summarization error:", err);
    res.status(500).json({ error: err.message });
  }
});

// =================================================================
//  8. /plain-language  –  Legal-to-Plain-English Translation
// =================================================================
app.post(
  "/api/plain-language",
  upload.single("file"),
  async (req, res) => {
    try {
      let documentText = req.body.text || "";
      if (req.file) {
        documentText = await extractTextFromFile(req.file);
      }
      if (!documentText.trim()) {
        return res.status(400).json({ error: "No document text provided" });
      }

      const result = await azureChat(
        SYSTEM_PROMPTS["plain-language"],
        documentText
      );
      res.json({ result });
    } catch (err) {
      console.error("Plain language error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// =================================================================
//  9. /risk-assessment  –  Comprehensive Risk Analysis
// =================================================================
app.post(
  "/api/risk-assessment",
  upload.single("file"),
  async (req, res) => {
    try {
      let documentText = req.body.text || "";
      if (req.file) {
        documentText = await extractTextFromFile(req.file);
      }
      if (!documentText.trim()) {
        return res.status(400).json({ error: "No document text provided" });
      }

      const result = await azureChat(
        SYSTEM_PROMPTS["risk-assessment"],
        documentText
      );
      res.json({ result });
    } catch (err) {
      console.error("Risk assessment error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// =================================================================
//  10. /chat  –  Legal Q&A Assistant (multi-turn)
// =================================================================
app.post("/api/chat", async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const sid = sessionId || uuidv4();
    const session = getOrCreateSession(sid);
    session.messages.push({ role: "user", content: message });

    const recentMessages = session.messages.slice(-20);
    const result = await azureChat(
      SYSTEM_PROMPTS["chat"],
      null,
      recentMessages
    );

    session.messages.push({ role: "assistant", content: result });
    res.json({ result, sessionId: sid });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message });
  }
});

// =================================================================
//  SPA fallback
// =================================================================
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

// =================================================================
//  Start
// =================================================================
app.listen(PORT, () => {
  console.log(`\n  Legal AI Backend running on http://localhost:${PORT}`);
  console.log(
    `  Azure OpenAI configured: ${!!(process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_DEPLOYMENT_NAME)}\n`
  );
});
