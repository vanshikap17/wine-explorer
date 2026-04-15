# Voice Wine Explorer

A voice-enabled web app that lets users ask natural language questions about a curated wine dataset and receive answers in both text and spoken audio.

Built for the Onki Engineering internship assignment.

## Demo

> "Which are the best-rated wines under $50?"
> "What do you have from Burgundy?"
> "What's the most expensive bottle you carry?"

## Features

- **Voice input** — speak your question directly via the browser microphone
- **Text input** — type instead if you prefer
- **AI answers** — powered by Llama 3.3 70B via Groq, grounded strictly in the provided wine dataset
- **Text-to-speech** — every answer is read aloud automatically
- **No hallucination** — the LLM is instructed to answer only from the dataset and say so if a question can't be answered

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript (no framework) |
| Voice input | Web Speech API (`SpeechRecognition`) |
| Voice output | Web Speech API (`SpeechSynthesis`) |
| LLM | Groq API — `llama-3.3-70b-versatile` |
| Hosting | GitHub Pages |

## Project Structure

```
wine-explorer/
├── index.html        # App shell and markup
├── css/
│   └── style.css     # All styles
├── js/
│   ├── data.js       # Wine inventory dataset (source of truth)
│   ├── api.js        # Groq API integration
│   ├── voice.js      # Speech recognition + synthesis controller
│   └── app.js        # Main UI controller — wires everything together
└── README.md
```

## Getting Started

### Prerequisites

- A modern browser (Chrome or Edge recommended — Firefox does not support `SpeechRecognition`)
- A free [Groq API key](https://console.groq.com)

### Run locally

No build step required. Just open `index.html` in Chrome:

```bash
# Option 1: open directly
open index.html

# Option 2: serve with any static server
npx serve .
# or
python3 -m http.server 3000
```

### Deploy to GitHub Pages

1. Push this folder to a public GitHub repo
2. Go to **Settings → Pages**
3. Set source to **Deploy from a branch → main → / (root)**
4. Your app will be live at `https://<username>.github.io/<repo-name>`

## Usage

1. Paste your Groq API key into the input at the top and click **Save**
2. Click **Speak** and ask a question, or type in the text box and press Enter
3. The app fetches an answer from the LLM and reads it aloud automatically
4. Click **▶ Read aloud** to replay the last answer

## Dataset

The wine inventory (`js/data.js`) contains ~200 bottles sourced from the provided spreadsheet, including fields for:

- Name, producer, region, country, appellation
- Varietal, vintage, color, ABV
- Retail price, bottle volume
- Professional critic score and reviewer

## Design Decisions

**Why vanilla JS?** The app has no build complexity, loads instantly, and is trivial to deploy — the right fit for a single-page voice tool.

**Why Groq?** Free tier, extremely low latency (important for voice UX), and the Llama 3.3 70B model handles wine Q&A accurately with a structured system prompt.

**Why ground the LLM strictly in the dataset?** The assignment explicitly says "do not invent facts." The system prompt enforces this by providing the full inventory as context and instructing the model to acknowledge when a question falls outside the data.

**Why separate JS modules?** `data.js`, `api.js`, `voice.js`, and `app.js` each own one concern, making the codebase easy to read, test, and extend (e.g., swapping Groq for another provider only touches `api.js`).