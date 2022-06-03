/*
	setup sound and play sfx
*/

import * as Tone from 'tone';
import { choice, randInt } from './Cool';

export default function Sound() {
	
	let soundStarted = false;
	let soundPaused = false;

	let soundOnBtn = document.getElementById('soundOn');
	let soundOffBtn = document.getElementById('soundOff');
	soundOnBtn.addEventListener('click', startSound);
	soundOffBtn.addEventListener('click', pauseSound);

	let sfxSynth, joinSynth;

	function startSound() {
		if (!soundStarted) initSound();
	}

	function pauseSound() {
		soundPaused = true;
	}

	async function initSound() {
		await Tone.start();
		Tone.Transport.bpm.value = 115;
		Tone.Transport.start()

		console.log('sound started');
		soundStarted = true;

		sfxSynth = new Tone.MembraneSynth({
			pitchDecay: 0.008,
			octaves: 2,
			envelope: {
				attack: 0.01,
				decay: 0.5,
				sustain: 0,
			}
		}).toDestination();
		sfxSynth.triggerAttackRelease("E3", "4n", '+0.1', Math.random() * 0.5 + 5);

		joinSynth = new Tone.AMSynth({
			envelope: {
				attack: 1,
			},
			oscillator: {
				count: 2,
			}
		}).toDestination();
		joinSynth.triggerAttackRelease("C4", "2n");
	}

	this.playSFX = function(type) {
		if (!soundStarted || soundPaused) return;

		if (type === 'newPart') {
			const note = choice("C3", "D3", "E3", "F3");
			sfxSynth.triggerAttackRelease(note, '4n', undefined, Math.random() * 0.5 + 5);
		}

		if (type === 'grabPart') {
			const note = choice('G3', 'A4', 'B4', 'C5');
			sfxSynth.triggerAttackRelease(note, '4n', undefined, Math.random() * 0.5 + 5);
		}

		if (type === 'releasePart') {
			const note = choice('B3', 'A3', 'G2', 'F2');
			sfxSynth.triggerAttackRelease(note, '4n', undefined, Math.random() * 0.5 + 5);
		}

		if (type === 'joinBodiesStart') {
			const note = choice("C3", "D3", "E3", "F3");
			joinSynth.triggerAttack(note, undefined, Math.random() * 0.5 + 5);
		}

		if (type === 'joinBodiesEnd') {
			joinSynth.triggerRelease('4n');
		}
	}

	this.start = function() {
		startSound();
	};

}