/**
 * api.js
 * Handles all communication with the OpenRouter API.
 * Uses mistralai/mistral-7b-instruct — free, large context window.
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'mistralai/mistral-7b-instruct:free';

/**
 * Builds the system prompt grounded in the wine dataset.
 * @returns {string}
 */
function buildSystemPrompt() {
  const inventory = WINES.map(w =>
    `${w.name} | ${w.producer} | ${w.region}, ${w.country} | ${w.color} | $${w.price} | score:${w.score}${w.varietal ? ' | ' + w.varietal : ''}${w.vintage ? ' | ' + w.vintage : ''}`
  ).join('\n');

  return `You are a knowledgeable wine sommelier assistant for a wine shop. Answer customer questions based ONLY on the inventory below. Do not invent wines, prices, or scores. Be conversational and concise. When recommending wines mention the name, producer, price, and score.

WINE INVENTORY:
${inventory}`;
}

/**
 * Sends a question to OpenRouter and returns the answer.
 * @param {string} question
 * @param {string} apiKey - OpenRouter API key
 * @returns {Promise<string>}
 */
async function askGroq(question, apiKey) {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://vanshikap17.github.io/wine-explorer',
      'X-Title': 'Voice Wine Explorer',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: question },
      ],
      max_tokens: 600,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}