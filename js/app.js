/**
 * app.js
 * Main application controller.
 * Wires together the UI, VoiceController, and Groq API.
 */

// ── State ─────────────────────────────────────────────────────────────────────
let currentQuestion = '';
let currentAnswer = '';
const apiKey = CONFIG.GROQ_API_KEY;

// ── DOM refs ──────────────────────────────────────────────────────────────────
const questionDisplay = document.getElementById('questionDisplay');
const textInput      = document.getElementById('textInput');
const micBtn         = document.getElementById('micBtn');
const askBtn         = document.getElementById('askBtn');
const answerSection  = document.getElementById('answerSection');
const answerText     = document.getElementById('answerText');
const speakBtn       = document.getElementById('speakBtn');
const statusBar      = document.getElementById('statusBar');
const exampleChips   = document.getElementById('exampleChips');

// ── Init ──────────────────────────────────────────────────────────────────────
if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY_HERE') {
  setStatus('Add your Groq API key to js/config.js to get started.', 'error');
}

// ── Example chips ─────────────────────────────────────────────────────────────
exampleChips.addEventListener('click', (e) => {
  if (e.target.classList.contains('chip')) {
    setQuestion(e.target.textContent);
  }
});

// ── Text input: submit on Enter ───────────────────────────────────────────────
textInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleAsk();
});

// ── Ask button ────────────────────────────────────────────────────────────────
askBtn.addEventListener('click', handleAsk);

// ── Speak button ──────────────────────────────────────────────────────────────
speakBtn.addEventListener('click', () => {
  VoiceController.speak(currentAnswer);
});

// ── Mic button ────────────────────────────────────────────────────────────────
micBtn.addEventListener('click', () => {
  if (!VoiceController.isSupported()) {
    setStatus('Speech recognition requires Chrome or Edge.', 'error');
    return;
  }

  VoiceController.startListening({
    onStart() {
      micBtn.classList.add('recording');
      micBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="8"/>
        </svg>
        Listening…`;
      setQuestionDisplay('<em style="color:#666">Listening…</em>', true);
      questionDisplay.classList.add('listening');
      setStatus('');
    },
    onInterim(text) {
      setQuestionDisplay(text, false);
    },
    onFinal(text) {
      currentQuestion = text;
      textInput.value = text;
      setQuestionDisplay(text, false);
    },
    onEnd() {
      resetMicButton();
      questionDisplay.classList.remove('listening');
      if (currentQuestion) handleAsk();
    },
    onError(err) {
      resetMicButton();
      setStatus(`Mic error: ${err}`, 'error');
    },
  });
});

// ── Core ask flow ─────────────────────────────────────────────────────────────
async function handleAsk() {
  const typed = textInput.value.trim();
  if (typed) currentQuestion = typed;
  if (!currentQuestion) return setStatus('Please enter or speak a question first.', 'error');
  if (!apiKey) return setStatus('Please save your Groq API key first.', 'error');

  setQuestionDisplay(currentQuestion, false);
  showLoading();
  askBtn.disabled = true;
  setStatus('Thinking…');

  try {
    currentAnswer = await askGroq(currentQuestion, apiKey);
    showAnswer(currentAnswer);
    VoiceController.speak(currentAnswer);
    setStatus('');
  } catch (err) {
    showAnswer(`Error: ${err.message}`);
    setStatus('Something went wrong. Check your API key and try again.', 'error');
  } finally {
    askBtn.disabled = false;
  }
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function setQuestion(q) {
  currentQuestion = q;
  textInput.value = q;
  setQuestionDisplay(q, false);
}

function setQuestionDisplay(html, isHTML) {
  if (isHTML) {
    questionDisplay.innerHTML = html;
  } else {
    questionDisplay.textContent = html;
  }
}

function setStatus(msg, type = '') {
  statusBar.textContent = msg;
  statusBar.className = 'status-bar' + (type ? ` ${type}` : '');
}

function showLoading() {
  answerSection.classList.add('visible');
  answerText.innerHTML = `
    <div class="loading-dots">
      <span></span><span></span><span></span>
    </div>`;
}

function showAnswer(text) {
  answerSection.classList.add('visible');
  answerText.textContent = text;
}

function resetMicButton() {
  micBtn.classList.remove('recording');
  micBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" y1="19" x2="12" y2="23"/>
      <line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
    Speak`;
}