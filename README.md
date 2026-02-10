# Legal AI Platform

AI-powered legal document analysis, review, and drafting — built on **Azure OpenAI**.

This platform replicates the full feature set of the Claude Cowork Legal Plugin, using Azure AI Foundry as the AI backend.

---

## Features

### Contract Review & Redlining (`/review-contract`)
- **Risk Triage**: Clauses highlighted as green (standard), yellow (risky), or red (critical/unacceptable)
- **Playbook Alignment**: Upload your firm's playbook — AI flags deviations from preferred terms
- **Contextual Analysis**: Understands cross-clause interactions (e.g., indemnity offset by limitation of liability)

### NDA Triage (`/triage-nda`)
- Identifies mutual vs. one-way NDAs
- Extracts key dates, expiration terms, and survival periods
- Go/no-go recommendation based on your pre-defined risk thresholds

### Risk Assessment (`/risk-assessment`)
- Severity x likelihood risk matrix
- Cross-clause risk interaction analysis
- Mitigation strategies with suggested contract language

### Clause Extraction (`/clause-extraction`)
- Extracts every significant clause
- Plain English explanations
- Flags missing standard clauses

### Compliance Check (`/compliance-check`)
- Regulatory compliance verification (GDPR, CCPA, HIPAA, etc.)
- Gap analysis and remediation plan

### Document Summarization (`/summarize`)
- Key terms, obligations, financial terms
- Executive brief for busy stakeholders

### Plain Language Translation (`/plain-language`)
- Converts legal jargon to everyday English
- Highlights "gotcha" provisions

### Document Comparison (`/compare`)
- Redline analysis between two document versions
- Material changes, additions, and deletions

### Document Drafting (`/draft`)
- Generate NDAs, MSAs, employment agreements, and more
- Supports jurisdiction and party specifications

### Legal Q&A Chat (`/chat`)
- Multi-turn conversation with context retention
- Contract interpretation, regulatory questions, strategy discussions

---

## Prerequisites

- **Node.js** v18+
- **Azure OpenAI** resource (via Azure AI Foundry)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `AZURE_OPENAI_API_KEY` | API key from Azure AI Foundry |
| `AZURE_OPENAI_ENDPOINT` | Endpoint URL (e.g., `https://my-resource.openai.azure.com`) |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | Model deployment name (e.g., `gpt-4o`) |

## Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd legal-ai-platform

# 2. Copy env file and fill in your Azure credentials
cp .env.example .env

# 3. Install dependencies
npm run install:all

# 4. Build the frontend
npm run build:frontend

# 5. Start the server (serves both API and frontend)
npm start
```

The app will be available at `http://localhost:5000`.

### Development Mode

Run backend and frontend separately:

```bash
# Terminal 1 — Backend (port 5000)
npm run start:backend

# Terminal 2 — Frontend dev server (port 3000, proxies API to 5000)
npm run start:frontend
```

## Azure AI Foundry Setup

1. Go to [Azure AI Foundry](https://ai.azure.com)
2. Create or select an Azure OpenAI resource
3. Deploy a model (e.g., `gpt-4o`, `gpt-4o-mini`)
4. Copy the **API Key**, **Endpoint**, and **Deployment Name** to your `.env` file

## Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: React, React Router, React Markdown
- **AI**: Azure OpenAI (REST API)
- **File Parsing**: pdf-parse
