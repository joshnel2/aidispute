# Legal AI Platform

AI-powered legal document analysis, review, and drafting — built on **Azure OpenAI**.

Replicates the full feature set of the Claude Cowork Legal Plugin, using Azure AI Foundry as the AI backend. Designed for **Azure App Service** deployment.

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

## Azure App Service Deployment

This project is structured for one-click Azure Web App deployment:

### Environment Variables (App Settings)

| Variable | Description |
|----------|-------------|
| `AZURE_OPENAI_API_KEY` | API key from Azure AI Foundry |
| `AZURE_OPENAI_ENDPOINT` | Endpoint URL (e.g., `https://my-resource.openai.azure.com`) |
| `AZURE_OPENAI_DEPLOYMENT_NAME` | Model deployment name (e.g., `gpt-4o`, `gpt-4.1`) |

### Deploy to Azure

1. Create a **Node.js** App Service (Node 18+ LTS)
2. Set the three environment variables above in **Configuration > Application settings**
3. Deploy via:
   - **GitHub Actions** (connect your repo)
   - **Azure CLI**: `az webapp up --name your-app-name --runtime "NODE:18-lts"`
   - **VS Code Azure extension**

Azure will automatically:
- Run `npm install` (installs backend deps)
- Run `postinstall` script (installs frontend deps & builds React)
- Start the server via `npm start`

The `web.config` is included for IIS/iisnode integration.

---

## Local Development

### Prerequisites
- Node.js v18+
- Azure OpenAI resource (via Azure AI Foundry)

### Setup

```bash
# Clone the repo
git clone <repo-url>
cd legal-ai-platform

# Create .env from example
cp .env.example .env
# Edit .env with your Azure OpenAI credentials

# Install all dependencies (root + frontend)
npm install

# Start the server (serves API + built frontend on port 8080)
npm start
```

### Development mode (hot reload)

```bash
# Terminal 1 — Backend (port 8080)
npm run dev:backend

# Terminal 2 — Frontend dev server (port 3000, proxies to 8080)
npm run dev:frontend
```

## Project Structure

```
/
├── server.js              # Express API server
├── azure-openai.js        # Azure OpenAI REST client
├── prompts.js             # System prompts for all tools
├── file-parser.js         # PDF / text file extraction
├── package.json           # Root deps + Azure deploy scripts
├── web.config             # Azure IIS configuration
├── .env.example           # Environment variable template
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js
        ├── index.js
        ├── index.css
        ├── components/    # Shared UI components
        ├── pages/         # Route pages
        └── utils/         # API helpers
```

## Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: React, React Router, React Markdown
- **AI**: Azure OpenAI (REST API)
- **File Parsing**: pdf-parse
- **Deployment**: Azure App Service (Node.js)
