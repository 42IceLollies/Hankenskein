// //needed to move the variables since just linking the environment main file to 
// //other non-level files to access them throws errors since there's no canvas

// // holds some general variables that are handy to keep together
// const game = {
// 	fps: 35,
// 	xOffset: 0,
// 	frictionRate: .6,
// 	idList: [],
// 	background: undefined,
// 	lines: [],
// 	points: [],
// 	level:undefined,
// 	music: true,
// 	sfx: true,
// };

// // holds all the player information
// // turns out hank is complicated
// const player = {
// 	// for ease of drawing and moving (x, y, radius)
// 	shape: new Circle(100, 100, 25), // the object that's drawn on the canvas, for simplicity
// 	// keeps track of where it just was for trajectory calculations
// 	prevX: 100,
// 	prevY: 100,
// 	xSpeed: 0, // horizontal speed in [px/s]
// 	// the above is updated with the sum of the below
// 	xSpeeds: {
// 		rollDown: 0, // x speed when rolling down a line
// 		rollUp: 0, // x speed when rolling up a line
// 		normal: 0, // the regular moving-to-the-side force (from arrow keys directly)
// 	},
// 	ySpeed: 0, // vertical speed in [px/s]
// 	// the above is updated with the sum of the below
// 	ySpeeds: {
// 		gravity: 0,
// 		// both y rolls updated to match their x counterparts
// 		rollDown: 0,
// 		rollUp: 0,
// 	},
// 	// how much speed it can gain, set elsewhere [in resize()]
// 	acceleration: 300,
// 	fillColor: "#ffe0f0", // pink // this doesn't show when the drawing's in place // i'm using it for yarn color
// 	screenPercent: 0.04, // 4% of the height of the canvas
// 	radiusActual: 0.1016, // 4 inches in meters // used for physics calculations
// 	unravelPercent: 1.0, // 1.0 = not unraveled, 0 = completely unraveled
// 	// tracks which directions it's blocked by something
// 	blocked: {
// 		up: false,
// 		down: false,
// 		left: false,
// 		right: false,
// 	},
// 	// tracks which directions it's stopped moving by something
// 	stopped: {
// 		up: false,
// 		down: false,
// 		left: false,
// 		right: false,
// 	},
// 	rotation: 0, // degrees // keeps track of how much it's spun
// 	pauseSpin: false, // if it should stop visually spinning
// 	lasso: undefined,
// 	yarnTrail: undefined,
// };
