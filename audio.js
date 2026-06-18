// Synth audio effects engine using browser Web Audio API
class AudioEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = window.localStorage.getItem('idle_bank_muted') === 'true';
        this.volume = 0.15; // Safe comfortable level
    }

    init() {
        if (this.ctx) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        } catch (e) {
            console.warn("Web Audio API is not supported in this browser.", e);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        window.localStorage.setItem('idle_bank_muted', this.isMuted);
        return this.isMuted;
    }

    ensureRunning(callback) {
        if (!this.ctx) this.init();
        if (this.isMuted || !this.ctx) return;

        if (this.ctx.state === 'suspended') {
            this.ctx.resume()
                .then(() => {
                    if (this.ctx.state === 'running') {
                        callback();
                    }
                })
                .catch(e => console.warn("AudioContext resume failed:", e));
        } else {
            callback();
        }
    }

    suspend() {
        if (this.ctx && this.ctx.state === 'running') {
            this.ctx.suspend().catch(e => console.warn("AudioContext suspend failed:", e));
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(e => console.warn("AudioContext resume failed:", e));
        }
    }

    createGainNode(duration, startVal = this.volume) {
        if (!this.ctx) this.init();
        if (this.isMuted || !this.ctx) return null;

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(startVal, this.ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        gainNode.connect(this.ctx.destination);
        return gainNode;
    }

    playClick() {
        this.ensureRunning(() => {
            const gain = this.createGainNode(0.1, this.volume * 0.5);
            if (!gain) return;

            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.1);
            
            osc.connect(gain);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.1);

            osc.onended = () => {
                osc.disconnect();
                gain.disconnect();
            };
        });
    }

    playCoin() {
        this.ensureRunning(() => {
            const gain = this.createGainNode(0.3, this.volume);
            if (!gain) return;

            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5
            
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1318.51, this.ctx.currentTime); // E6
            
            osc1.connect(gain);
            osc2.connect(gain);
            
            osc1.start();
            osc2.start();
            
            osc1.stop(this.ctx.currentTime + 0.3);
            osc2.stop(this.ctx.currentTime + 0.3);

            let endedCount = 0;
            const cleanup = () => {
                endedCount++;
                if (endedCount === 2) {
                    osc1.disconnect();
                    osc2.disconnect();
                    gain.disconnect();
                }
            };
            osc1.onended = cleanup;
            osc2.onended = cleanup;
        });
    }

    playChaChing() {
        this.ensureRunning(() => {
            const gain = this.createGainNode(0.6, this.volume * 1.5);
            if (!gain) return;

            const now = this.ctx.currentTime;

            // Part 1: Cash register drawer slide (noise buffer)
            const bufferSize = this.ctx.sampleRate * 0.15; // 0.15 seconds
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noiseNode = this.ctx.createBufferSource();
            noiseNode.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1000;

            noiseNode.connect(filter);
            filter.connect(gain);

            // Part 2: Bell ring (high-pitched bell oscillators)
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();

            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(1500, now);
            osc1.frequency.exponentialRampToValueAtTime(1600, now + 0.4);

            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1900, now);
            osc2.frequency.exponentialRampToValueAtTime(2000, now + 0.4);

            osc1.connect(gain);
            osc2.connect(gain);

            // Trigger noise
            noiseNode.start(now);
            noiseNode.stop(now + 0.15);

            // Trigger bells slightly staggered
            osc1.start(now + 0.05);
            osc1.stop(now + 0.5);
            
            osc2.start(now + 0.08);
            osc2.stop(now + 0.6);

            let endedCount = 0;
            const cleanup = () => {
                endedCount++;
                if (endedCount === 3) {
                    noiseNode.disconnect();
                    filter.disconnect();
                    osc1.disconnect();
                    osc2.disconnect();
                    gain.disconnect();
                }
            };
            noiseNode.onended = cleanup;
            osc1.onended = cleanup;
            osc2.onended = cleanup;
        });
    }

    playUnlock() {
        this.ensureRunning(() => {
            const gain = this.createGainNode(0.8, this.volume * 1.2);
            if (!gain) return;

            const now = this.ctx.currentTime;
            const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
            
            let oscsEnded = 0;
            const totalOscs = notes.length;

            notes.forEach((freq, index) => {
                const osc = this.ctx.createOscillator();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + index * 0.08);
                
                // Connect to an individual soft decay gain for each note to blend them
                const noteGain = this.ctx.createGain();
                noteGain.gain.setValueAtTime(this.volume * 0.8, now + index * 0.08);
                noteGain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.4);
                
                osc.connect(noteGain);
                noteGain.connect(this.ctx.destination);
                
                osc.start(now + index * 0.08);
                osc.stop(now + index * 0.08 + 0.45);

                osc.onended = () => {
                    osc.disconnect();
                    noteGain.disconnect();
                    oscsEnded++;
                    if (oscsEnded === totalOscs) {
                        gain.disconnect();
                    }
                };
            });
        });
    }
}

// Global sound object
const gameAudio = new AudioEngine();
window.gameAudio = gameAudio;
