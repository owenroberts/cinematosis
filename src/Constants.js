/*
	some constants
*/

const Constants = {
	
	// maybe don't need these
	defaultCollisionLayer: 0x0001,
	mousedCollisionLayer: 0x0002,

	// body parts
	bodyParts: ['head', 'body', 'beak', 'legLeft', 'legRight'],

	// combos
	combos: {
		head: ['beak', 'body'],
		body: ['head', 'legLeft', 'legRight'],
		beak: ['head'],
		legLeft: ['body'],
		legRight: ['body'],
	},

};

export default Constants;