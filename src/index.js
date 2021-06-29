import { choice, randInt } from './Cool';
import C from './Constants';
import * as PIXI from 'pixi.js';
import { Engine, Runner, Composite, Bodies, Render, MouseConstraint, Mouse, Events } from 'matter-js';
import KeyboardEvent from './KeyboardEvent';
import PhysicsObject from './PhysicsObject';
import Terrain from './Terrain';
import * as Tone from 'tone';

let showPhysics = false;

let soundOnBtn = document.getElementById('soundOn'),
	soundOffBtn = document.getElementById('soundOff');
let soundStarted = false;
let soundPaused = false;
soundOnBtn.addEventListener('click', startSound);
soundOffBtn.addEventListener('click', pauseSound);

let sfxSynth, joinSynth;

function startSound() {
	if (!soundStarted) initSound();
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

function playSFX(type) {
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

function pauseSound() {
	soundPaused = true;
}

let type = "WebGL";
if(!PIXI.utils.isWebGLSupported()){
	type = "canvas";
}
PIXI.utils.sayHello(type);
let TextureCache = PIXI.utils.TextureCache,
	Sprite = PIXI.Sprite,
	Container = PIXI.Container;

let w = window.innerWidth, h = window.innerHeight;
let renderer = new PIXI.Renderer({ 
	view: document.getElementById('canvas'), 
	width: w, 
	height: h,
	antialias: true,
});
let ticker = new PIXI.Ticker();
let loader = new PIXI.Loader();
let stage = new Container();
let renderStage = new Container();
renderStage.addChild(stage);
document.body.appendChild(renderer.view);
let state, bg;

C.bodyParts.forEach(partName => {
	loader.add(partName, `static/images/${partName}.png`);
});
loader.add('BG', "static/images/bg-test.png")

let terrain = new Terrain(terrainLoaded);
let terrainVerts;
function terrainLoaded(verts) {
	terrainVerts = verts;
	loader.load(setup);
}

const engine = Engine.create();
// engine.gravity.y = 0; // debug
let physicsRenderer = {
	stage: new PIXI.Container(),
	graphics: new PIXI.Graphics(),
};
physicsRenderer.stage.addChild(physicsRenderer.graphics);

if (showPhysics) renderStage.addChild(physicsRenderer.stage);

const objects = [];

const mouseConstraint = MouseConstraint.create(engine, {
	mouse: Mouse.create(renderer.view),
});

Composite.add(engine.world, mouseConstraint);

function addPart(parts, x, y) {
	const bodyPart = new PhysicsObject(parts, TextureCache, x, y, true);
	objects.push(bodyPart);
	Composite.addBody(engine.world, bodyPart.body);
	stage.addChild(bodyPart.sprite);
	playSFX('newPart');
}

function setup() {
	renderer.backgroundColor = 0xebebeb;
	renderer.autoResize = true;

	// const bodyPart = choice(C.bodyParts);
	addPart('head', 300, 100);
	addPart('body', 600, 400);


	bg = new Sprite(TextureCache.BG);
	bg.anchor.x = 0.5;
	bg.x = w / 2;
	stage.addChild(bg);

	let terrainBody = Bodies.fromVertices(960, 620, terrainVerts, {
		isStatic: true,
		render: {
			fillStyle: '#060a19',
			strokeStyle: '#060a19',
			lineWidth: 1
		},
		collisionFilter: {
			category: C.defaultCollisionLayer,
			mask: C.defaultCollisionLayer,
		}
	}, true);
	Composite.addBody(engine.world, terrainBody);
	
	state = play;
	ticker.add(delta => gameLoop(delta));
	ticker.start();
	Runner.run(engine);

	// console.log(Composite.allBodies(engine.world));
}

function gameLoop(delta){
	state(delta);
}

function play(delta) {

	if (rightArrow.isDown) {
		bg.x += 1 * delta;
		ground.position.x += 0.01 * delta;
	}
	if (leftArrow.isDown) {
		bg.x += -1 * delta;
		ground.position.x += -0.01 * delta;
	}

	for (let i = 0; i < objects.length; i++) {
		objects[i].update();
		if (prevMousedBody && overlappedBody) {
			if (objects[i].body) {
				if (objects[i].body.id === prevMousedBody.id) {
					if (objects[i].checkJoin()) joinBodies();
				}
			}
		}
		
	}

	if (showPhysics) renderPhysics();
	renderer.render(renderStage);
}

function renderPhysics() {
	const bodies = Composite.allBodies(engine.world);
	physicsRenderer.graphics.clear();
	physicsRenderer.graphics.lineStyle(2, 0x00dd22);

	for (let i = 0; i < bodies.length; i += 1) {
		const { vertices, parts } = bodies[i];
		physicsRenderer.graphics.moveTo(vertices[0].x, vertices[0].y);
		for (let j = 1; j < vertices.length; j += 1) {
			physicsRenderer.graphics.lineTo(vertices[j].x, vertices[j].y);
		}
		physicsRenderer.graphics.lineTo(vertices[0].x, vertices[0].y);

		for (let k = 0; k < parts.length; k++) {
			const { vertices } = parts[k];

			physicsRenderer.graphics.moveTo(vertices[0].x, vertices[0].y);
			for (let j = 1; j < vertices.length; j += 1) {
				physicsRenderer.graphics.lineTo(vertices[j].x, vertices[j].y);
			}
			physicsRenderer.graphics.lineTo(vertices[0].x, vertices[0].y);

		}
	}
}

function joinBodies() {
	const ids = [prevMousedBody.id, overlappedBody.id];
	const newParts = [...prevMousedBody.gameParent.parts, ...overlappedBody.gameParent.parts];
	const x = (prevMousedBody.position.x + overlappedBody.position.x) / 2;
	const y = (prevMousedBody.position.y + overlappedBody.position.y) / 2;
	for (let i = objects.length - 1; i >= 0; i--) { 
		if (ids.includes(objects[i].body.id)) {
			stage.removeChild(objects[i].sprite);
			Composite.removeBody(engine.world, objects[i].body);
			objects.splice(i, 1);
		}
	}
	addPart(newParts, x, y);
	prevMousedBody = undefined;
	overlappedBody = undefined;
	playSFX('joinBodiesEnd');
}

/* mouse events */
let prevMousedBody;
let overlappedBody;

Events.on(mouseConstraint, 'mousedown', event => {
	if (mouseConstraint.body) {
		prevMousedBody = mouseConstraint.body;
		prevMousedBody.isSensor = true;
		for (let i = 0; i < prevMousedBody.parts.length; i++) {
			prevMousedBody.parts[i].isSensor = true;
		}
		playSFX('grabPart');
	}
});

Events.on(mouseConstraint, 'mouseup', event => {
	if (prevMousedBody) {
		prevMousedBody.isSensor = false;
		for (let i = 0; i < prevMousedBody.parts.length; i++) {
			prevMousedBody.parts[i].isSensor = false;
		}
		playSFX('releasePart');
	}
});

Events.on(engine, 'collisionStart', event => {
	if (prevMousedBody) {
 		const pairs = event.pairs;
		for (let i = 0; i < pairs.length; i++) {
			const { bodyA, bodyB } = pairs[i];
			const a = bodyA.parent;
			const b = bodyB.parent;
			if ((a.gameParent && b.gameParent) &&
				(a.id === prevMousedBody.id ||
				b.id === prevMousedBody.id)) {
				if (a.gameParent.canJoin(b.gameParent.parts)) {
					a.gameParent.startOverlap();
					b.gameParent.startOverlap();
					overlappedBody = a.id === prevMousedBody.id ? b : a;
					playSFX('joinBodiesStart');
				}
			}
		}
	}
});

Events.on(engine, 'collisionEnd', function(event) {
	if (prevMousedBody && overlappedBody) {
		const pairs = event.pairs;
		for (let i = 0; i < pairs.length; i++) {
			const { bodyA, bodyB } = pairs[i];
			const a = bodyA.parent;
			const b = bodyB.parent;
			if ((a.id === prevMousedBody.id || a.id === overlappedBody.id) &&
				(b.id === prevMousedBody.id || b.id === overlappedBody.id)) {
				a.gameParent.unOverlap();
				b.gameParent.unOverlap();
				overlappedBody = undefined;
				playSFX('joinBodiesEnd');

			}
		}
	}
});

/* keyboard events */
let rightArrow = KeyboardEvent('ArrowRight');
let leftArrow = KeyboardEvent('ArrowLeft');

// debug 
let nKey = KeyboardEvent('n');
nKey.press = function() {
	addPart(choice(C.bodyParts), randInt(w), randInt(h/2));
};


let sKey = KeyboardEvent('s');
sKey.press = function() {
	startSound();
};


