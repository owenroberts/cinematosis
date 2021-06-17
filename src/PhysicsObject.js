/*
	contains physics body and image ref
*/

import { Sprite } from 'pixi.js';
import { Bodies } from 'matter-js';

export default function PhysicsObject(image, x, y) {

	this.body = Bodies['rectangle'](x, y, image.width, image.height, {
		restitution: 0.5,
		friction: 1,
	});
	this.sprite = new Sprite(image);
	this.sprite.anchor.set(0.5, 0.5);

	this.update = function() {
		this.sprite.position = this.body.position;
		this.sprite.rotation = this.body.angle;
	};
}