import { choice, randInt } from './Cool';
import * as PIXI from 'pixi.js';
import { Engine, World, Runner, Composite, Bodies, Render, MouseConstraint, Mouse } from 'matter-js';
import KeyboardEvent from './KeyboardEvent';
import PhysicsObject from './PhysicsObject';
import Terrain from './Terrain';


let type = "WebGL";
if(!PIXI.utils.isWebGLSupported()){
	type = "canvas";
}
PIXI.utils.sayHello(type);
let TextureCache = PIXI.utils.TextureCache,
	Sprite = PIXI.Sprite;

let w = window.innerWidth, h = window.innerHeight;
// let app = new PIXI.Application({ width: w, height: h });
let renderer = new PIXI.Renderer({ 
	view: document.getElementById('canvas'), 
	width: w, 
	height: h,
});
let ticker = new PIXI.Ticker();
let loader = new PIXI.Loader();
let stage = new PIXI.Container();
let renderStage = new PIXI.Container();
renderStage.addChild(stage);
document.body.appendChild(renderer.view);
let state, bg, terrain;


let bodyPartsImages = ['head', 'body', 'beak', 'leg-left', 'leg-right'];
bodyPartsImages.forEach(name => {
	loader.add(name, `static/images/${name}.png`);
});

loader
	.add('BG', "static/images/bg-test.png")

loader.load(setup);

const engine = Engine.create();
let physicsRenderer = {
	stage: new PIXI.Container(),
	graphics: new PIXI.Graphics(),
};
physicsRenderer.stage.addChild(physicsRenderer.graphics);
let showPhysics = true;
if (showPhysics) renderStage.addChild(physicsRenderer.stage);

const objects = [];

const ground = Bodies.rectangle(w/2, h - 100, w, 100, { isStatic: true });
World.add(engine.world, [ground]);

const mouseConstraint = MouseConstraint.create(engine, {
	mouse: Mouse.create(renderer.view),
});

World.add(engine.world, mouseConstraint);

function setup() {
	renderer.backgroundColor = 0xebebeb;
	renderer.autoResize = true;

	const bodyPart = choice(bodyPartsImages);
	const testObject = new PhysicsObject(bodyPart, TextureCache[bodyPart], 300, 300, true);
	objects.push(testObject);
	World.addBody(engine.world, testObject.body);

	bg = new Sprite(TextureCache.BG);
	bg.anchor.x = 0.5;
	bg.x = w / 2;

	terrain = new Terrain(w, h, body => {
		World.addBody(engine.world, body);
	});
	

	stage.addChild(bg);
	objects.forEach(obj => { stage.addChild(obj.sprite); });

	state = play;
	ticker.add(delta => gameLoop(delta));
	ticker.start();
	Runner.run(engine);

	console.log(Composite.allBodies(engine.world));
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

/* keyboard events */
let rightArrow = KeyboardEvent('ArrowRight');
let leftArrow = KeyboardEvent('ArrowLeft');

let n = KeyboardEvent('n');
n.press = function() {
	const bodyPart = choice(bodyPartsImages);
	const obj = new PhysicsObject(bodyPart, TextureCache[bodyPart], randInt(w), randInt(h/2));
	objects.push(obj);
	World.addBody(engine.world, obj.body);
	stage.addChild(obj.sprite);
};


