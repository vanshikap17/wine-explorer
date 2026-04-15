/**
 * voice.js
 * Handles all voice I/O:
 *   - Speech recognition (mic → text) via the Web Speech API
 *   - Speech synthesis (text → audio) via SpeechSynthesis
 *
 * Designed for Chrome/Edge. Firefox does not support SpeechRecognition.
 */

const VoiceController = (() => {
  let recognition = null;
  let isRecording = false;

  /**
   * Returns true if the browser supports speech recognition.
   */
  function isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * Starts listening for speech input.
   * @param {object} callbacks
   * @param {function} callbacks.onStart      - called when mic opens
   * @param {function} callbacks.onInterim    - called with interim transcript string
   * @param {function} callbacks.onFinal      - called with final transcript string
   * @param {function} callbacks.onEnd        - called when recognition ends
   * @param {function} callbacks.onError      - called with error message string
   */
  function startListening({ onStart, onInterim, onFinal, onEnd, onError } = {}) {
    if (!isSupported()) {
      onError?.('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isRecording) return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isRecording = true;
      onStart?.();
    };

    recognition.onresult = (event) => {
      let interimText = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interimText += transcript;
        }
      }
      if (interimText) onInterim?.(interimText);
      if (finalText)   onFinal?.(finalText.trim());
    };

    recognition.onerror = (event) => {
      onError?.(event.error);
      stopListening();
    };

    recognition.onend = () => {
      isRecording = false;
      onEnd?.();
    };

    recognition.start();
  }

  /**
   * Stops the active recognition session.
   */
  function stopListening() {
    if (recognition) {
      recognition.stop();
      recognition = null;
    }
    isRecording = false;
  }

  /**
   * Speaks the given text aloud using the browser's speech synthesis engine.
   * Cancels any currently playing speech first.
   * @param {string} text
   * @param {object} options
   * @param {number} [options.rate=1.0]
   * @param {number} [options.pitch=1.0]
   */
  function speak(text, { rate = 1.0, pitch = 1.0 } = {}) {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Stops any currently playing speech synthesis.
   */
  function stopSpeaking() {
    window.speechSynthesis.cancel();
  }

  return { isSupported, startListening, stopListening, speak, stopSpeaking };
})();