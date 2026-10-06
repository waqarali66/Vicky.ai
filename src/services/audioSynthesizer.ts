// Web Audio API cinematic tone generator & SpeechSynthesis voiceover player

class AudioDirector {
  private ctx: AudioContext | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private gainNode: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playCinematicCue(style: string) {
    this.stopTone();
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.01, now);
      this.gainNode.gain.exponentialRampToValueAtTime(0.18, now + 1.2);
      this.gainNode.gain.exponentialRampToValueAtTime(0.01, now + 5.5);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.exponentialRampToValueAtTime(style.includes('cyber') ? 1400 : 750, now + 2.5);

      this.gainNode.connect(filter);
      filter.connect(this.ctx.destination);

      // Root chord frequencies
      let chord = [65.41, 98.00, 130.81, 196.00]; // C minor / cinematic deep
      if (style.includes('3d')) {
        chord = [130.81, 164.81, 196.00, 246.94]; // C major 7 whimsical
      } else if (style.includes('cyber')) {
        chord = [55.00, 110.00, 138.59, 164.81]; // A minor / darksynth
      }

      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        osc.type = idx === 0 ? 'sine' : style.includes('cyber') ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        // Subtle detune for lush cinematic width
        osc.detune.setValueAtTime((idx - 1.5) * 6, now);

        if (this.gainNode) {
          osc.connect(this.gainNode);
        }
        osc.start(now);
        osc.stop(now + 6.0);
        this.activeOscillators.push(osc);
      });
    } catch (e) {
      console.warn('Audio tone error:', e);
    }
  }

  speakVoiceover(text: string) {
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      // Clean tags like <breath> or |yeah| for TTS
      const cleanText = text.replace(/<[^>]*>/g, '').replace(/\|[^|]*\|/g, '').trim();
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.92; // Deliberate cinematic pace
      utterance.pitch = 0.95; // Slightly deeper, cinematic tone
      utterance.volume = 0.9;

      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Daniel') || v.name.includes('Arthur')));
      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Voiceover TTS error:', e);
    }
  }

  stopTone() {
    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    this.activeOscillators = [];
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch (e) {}
      this.gainNode = null;
    }
  }

  stopAll() {
    this.stopTone();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioDirector = new AudioDirector();
