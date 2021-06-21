/* cool utils */

function randInt(min, max) {
	if (!max) max = min, min = 0;
	return Math.round( Math.random() * (max - min) + min );
}

function choice(choices) {
	if (!Array.isArray(choices)) choices = [...arguments];
	return choices[Math.floor(Math.random() * choices.length)];
}

export { choice, randInt };