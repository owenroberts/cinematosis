import * as PIXI from 'pixi.js';
import { Engine, Runner, Composite, Bodies, Body, Render, MouseConstraint, Mouse, Events } from 'matter-js';

import { choice, randInt } from './Cool';
import C from './Constants';
import Sound from './Sound';
import KeyboardEvent from './KeyboardEvent';
import PhysicsObject from './PhysicsObject';
import Terrain from './Terrain';
import Sequencer from './Sequencer';
import Event from './Event';

let showPhysics = true;
let sound = new Sound();

let type = "WebGL";
if(!PIXI.utils.isWebGLSupported()) {
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
	resizeTo: window
});
let ticker = new PIXI.Ticker();
let loader = new PIXI.Loader();
let stage = new Container();
let renderStage = new Container();

renderStage.addChild(stage);
document.body.appendChild(renderer.view);
let state, bg;
let sequencer = new Sequencer();

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
const runner = Runner.create({
	delta: 1000 / 60,
	isFixed: true // tie physics to frame rate
});
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
	sound.playSFX('newPart');
	return bodyPart;
}

function setup() {
	
	renderer.backgroundColor = 0xebebeb;
	renderer.autoResize = true;

	let head = addPart('head', randInt(128, w - 128), randInt(128, h / 2 - 128));
	head.onClick = function() {

		console.log(head);
		
		let startingParts = ['body', 'beak', 'legLeft', 'legRight'];
		let partCount = 0;
		startingParts.forEach(part => {
			sequencer.addEvent(new Event(100, 100, {
				start: function() {
					addPart(part, randInt(128, w - 128), randInt(128, h / 2 - 128));
				},
				update: function() {
					return;

					// figure out scaling later
					let s = 1;
					let _w = w - s;
					let r = _w / w;

					stage.width *= r;
					stage.height *= r;

					Composite.scale(engine.world, r, r, {
						x: 0, // _w / 2,
						y: 0, // _h / 2,
					});
				}
			}));
		});
		head.onClick = undefined;
	};


	bg = new Sprite(TextureCache.BG);
	bg.position.set(w / 2, h / 2);
	bg.anchor.set(0.5, 0.5);
	stage.addChild(bg);
	
	let terrainBody = Bodies.fromVertices(0, 0, terrainVerts, {
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
	const tw = Math.abs(terrainBody.bounds.max.x - terrainBody.bounds.min.x);
	const th = Math.abs(terrainBody.bounds.max.y - terrainBody.bounds.min.y);

	bg.position.set(w / 2 - 270, h - 240); // ??
	Body.setPosition(terrainBody, { x: w / 2, y: h - th / 2});
	Composite.addBody(engine.world, terrainBody);

	state = play;
	ticker.add(delta => gameLoop(delta));
	ticker.start();
	Runner.run(runner, engine);

}

function gameLoop(delta){
	state(delta);
}

function play(delta) {

	sequencer.update(delta);

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
	sound.playSFX('joinBodiesEnd');
}

/* mouse events */
let prevMousedBody;
let overlappedBody;

Events.on(mouseConstraint, 'mousedown', event => {
	if (mouseConstraint.body) {
		if (mouseConstraint.body.gameParent.onClick) mouseConstraint.body.gameParent.onClick();
		prevMousedBody = mouseConstraint.body;
		prevMousedBody.isSensor = true;
		for (let i = 0; i < prevMousedBody.parts.length; i++) {
			prevMousedBody.parts[i].isSensor = true;
		}
		sound.playSFX('grabPart');
	}
});

Events.on(mouseConstraint, 'mouseover', event => {
	if (mouseConstraint.body) {
		if (mouseConstraint.body.gameParent.onClick) mouseConstraint.body.gameParent.onClick();
		prevMousedBody = mouseConstraint.body;
		prevMousedBody.isSensor = true;
		for (let i = 0; i < prevMousedBody.parts.length; i++) {
			prevMousedBody.parts[i].isSensor = true;
		}
		sound.playSFX('grabPart');
	}
});

Events.on(mouseConstraint, 'mouseup', event => {
	if (prevMousedBody) {
		prevMousedBody.isSensor = false;
		for (let i = 0; i < prevMousedBody.parts.length; i++) {
			prevMousedBody.parts[i].isSensor = false;
		}
		prevMousedBody = undefined;
		sound.playSFX('releasePart');
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
					sound.playSFX('joinBodiesStart');
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
				sound.playSFX('joinBodiesEnd');
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
	sound.start();
};

let gKey = KeyboardEvent('g');
gKey.press = function() {
	if (engine.gravity.y === 0) engine.gravity.y = 1;
	else if (engine.gravity.y === 1) engine.gravity.y = 0;
};

let pKey = KeyboardEvent('p');
pKey.press = function() {
	showPhysics = !showPhysics;
	if (showPhysics) renderStage.addChild(physicsRenderer.stage);
	else renderStage.removeChild(physicsRenderer.stage);
};