/*
	contains physics body and image ref
*/

import { Sprite } from 'pixi.js';
import { Body, Bodies, Vertices, Vector } from 'matter-js';

const defaultOptions = {
	restitution: 0.5,
	friction: 0.9,
};


export default function PhysicsObject(part, image, x, y, debug) {

	const { width, height } = image;

	this.sprite = new Sprite(image);

	// collider shapes
	if (part === 'head') {
		this.body = Bodies.polygon(x, y, 16, width / 2, defaultOptions);
		this.sprite.anchor.set(0.5, 0.5);
	} else if (part === 'body') {
		const bottomPart = Bodies.polygon(x, y + height / 4, 16, width / 2, defaultOptions);
		const verts = Vertices.create([
			{ x: x, y: y + height / 3},
			{ x: x + width / 4, y: y + height },
			{ x: x - width / 4, y: y + height },
		]);
		const topPart = Bodies.fromVertices(x, y, verts, defaultOptions);
		this.body = Body.create({
			parts: [topPart, bottomPart],
		});
		this.sprite.anchor.set(0.5, 0.65);
	} else if (part === 'beak') {
		const verts = Vertices.create([
			{ x: x + width, y: y },
			{ x: x, y: y + height / 2 },
			{ x: x, y: y - height / 2 },
		]);
		this.body =  Bodies.fromVertices(x, y, verts, defaultOptions);
		this.sprite.anchor.set(0.45, 0.55);
	} else if (part === 'leg-left') {
		const leg = Bodies.rectangle(x + 10, y, 10, height, defaultOptions);
		const foot = Bodies.rectangle(x, y + height - 40, width, 10, defaultOptions);
		this.body = Body.create({
			parts: [leg, foot]
		});
		this.sprite.anchor.set(0.7, 0.6);
	} else if (part === 'leg-right') {
		const leg = Bodies.rectangle(x - 10, y, 10, height, defaultOptions);
		const foot = Bodies.rectangle(x, y + height - 40, width, 10, defaultOptions);
		this.body = Body.create({
			parts: [leg, foot]
		});
		this.sprite.anchor.set(0.3, 0.6);
	} else {
		this.body = Bodies.rectangle(x, y, width, height, defaultOptions);
		this.sprite.anchor.set(0.5, 0.5);
	}



	const clampY = -10; // then x goes nuts ... 

	this.update = function() {
		// if (debug) console.log(this.body.velocity.y);
		// if (this.body.velocity.y < clampY) { // clamp y vel
		// 	Body.setVelocity(this.body, {
		// 		x: this.body.velocity.x,
		// 		y: clampY
		// 	});
		// }
		this.sprite.position = this.body.position;
		this.sprite.rotation = this.body.angle;
	};
}