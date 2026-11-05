// Web Speech API Voice Narrator for Space Legacy
export const SpeechNarrator = {
  speak(text, lang = 'en', onEnd = null) {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported by this browser.');
      return false;
    }

    window.speechSynthesis.cancel(); // Stop any previous speech

    const cleanText = text.replace(/[*_#`]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Pick appropriate voice
    const voices = window.speechSynthesis.getVoices();
    if (lang === 'ar') {
      utterance.lang = 'ar-SA';
      const arVoice = voices.find((v) => v.lang.startsWith('ar'));
      if (arVoice) utterance.voice = arVoice;
      utterance.rate = 0.95;
    } else {
      utterance.lang = 'en-US';
      const enVoice = voices.find(
        (v) => (v.name.includes('Natural') || v.name.includes('Guy') || v.name.includes('Google')) && v.lang.startsWith('en')
      );
      if (enVoice) utterance.voice = enVoice;
      utterance.rate = 1.0;
    }

    utterance.pitch = 1.0;

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  },

  stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },

  isSpeaking() {
    return 'speechSynthesis' in window ? window.speechSynthesis.speaking : false;
  },
};
