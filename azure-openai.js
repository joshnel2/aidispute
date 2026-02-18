/**
 * Azure OpenAI client wrapper.
 *
 * Uses the REST API directly (no SDK dependency issues) with:
 *   AZURE_OPENAI_ENDPOINT          – e.g. https://my-resource.openai.azure.com
 *   AZURE_OPENAI_DEPLOYMENT_NAME   – e.g. gpt-5.2-chat
 *   AZURE_OPENAI_API_KEY           – your key from Azure AI Foundry
 */

const API_VERSION = "2025-01-01-preview";

function getConfig() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
  const apiKey = process.env.AZURE_OPENAI_API_KEY;

  if (!endpoint || !deploymentName || !apiKey) {
    throw new Error(
      "Missing Azure OpenAI configuration. Please set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT_NAME, and AZURE_OPENAI_API_KEY environment variables."
    );
  }

  return { endpoint: endpoint.replace(/\/+$/, ""), deploymentName, apiKey };
}

/**
 * Send a chat completion request to Azure OpenAI.
 *
 * @param {string} systemPrompt - The system message.
 * @param {string|null} userMessage - A single user message (for one-shot calls).
 * @param {Array|null} messages - Full message history (for multi-turn chat).
 * @returns {string} The assistant's reply.
 */
async function azureChat(systemPrompt, userMessage, messages = null) {
  const { endpoint, deploymentName, apiKey } = getConfig();

  const url = `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${API_VERSION}`;

  const chatMessages = [{ role: "system", content: systemPrompt }];

  if (messages && messages.length > 0) {
    chatMessages.push(...messages);
  } else if (userMessage) {
    chatMessages.push({ role: "user", content: userMessage });
  }

  const body = {
    messages: chatMessages,
    max_completion_tokens: 4096,
  };

  // Some Azure OpenAI models (e.g. o-series reasoning models) only accept the
  // default temperature (1) and do not support top_p.  Set
  // AZURE_OPENAI_SUPPORTS_TEMPERATURE=true if your deployment allows these.
  if (process.env.AZURE_OPENAI_SUPPORTS_TEMPERATURE === "true") {
    body.temperature = parseFloat(process.env.AZURE_OPENAI_TEMPERATURE || "0.3");
    body.top_p = parseFloat(process.env.AZURE_OPENAI_TOP_P || "0.95");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Azure OpenAI API error (${response.status}): ${errorBody}`
    );
  }

  const data = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error("Azure OpenAI returned no choices");
  }

  return data.choices[0].message.content;
}

module.exports = { azureChat };
