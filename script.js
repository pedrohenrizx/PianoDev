/* JavaScript - Lógica de Áudio e Interatividade */
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const volumeControl = document.getElementById('volumeControl');
        const noteDisplay = document.getElementById('currentNote');
        const keys = document.querySelectorAll('#piano > div');

        const frequencies = {
            'C4': 261.63, 'Db4': 277.18, 'D4': 293.66, 'Eb4': 311.13,
            'E4': 329.63, 'F4': 349.23, 'Gb4': 369.99, 'G4': 392.00,
            'Ab4': 415.30, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88, 'C5': 523.25
        };

        const activeOscillators = {};

        function playTone(note) {
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            if (activeOscillators[note]) return;

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'triangle'; // Onda mais suave que a quadrada, mais rica que a senoidal
            osc.frequency.setValueAtTime(frequencies[note], audioCtx.currentTime);

            gain.gain.setValueAtTime(volumeControl.value, audioCtx.currentTime);
            // Envelope de decaimento para simular o som do piano morrendo
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 1.2);

            activeOscillators[note] = { osc, gain };
            noteDisplay.innerText = note;
            
            setTimeout(() => {
                delete activeOscillators[note];
            }, 1200);
        }

        const handleAction = (el) => {
            const note = el.getAttribute('data-note');
            el.classList.add('active');
            playTone(note);
            setTimeout(() => el.classList.remove('active'), 150);
        };

        // Eventos de Mouse
        keys.forEach(key => {
            key.addEventListener('mousedown', () => handleAction(key));
        });

        // Eventos de Teclado
        window.addEventListener('keydown', (e) => {
            if (e.repeat) return; // Evita repetição contínua da nota
            const key = e.key.toLowerCase();
            const target = document.querySelector(`[data-key="${key}"]`);
            if (target) handleAction(target);
        });
