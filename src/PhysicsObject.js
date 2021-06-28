/*
	contains physics body and image ref
*/

import C from './Constants';
import { randInt } from './Cool';
import { Container, Sprite } from 'pixi.js';
import { Body, Bodies, Vertices, Vector } from 'matter-js';

const defaultOptions = {
	restitution: 0.5,
	friction: 0.9,
};

export default function PhysicsObject(parts, textures, x, y, debug) {
	
	let isOverlapping = false;
	const offset = 10,
		offsetCount = 60;
	let currentOffset = offset,
		currentCount = offsetCount;

	// this.sprite = new Sprite(image);
	this.sprite = new Container();

	if (typeof parts === 'string') parts = [parts];
	this.parts = parts;

	const bodies = [];

	parts.forEach(part => {
		const image = textures[part];
		const { width, height } = image;
		const sprite = new Sprite(textures[part]);
		this.sprite.addChild(sprite);

		// collider shapes
		if (part === 'head') {
			let _x = x, _y = y;
			sprite.anchor.set(0.5, 0.5);
			if (parts.includes('body')) {
				sprite.y -= 180;
				this.sprite.pivot.y = -75;
				_y -= 130;
			}
			const b = Bodies.polygon(_x, _y, 16, width / 2, defaultOptions);
			bodies.push(b);
		}

		if (part === 'body') {
			const bottom = Bodies.polygon(x, y + height / 4, 16, width / 2, defaultOptions);
			const verts = Vertices.create([
				{ x: x, y: y + height / 3},
				{ x: x + width / 4, y: y + height },
				{ x: x - width / 4, y: y + height },
			]);
			const top = Bodies.fromVertices(x, y, verts, defaultOptions);
			sprite.anchor.set(0.5, 0.65);

			if (parts.includes('head')) {
				// bottom.position.y -= 100;
				// top.position.y -= 100;
			}
			bodies.push(bottom);
			bodies.push(top);	
		}

		if (part === 'beak') {

			let _x = x;
			let _y = y;

			if (parts.includes('head')) {
				_x += 70;
				sprite.x += 60;
			}

			const verts = Vertices.create([
				{ x: x + width, y: y },
				{ x: x, y: y + height / 2 },
				{ x: x, y: y - height / 2 },
			]);
			bodies.push(Bodies.fromVertices(_x, _y, verts, defaultOptions));
			sprite.anchor.set(0.45, 0.55);
		}

		if (part === 'legLeft') {

			let _x = x;
			let _y = y;

			if (parts.includes('body')) {
				_x += -40;
				_y += 100;
				sprite.x += -30;
				sprite.y += 70;
			}

			const leg = Bodies.rectangle(_x + 10, _y, 10, height, defaultOptions);
			const foot = Bodies.rectangle(_x, _y + height - 40, width, 10, defaultOptions);
			bodies.push(leg, foot);
			sprite.anchor.set(0.7, 0.6);
		}

		if (part === 'legRight') {

			let _x = x;
			let _y = y;

			if (parts.includes('body')) {
				_x += 40;
				_y += 100;
				sprite.x += 30;
				sprite.y += 70;
			}

			const leg = Bodies.rectangle(_x - 10, _y, 10, height, defaultOptions);
			const foot = Bodies.rectangle(_x, _y + height - 40, width, 10, defaultOptions);
			bodies.push(leg, foot);
			sprite.anchor.set(0.3, 0.6);
		}
	});

	if (bodies.length === 1) this.body = bodies[0];
	else this.body = Body.create({ parts: bodies });

	this.body.gameParent = this;

	// console.log(this.body);

	const clampY = -10; // then x goes nuts ...

	this.canJoin = function(otherParts) {

		if (otherParts.some(o => parts.includes(o))) return false;

		// if at least one part can connect with another part
		return parts.map(p => {
			return otherParts.some(o => C.combos[p].includes(o));
		}).some(p => p);
	};

	this.startOverlap = function() {
		isOverlapping = true;
		currentOffset = offset;
		currentCount = offsetCount;
	};

	this.unOverlap = function() {
		isOverlapping = false;
	};

	this.checkJoin = function() {
		return isOverlapping && currentCount === 0;
	}

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

		if (isOverlapping) {
			this.sprite.position.x += randInt(-currentOffset, currentOffset);
			this.sprite.position.y += randInt(-currentOffset, currentOffset);
			if (currentCount > 0) {
				currentCount--;
				currentOffset -= offset / offsetCount;
			}
		}
	};
}