/*
	object for key board event
*/

export default function KeyboardEvent(value) {
	const key = {
		value: value,
		isDown: false,
		isUp: false,
		press: undefined,
		release: undefined,
	};

	key.downHandler = ev => {
		if (ev.key === key.value) {
			if (key.isUp && key.press) key.press();
			key.isDown = true;
			key.isUp = false;
			ev.preventDefault();
		}
	}

	key.upHandler = ev => {
		if (ev.key === key.value) {
			if (key.isDown && key.release) key.release();
			key.isDown = false;
			key.isUp = true;
			ev.preventDefault();
		}
	}

	const downListener = key.downHandler.bind(key);
	const upListener = key.upHandler.bind(key);

	window.addEventListener('keydown', downListener, false);
	window.addEventListener('keyup', upListener, false);

	key.unsubscribe = () => {
		window.removeEventListener("keydown", downListener);
		window.removeEventListener("keyup", upListener);
	}

	return key;
}