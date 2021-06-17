import { choice } from './Cool';
import * as PIXI from 'pixi.js';
import { Engine, World, Runner, Composite, Bodies, MouseConstraint, Mouse } from 'matter-js';
import KeyboardEvent from './KeyboardEvent';
import PhysicsObject from './PhysicsObject';

let type = "WebGL";
if(!PIXI.utils.isWebGLSupported()){
	type = "canvas";
}
PIXI.utils.sayHello(type);
let TextureCache = PIXI.utils.TextureCache,
	Sprite = PIXI.Sprite;

let w = window.innerWidth, h = window.innerHeight;
let app = new PIXI.Application({ width: w, height: h });
document.body.appendChild(app.view);
let state, bg;

let bodyPartsImages = ['head', 'body', 'beak', 'leg-left', 'leg-right'];
bodyPartsImages.forEach(name => {
	app.loader.add(name, `static/images/${name}.png`);
});

app.loader
	.add('BG', "static/images/bg-test.png")

app.loader.load(setup);

const engine = Engine.create();
const objects = [];

const ground = Bodies.rectangle(w/2, h - 100, w, 100, { isStatic: true });
World.add(engine.world, [ground]);

const mouseConstraint = MouseConstraint.create(engine, {
	mouse: Mouse.create(app.view),
});

World.add(engine.world, mouseConstraint);

function setup() {
	app.renderer.backgroundColor = 0xebebeb;
	app.renderer.autoResize = true;

	const testObject = new PhysicsObject(TextureCache[choice(bodyPartsImages)], 300, 300);
	objects.push(testObject);
	World.addBody(engine.world, testObject.body);

	bg = new Sprite(TextureCache.BG);
	bg.anchor.x = 0.5;
	bg.x = w / 2;

	app.stage.addChild(bg);
	objects.forEach(obj => { app.stage.addChild(obj.sprite); });

	state = play;
	app.ticker.add(delta => gameLoop(delta));
	Runner.run(engine);
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

}

/* keyboard events */
let rightArrow = KeyboardEvent('ArrowRight');
let leftArrow = KeyboardEvent('ArrowLeft');


