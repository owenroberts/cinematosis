/* cool utils */

function choice(choices) {
	if (!Array.isArray(choices)) choices = [...arguments];
	return choices[Math.floor(Math.random() * choices.length)];
}

export { choice };