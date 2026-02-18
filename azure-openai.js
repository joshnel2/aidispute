/**
 * Azure OpenAI client wrapper.
 *
 * Uses the REST API directly (no SDK dependency issues) with:
 *   AZURE_OPENAI_ENDPOINT          – e.g. https://my-resource.openai.azure.com
 *   AZURE_OPENAI_DEPLOYMENT_NAME   – e.g. gpt-5.2-chat
 *   AZURE_OPENAI_API_KEY           – your key from Azure AI Foundry
 */

const API_VERSION = "2025-01-01-preview";

function isUnsupportedParameterError(errorBody, parameterName) {
  const normalized = errorBody.toLowerCase();
  return (
    normalized.includes(parameterName.toLowerCase()) &&
    (normalized.includes("unsupported parameter") ||
      normalized.includes("not supported") ||
      normalized.includes("does not support"))
  );
}

async function sendChatCompletionRequest(url, apiKey, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      errorBody: await response.text(),
    };
  }

  return {
    ok: true,
    data: await response.json(),
  };
}

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
  let requestResult = await sendChatCompletionRequest(url, apiKey, body);

  if (!requestResult.ok) {
    const retryBody = { ...body };
    let shouldRetry = false;

    if (isUnsupportedParameterError(requestResult.errorBody, "temperature")) {
      delete retryBody.temperature;
      shouldRetry = true;
    }
    if (isUnsupportedParameterError(requestResult.errorBody, "top_p")) {
      delete retryBody.top_p;
      shouldRetry = true;
    }

    if (shouldRetry) {
      requestResult = await sendChatCompletionRequest(url, apiKey, retryBody);
    }
  }

  if (!requestResult.ok) {
    throw new Error(
      `Azure OpenAI API error (${requestResult.status}): ${requestResult.errorBody}`
    );
  }

  const data = requestResult.data;

  if (!data.choices || data.choices.length === 0) {
    throw new Error("Azure OpenAI returned no choices");
  }

  return data.choices[0].message.content;
}

module.exports = { azureChat };
