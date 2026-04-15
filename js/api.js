/**
 * api.js
 * Handles all communication with the Groq API.
 * Uses llama-3.3-70b-versatile as the underlying model.
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant';
const MAX_TOKENS = 600;
const TEMPERATURE = 0.3;

/**
 * Builds the system prompt that grounds the LLM in our wine dataset.
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

  return `You are a knowledgeable wine sommelier assistant for a wine shop. You have access to our complete inventory below and must answer customer questions based ONLY on this dataset. Do not invent wines, prices, or scores not present in the data.

Guidelines:
- Be conversational, helpful, and specific.
- When recommending wines, mention the name, producer, price, and critic score.
- Keep answers concise but complete (2–5 sentences for simple questions, a short ranked list for recommendation questions).
- If a question cannot be answered from the data, say so honestly.
- Do not make up facts.

WINE INVENTORY (${WINES.length} bottles):
${JSON.stringify(inventory, null, 2)}`;
}

/**
 * Sends a question to the Groq API and returns the assistant's reply.
 * @param {string} question - The user's question
 * @param {string} apiKey - The Groq API key
 * @returns {Promise<string>} - The answer text
 */
async function askGroq(question, apiKey) {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: question },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}