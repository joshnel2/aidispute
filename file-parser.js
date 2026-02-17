/**
 * File parser – extracts text from uploaded files.
 * Supports PDF, DOCX, DOC, CSV, XLS, XLSX, RTF, TXT, MD, and more.
 */

const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const XLSX = require("xlsx");

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

  // DOCX (use mammoth for proper extraction)
  if (
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value || "";
  }

  // DOC (legacy binary Word format — best-effort raw text extraction)
  if (mime === "application/msword" || name.endsWith(".doc")) {
    const raw = file.buffer.toString("utf-8");
    const cleaned = raw.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/ {2,}/g, " ");
    return cleaned;
  }

  // CSV
  if (
    mime === "text/csv" ||
    mime === "application/csv" ||
    name.endsWith(".csv")
  ) {
    return file.buffer.toString("utf-8");
  }

  // Excel (XLS / XLSX)
  if (
    mime === "application/vnd.ms-excel" ||
    mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    name.endsWith(".xls") ||
    name.endsWith(".xlsx")
  ) {
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheets = [];
    for (const sheetName of workbook.SheetNames) {
      const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
      sheets.push(`--- Sheet: ${sheetName} ---\n${csv}`);
    }
    return sheets.join("\n\n");
  }

  // RTF (strip RTF control words for a rough plain-text extraction)
  if (
    mime === "text/rtf" ||
    mime === "application/rtf" ||
    name.endsWith(".rtf")
  ) {
    const raw = file.buffer.toString("utf-8");
    const text = raw
      .replace(/\{\\[^{}]*\}/g, "")
      .replace(/\\[a-z]+[-]?\d*\s?/gi, "")
      .replace(/[{}]/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
    return text;
  }

  // Plain text / markdown / ODT / any other text-based format
  if (
    mime.startsWith("text/") ||
    name.endsWith(".txt") ||
    name.endsWith(".md")
  ) {
    return file.buffer.toString("utf-8");
  }

  // Fallback: attempt UTF-8 decode
  return file.buffer.toString("utf-8");
}

module.exports = { extractTextFromFile };
