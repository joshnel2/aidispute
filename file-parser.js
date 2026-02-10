/**
 * File parser – extracts text from uploaded files.
 * Supports PDF and plain text.
 */

const pdfParse = require("pdf-parse");

/**
 * Extract text content from an uploaded file (multer file object).
 * @param {Object} file - multer file object with .buffer and .mimetype
 * @returns {string} Extracted text
 */
async function extractTextFromFile(file) {
  if (!file || !file.buffer) {
    throw new Error("No file provided");
  }

  const mime = file.mimetype || "";
  const name = (file.originalname || "").toLowerCase();

  // PDF
  if (mime === "application/pdf" || name.endsWith(".pdf")) {
    const data = await pdfParse(file.buffer);
    return data.text || "";
  }

  // Plain text / markdown / doc-ish fallback
  if (
    mime.startsWith("text/") ||
    name.endsWith(".txt") ||
    name.endsWith(".md")
  ) {
    return file.buffer.toString("utf-8");
  }

  // For DOC/DOCX we do a best-effort raw text extraction
  // (a full OOXML parser would be heavier — keep it simple)
  if (
    mime === "application/msword" ||
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".doc") ||
    name.endsWith(".docx")
  ) {
    // Attempt to pull readable strings from the binary
    const raw = file.buffer.toString("utf-8");
    // Strip non-printable characters but keep newlines/spaces
    const cleaned = raw.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/ {2,}/g, " ");
    return cleaned;
  }

  return file.buffer.toString("utf-8");
}

module.exports = { extractTextFromFile };
