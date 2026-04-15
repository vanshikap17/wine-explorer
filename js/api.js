/**
 * api.js
 * Handles all communication with the Google Gemini API.
 * Uses gemini-2.0-flash — free tier, large context window, no token issues.
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Builds the system prompt grounded in the wine dataset.
 * @returns {string}
 */
function buildSystemPrompt() {
  const inventory = WINES.map(w => ({
    name: w.name,
    producer: w.producer,
    region: w.region,
    country: w.country,
    appellation: w.appellation || null,
    varietal: w.varietal || null,
    vintage: w.vintage || null,
    color: w.color,
    price: w.price,
    abv: w.abv || null,
    score: w.score,
    reviewer: w.reviewer,
    volume_ml: w.volume,
  }));

  return `You are a knowledgeable wine sommelier assistant for a wine shop. Answer customer questions based ONLY on this inventory. Do not invent wines, prices, or scores not in the data. Be conversational and concise. When recommending wines mention the name, producer, price, and score.

WINE INVENTORY (${WINES.length} bottles):
${JSON.stringify(inventory)}`;
}

/**
 * Sends a question to the Gemini API and returns the answer.
 * @param {string} question
 * @param {string} apiKey - Google Gemini API key
 * @returns {Promise<string>}
 */
async function askGroq(question, apiKey) {
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: buildSystemPrompt() }]
      },
      contents: [
        { role: 'user', parts: [{ text: question }] }
      ],
      generationConfig: {
        maxOutputTokens: 600,
        temperature: 0.3,
      }
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text.trim();
}