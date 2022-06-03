/*
	sequence events
*/

export default function Sequencer() {

	let interval = 0;
	let delay = 0;
	let count = 0;
	let queue = [];


	this.setInverval = function(n) {
		interval = n;
		count = 0;
	};

	this.addEvent = function(event) {
		queue.push(event);
	};

	this.update = function(delta) {
		if (queue.length > 0) {
			let event = queue[0];
			if (!event.isSetup) {
				event.isSetup = true;
				interval = event.getInterval();
				delay = event.getDelay();
				count = 0;
			}
			if (!event.isStarted) {
				if (count >= delay) {
					event.isStarted = true;
					event.start();
				}
			} else {
				event.update();
			}
			count += delta;
			if (count >= interval + delay) {
				event.end();
				queue.shift();
			}
		}
	};

	this.next = function() {
		let event = queue[0];
		event.end();
		queue.shift();
	};
}