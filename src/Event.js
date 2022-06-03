/*
	one event to add to sequencer
*/
export default function Event(delay, interval, callbacks) {

	this.isStarted = false;
	this.isSetup = false;

	this.getDelay = function() {
		return delay;
	};

	this.getInterval = function() {
		return interval;
	};

	this.start = function() {
		this.isStarted = true;
		if (callbacks.start) callbacks.start();
		return interval;
	};

	this.update = function() {
		if (callbacks.update) callbacks.update();
	};

	this.end = function() {
		if (callbacks.end) callbacks.end();
	};

}