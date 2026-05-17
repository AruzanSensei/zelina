(() => {
    // Audio Manager for Raja Kecil 3D
    // Uses Web Audio API to generate placeholder sounds

    const AudioManager = {
        context: null,
        masterGain: null,
        musicGain: null,
        sfxGain: null,
        currentMusic: null,
        initialized: false,
        muted: false,

        // Sound effect buffers
        sounds: {},

        // Initialize audio context (must be called after user interaction)
        init() {
            if (this.initialized) return;

            try {
                this.context = new (window.AudioContext || window.webkitAudioContext)();

                // Create gain nodes for volume control
                this.masterGain = this.context.createGain();
                this.masterGain.connect(this.context.destination);

                this.musicGain = this.context.createGain();
                this.musicGain.connect(this.masterGain);
                this.musicGain.gain.value = 0.3; // Music quieter than SFX

                this.sfxGain = this.context.createGain();
                this.sfxGain.connect(this.masterGain);
                this.sfxGain.gain.value = 0.5;

                this.initialized = true;
                console.log('Audio initialized');
            } catch (err) {
                console.warn('Audio initialization failed:', err);
            }
        },

        // Resume context if suspended (browser autoplay policy)
        resume() {
            if (this.context && this.context.state === 'suspended') {
                this.context.resume();
            }
        },

        // Generate a simple tone
        createTone(frequency, duration, type = 'sine') {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.type = type;
            osc.frequency.value = frequency;
            osc.connect(gain);

            return { osc, gain };
        },

        // Generate white noise
        createNoise(duration) {
            const bufferSize = this.context.sampleRate * duration;
            const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.context.createBufferSource();
            noise.buffer = buffer;
            return noise;
        },

        // Sound Effects
        playEat() {
            if (!this.initialized || this.muted) return;
            this.resume();

            const now = this.context.currentTime;

            // Chewing sound (low frequency clicks)
            for (let i = 0; i < 3; i++) {
                const { osc, gain } = this.createTone(120 + Math.random() * 40, 0.1, 'square');
                gain.connect(this.sfxGain);
                gain.gain.setValueAtTime(0.3, now + i * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.1);

                osc.start(now + i * 0.15);
                osc.stop(now + i * 0.15 + 0.1);
            }
        },

        playDrink() {
            if (!this.initialized || this.muted) return;
            this.resume();

            const now = this.context.currentTime;

            // Water lapping sound (filtered noise)
            const noise = this.createNoise(0.8);
            const filter = this.context.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 800;

            const gain = this.context.createGain();
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

            noise.start(now);
            noise.stop(now + 0.8);
        },

        playSleep() {
            if (!this.initialized || this.muted) return;
            this.resume();

            const now = this.context.currentTime;

            // Soft breathing sound
            const { osc, gain } = this.createTone(80, 1.5, 'sine');
            gain.connect(this.sfxGain);

            // Gentle fade in and out
            gain.gain.setValueAtTime(0.01, now);
            gain.gain.exponentialRampToValueAtTime(0.15, now + 0.5);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

            osc.start(now);
            osc.stop(now + 1.5);
        },

        playAttack() {
            if (!this.initialized || this.muted) return;
            this.resume();

            const now = this.context.currentTime;

            // Roar sound (descending frequency sweep)
            const { osc, gain } = this.createTone(400, 0.5, 'sawtooth');
            gain.connect(this.sfxGain);

            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(150, now + 0.5);

            gain.gain.setValueAtTime(0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

            osc.start(now);
            osc.stop(now + 0.5);
        },

        playHurt() {
            if (!this.initialized || this.muted) return;
            this.resume();

            const now = this.context.currentTime;

            // Pain sound (sharp high pitch)
            const { osc, gain } = this.createTone(600, 0.2, 'square');
            gain.connect(this.sfxGain);

            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

            osc.start(now);
            osc.stop(now + 0.2);
        },

        playLevelUp() {
            if (!this.initialized || this.muted) return;
            this.resume();

            const now = this.context.currentTime;

            // Triumphant fanfare (ascending notes)
            const notes = [262, 330, 392, 523]; // C, E, G, C (major chord)

            notes.forEach((freq, i) => {
                const { osc, gain } = this.createTone(freq, 0.3, 'triangle');
                gain.connect(this.sfxGain);

                gain.gain.setValueAtTime(0.3, now + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);

                osc.start(now + i * 0.1);
                osc.stop(now + i * 0.1 + 0.3);
            });
        },

        playFootstep(running = false) {
            if (!this.initialized || this.muted) return;
            this.resume();

            const now = this.context.currentTime;

            // Footstep (short low thud)
            const { osc, gain } = this.createTone(60 + Math.random() * 20, 0.08, 'sine');
            gain.connect(this.sfxGain);

            gain.gain.setValueAtTime(running ? 0.15 : 0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

            osc.start(now);
            osc.stop(now + 0.08);
        },

        // Background Music System
        playMusic(type = 'day') {
            if (!this.initialized || this.muted) return;
            this.resume();

            // Stop current music
            if (this.currentMusic) {
                this.stopMusic();
            }

            const now = this.context.currentTime;

            // Create ambient music based on type
            if (type === 'day') {
                this.playDayMusic(now);
            } else if (type === 'night') {
                this.playNightMusic(now);
            } else if (type === 'chase') {
                this.playChaseMusic(now);
            }
        },

        playDayMusic(startTime) {
            // Peaceful ambient day music (soft drone)
            const osc1 = this.context.createOscillator();
            const osc2 = this.context.createOscillator();
            const gain = this.context.createGain();

            osc1.type = 'sine';
            osc1.frequency.value = 220; // A3
            osc2.type = 'sine';
            osc2.frequency.value = 330; // E4

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(this.musicGain);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(1, startTime + 2); // Fade in

            osc1.start(startTime);
            osc2.start(startTime);

            this.currentMusic = { osc1, osc2, gain, type: 'day' };
        },

        playNightMusic(startTime) {
            // Mysterious night music (lower, darker tones)
            const osc1 = this.context.createOscillator();
            const osc2 = this.context.createOscillator();
            const gain = this.context.createGain();

            osc1.type = 'sine';
            osc1.frequency.value = 110; // A2
            osc2.type = 'triangle';
            osc2.frequency.value = 165; // E3

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(this.musicGain);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(1, startTime + 2);

            osc1.start(startTime);
            osc2.start(startTime);

            this.currentMusic = { osc1, osc2, gain, type: 'night' };
        },

        playChaseMusic(startTime) {
            // Intense chase music (faster, more dramatic)
            const osc1 = this.context.createOscillator();
            const osc2 = this.context.createOscillator();
            const osc3 = this.context.createOscillator();
            const gain = this.context.createGain();

            osc1.type = 'sawtooth';
            osc1.frequency.value = 220;
            osc2.type = 'sawtooth';
            osc2.frequency.value = 277;
            osc3.type = 'square';
            osc3.frequency.value = 165;

            osc1.connect(gain);
            osc2.connect(gain);
            osc3.connect(gain);
            gain.connect(this.musicGain);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(1, startTime + 1);

            osc1.start(startTime);
            osc2.start(startTime);
            osc3.start(startTime);

            this.currentMusic = { osc1, osc2, osc3, gain, type: 'chase' };
        },

        stopMusic() {
            if (!this.currentMusic) return;

            const now = this.context.currentTime;
            const music = this.currentMusic;

            // Fade out
            music.gain.gain.setValueAtTime(music.gain.gain.value, now);
            music.gain.gain.linearRampToValueAtTime(0, now + 1);

            // Stop all oscillators
            setTimeout(() => {
                if (music.osc1) music.osc1.stop();
                if (music.osc2) music.osc2.stop();
                if (music.osc3) music.osc3.stop();
            }, 1100);

            this.currentMusic = null;
        },

        toggleMute() {
            this.muted = !this.muted;
            if (this.muted) {
                this.masterGain.gain.value = 0;
            } else {
                this.masterGain.gain.value = 1;
            }
            return this.muted;
        },

        setVolume(volume) {
            if (this.masterGain) {
                this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
            }
        }
    };

    Game.audio = AudioManager;
})();
