const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// it reaches a natural speed cap, where friction is equal to acceleration
// we can still add an additional speed cap though


// ==================
// LINE CLASS
// ==================


class Line {
	constructor(x1Start, x2Start, y1, y2, xOffset) {
		this.x1Start = x1Start;
		this.x2Start = x2Start;
		this.y1 = y1;
		this.y2 = y2;
		this.x1 = x1Start + xOffset;
		this.x2 = x2Start + xOffset;
	}

	adjustX(xOffset) {
		this.x1 = this.x1Start + xOffset;
		this.x2 = this.x2Start + xOffset;
	}

	draw(ctx) {
		ctx.beginPath();
		ctx.moveTo(this.x1, this.y1);
		ctx.lineTo(this.x2, this.y2);
		ctx.stroke();
	}

	isVertical() {
		return (this.x1 == this.x2);
	}

	isHorizontal() {
		return (this.y1 == this.y2);
	}

	static withinRange(num, rangeStart, rangeEnd) {
		if (rangeStart < rangeEnd) {
			return (num >= rangeStart && num <= rangeEnd);
		} else {
			return (num >= rangeEnd && num <= rangeStart);
		}
	}

	get yChangeRate() {
		const xChange = this.x2Start - this.x1Start;
		const yChange = this.y2 - this.y1;
		if (xChange == 0) {
			console.log("ERROR: 0 value in xChange");
			return;
		}
		return yChange / xChange;
	}

	// returns the y value on the line at the given x
	yAt(x) {
		if (!Line.withinRange(x, this.x1, this.x2) || this.isVertical()) {return;}
		if (this.isHorizontal()) {return this.y1;}

		const y = this.y1 + (this.yChangeRate * (x - this.x1));
		return y;
	}

	get xChangeRate() {
		const xChange = this.x2Start - this.x1Start;
		const yChange = this.y2 - this.y1;
		if (yChange == 0) {
			console.log("ERROR: 0 value in yChange");
			return;
		}
		return xChange / yChange;
	}

	// returns the y value on the line at the given x
	xAt(y) {
		if (!Line.withinRange(y, this.y1, this.y2) || this.isHorizontal()) {return;}
		if (this.isVertical()) {return this.x1;}

		const x = this.x1 + (this.xChangeRate * (y - this.y1));
		return x;
	}

} // end of Line

// ===============
// POINT CLASS (for testing)
// ===============

class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	moveTo(x, y) {
		this.x = x;
		this.y = y;
	}

	draw(ctx) {
		ctx.fillRect(this.x - 2, this.y - 2, 5, 5);
	}
} // end of Point


// ==================
// DATA OBJECTS
// ==================


const game = {
	fps: 25,
	xOffset: 0,
	frictionRate: .6,
};


const player = {
	x: 100,
	y: 100,
	radius: 25,
	xSpeed: 0,
	ySpeed: 0,
	acceleration: 150,
	fillColor: "#e2619f",
};

const lines = [];

const testLine = new Line(500, 800, 1000, 0);
const ground = new Line(0, 1000, 300, 300);
lines.push(testLine);
lines.push(ground);

const collidePoint = new Point(0, 0);
const collidePoint2 = new Point(0, 0);

// ====================
// SPEED CHANGES
// ====================


// reduces an object's speed
function friction(obj) {
	obj.xSpeed -= (obj.xSpeed * game.frictionRate) / game.fps;
	obj.ySpeed -= (obj.ySpeed * game.frictionRate) / game.fps;
	
	if (Math.abs(obj.xSpeed) < 1) {obj.xSpeed = 0;}
	if (Math.abs(obj.ySpeed) < 1) {obj.ySpeed = 0;}
} // end of friction


// propels the player based on arrow keys & adjusts speed based on external elements
function propelPlayer() {
	// changed this to if statements so that you can press more than one key at once

	// if an arrow key is down, add more speed in that direction
		if(keydown.left){
			player.xSpeed -= player.acceleration / game.fps;
		}
		if(keydown.right){
			player.xSpeed += player.acceleration / game.fps;
		}
		// it's not actually supposed to jump like this in the final game,
		// but it's good for testing
		if(keydown.up){
			// player.ySpeed -= player.acceleration / game.fps;
			// makes gravity on jump more realistic, also easier to maneuver
			player.ySpeed -= Physics.affectGravity(15, 150, timer);
		}
		if(keydown.down){
			player.ySpeed += player.acceleration / game.fps;
		}
} // end of propelPlayer


// ==================
// COLLISION
// ==================


function collideWithLines() {
	// if player runs into a line, it can't move in that direction
	// tests the player against every line
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		// if they aren't colliding, skip this one
		if (!testForCollision(player, line)) {
			continue;
		}
		// if the line's vertical
		if (line.isVertical()) {
			// if player's to the left, stop moving right
			if (player.x < line.x1 && player.xSpeed > 0) {
				player.xSpeed = 0;
				game.xOffset += player.radius - (line.x1 - player.x);
			// if player's to the right, stop moving left
			} else if (player.x > line.x1 && player.xSpeed < 0) {
				player.xSpeed = 0;
				game.xOffset -= player.radius - (player.x - line.x1);
			}
		// if the line's horizontal
		} else if (line.isHorizontal()) {
			// if player's lower, stop moving up
			if (player.y > line.y1 && player.ySpeed < 0) {
				player.ySpeed = 0;
				player.y += player.radius - (player.y - line.y1);
			// if player's higher, stop moving down
			} else if (player.y < line.y1 && player.ySpeed > 0) {
				player.ySpeed = 0;
				player.y -= player.radius - (line.y1 - player.y);
			}
		} else {
			const points = collisionPoints(player, line);
			const point1 = points[0];
			const point2 = points[1];

			let collideDegree;

			// if it's the first point
			if (withinRange(line.yAt(point1[0]), player.y, point1[1]) ||
		withinRange(line.xAt(point1[1]), player.x, point1[0])) {
				collideDegree = collisionDegree(-line.yChangeRate);
				// player.x += line.xAt(point1[1]) - point1[0];
			} else if (withinRange(line.yAt(point2[0]), player.y, point2[1]) ||
			withinRange(line.xAt(point2[1]), player.x, point2[0])) {
				collideDegree = collisionDegree(-line.yChangeRate) + 180;
				// player.x += line.xAt(point2[1]) - point2[0];
			}
			// console.log(collideDegree);
			switch (true) {
				case withinRange(collideDegree, 0, 90):
					if (player.xSpeed > 0) {player.xSpeed = 0;}
					if (player.ySpeed < 0) {player.ySpeed = 0;}
					while (testForCollision(player, line)) {
						game.xOffset++; // reverse
						line.adjustX(game.xOffset);
						player.y++;
					}
					player.y--;
					game.xOffset--;
					// console.log("no up or right");
					break;
				case withinRange(collideDegree, 90, 180):
					if (player.xSpeed < 0) {player.xSpeed = 0;};
					if (player.ySpeed < 0) {player.ySpeed = 0;}
					while (testForCollision(player, line)) {
						game.xOffset--; // reverse
						line.adjustX(game.xOffset);
						player.y++;
					}
					player.y--;
					game.xOffset++;
					// console.log("no up or left");
					break;
				case withinRange(collideDegree, 180, 270):
					if (player.xSpeed < 0) {player.xSpeed = 0;}
					if (player.ySpeed > 0) {player.ySpeed = 0;}
					while (testForCollision(player, line)) {
						game.xOffset--; // reverse
						line.adjustX(game.xOffset);
						player.y--;
					}
					player.y++;
					game.xOffset++;
					// console.log("no down or left");
					break;
				case withinRange(collideDegree, 270, 360):
					if (player.xSpeed > 0) {player.xSpeed = 0;}
					if (player.ySpeed > 0) {player.ySpeed = 0;}
					while (testForCollision(player, line)) {
						game.xOffset++; // reverse
						line.adjustX(game.xOffset);
						player.y--;
					}
					player.y++;
					game.xOffset--;
					// console.log("no down or right");
					break;
			}
		}
	}	
} // end of collideWithLines


// only works for horizontal and vertical lines
function testForCollision(circle, line) {
	const circleLeft = circle.x - circle.radius;
	const circleRight = circle.x + circle.radius;
	const circleUp = circle.y - circle.radius;
	const circleDown = circle.x + circle.radius;

	// vertical line
	if (line.isVertical()) {
		if (withinRange(circleUp, line.y1, line.y2) || withinRange(circleDown, line.y1, line.y2)) {
			if (Math.abs(circle.x - line.x1) <= circle.radius) {
				return true;
			}
		}
	// horizontal line
	} else if (line.isHorizontal()) {
		if (withinRange(circleLeft, line.x1, line.x2) || withinRange(circleRight, line.x1, line.x2)) {
			if (Math.abs(circle.y - line.y1) <= circle.radius) {
				return true;
			}
		}
	// angled line
	} else {
		const points = collisionPoints(circle, line);
		const point1 = points[0];
		const point2 = points[1];

		collidePoint.moveTo(point1[0], point1[1]);
		collidePoint2.moveTo(point2[0], point2[1]);

		if (withinRange(line.yAt(point1[0]), circle.y, point1[1]) ||
		withinRange(line.xAt(point1[1]), circle.x, point1[0])) {
			return true;
		} else if (withinRange(line.yAt(point2[0]), circle.y, point2[1]) ||
		withinRange(line.xAt(point2[1]), circle.x, point2[0])) {
			return true;
		}
	}
	return false;
} // end of testForCollision


function collisionDegree(slope) {
	let degree = radiansToDegrees(Math.atan(inverseSlope(slope)));
	if (slope >= 0) {
		degree = 180 - Math.abs(degree);
	}
	return degree;
} // end of collisionDegree


// don't input vertical or horizontal lines (not sure what'll happen though)
// returns the (x, y) of the point on the circle that would collide with the line
function collisionPoints(circle, line) {
	const hyp = circle.radius;
	const adjs = [];
	const opps = [];

	let degree1 = collisionDegree(-line.yChangeRate);
	if (degree1 % 180 < 90) {
		adjs.push(Math.abs(getAdj(degree1, hyp)));
		opps.push(Math.abs(getOpp(degree1, hyp)));
	} else {
		opps.push(Math.abs(getAdj(degree1, hyp)));
		adjs.push(Math.abs(getOpp(degree1, hyp)));
	}

	let degree2 = degree1 + 180;
	if (degree2 % 180 < 90) {
		adjs.push(Math.abs(getAdj(degree2, hyp)));
		opps.push(Math.abs(getOpp(degree2, hyp)));
	} else {
		opps.push(Math.abs(getAdj(degree2, hyp)));
		adjs.push(Math.abs(getOpp(degree2, hyp)));
	}

	// keep it in range of 0-360
	const degrees = [degree1, degree2];
	const points = [];

	for (let i = 0; i < 2; i++) {
		switch (true) {
			case withinRange(degrees[i], 0, 90):
				// console.log(degrees[i]);
				points.push([circle.x + adjs[i], circle.y - opps[i]]);
				break;
			case withinRange(degrees[i], 90, 180):
				points.push([circle.x - adjs[i], circle.y - opps[i]]);
				break;
			case withinRange(degrees[i], 180, 270):
				points.push([circle.x - adjs[i], circle.y + opps[i]]);
				break;
			case withinRange(degrees[i], 270, 360):
				points.push([circle.x + adjs[i], circle.y + opps[i]]);
				break;
		}
	}
	return points;
} // end of collisionPoints


// only works for horizontal and vertical lines
function angledCollisionAbove(circle, line) {
	const circleLeft = circle.x - circle.radius;
	const circleRight = circle.x + circle.radius;
	const circleUp = circle.y - circle.radius;
	const circleDown = circle.x + circle.radius;

	// vertical line
	if (line.isVertical()) {
		return;
	} else if (line.isHorizontal()) {
		return;
	// angled line
	} else {
		const points = collisionPoints(circle, line);
		const point1 = points[0];
		const point2 = points[1];

		collidePoint.moveTo(point1[0], point1[1]);
		collidePoint2.moveTo(point2[0], point2[1]);

		// first point
		if (withinRange(line.yAt(point1[0]), circle.y, point1[1]) ||
		withinRange(line.xAt(point1[1]), circle.x, point1[0])) {
			return true;
		} else if (withinRange(line.yAt(point2[0]), circle.y, point2[1]) ||
		withinRange(line.xAt(point2[1]), circle.x, point2[0])) {
			return false;
		}
	}
} // end of angledCollisionAbove


// ==============
// MISC. MATH
// ==============


// returns the length of the adjacent
function getAdj(degree, hyp) {
	degree %= 90;
	degree = degreesToRadians(degree);
	return hyp * (Math.cos(degree));
} // end of getAdj


// returns the length of the the opposite
function getOpp(degree, hyp) {
	degree %= 90;
	degree = degreesToRadians(degree);
	return hyp * (Math.sin(degree));
} // end of getOpp


function inverseSlope(x) {
	return -(1 / x);
} // end of invertSlope


function radiansToDegrees(x) {
	return x * (180 / Math.PI);
} // end of RadiansToDegrees


function degreesToRadians(x) {
	return x / (180 / Math.PI);
} // end of degreesToRadians


function withinRange(num, rangeStart, rangeEnd) {
	if (rangeStart < rangeEnd) {
		return (num >= rangeStart && num <= rangeEnd);
	} else {
		return (num >= rangeEnd && num <= rangeStart);
	}
} // end of withinRange


// ====================
// KEY TRACKING
// ====================


// keeps track of which keys are pressed
const keydown = {
	left: false,
	right: false,
	up: false,
	down: false,
};


// logs when keys are pressed
document.addEventListener("keydown", (e) => {
	switch(e.keyCode) {
		case 37:
			keydown.left = true;
			break;
		case 39:
			keydown.right = true;
			break;
		case 38:
			keydown.up = true;
			break;
		case 40:
			keydown.down = true;
			break;
		// testing, feel free to remove it
		case 32:
			// console.log(collisionPoints(player, testLine));
			// console.log(player.x + ", " + player.y);
	}
});

// logs when keys are released
document.addEventListener("keyup", (e) => {
	switch(e.keyCode) {
		case 37:
			keydown.left = false;
			break;
		case 39:
			keydown.right = false;
			break;
		case 38:
			keydown.up = false;
			break;
		case 40:
			keydown.down = false;
			break;
	}
});


// ================
// RESIZING
// ================


function resize() {
	resizeCanvas();
	player.x = canvas.width / 2;
} // end of resize


// resizes the canvas to the size of the window
function resizeCanvas() {
	canvas.width = window.innerWidth - 20; // -20 to get around padding I can't find
	canvas.height = window.innerHeight - 20;
} // end of resizeCanvas


// =====================
// MOVING
// =====================


// moves the player
function movePlayer() {
	// speeds are pixels/second, so it's reduced for how frequently it's happening
	player.y += player.ySpeed / game.fps;
} // end of movePlayer


// if player is above the ground and not on an obstruction, it will be affected by gravity
var timer = 0;

setInterval(()=>{
	timer++;
}, 1000);

function fall() {
	let atRest = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (line.isVertical() || !testForCollision(player, line)) {
			continue;
		} else if (line.isHorizontal()) {
			if (player.y < line.y1) {
				atRest = true;
			}
		// if angled and colliding
		} else {
			if (!angledCollisionAbove(player, line)) {
				atRest = true;
			}
		}
	}


	// if (player.y + player.radius <= obstructions.ground.y) {
	// if (!testForCollision(player, ground)) {
	if (!atRest) {
		// reversed because the negative direction is opposite of usual
		player.ySpeed -= Physics.affectGravity(0, player.ySpeed, timer);
	} else {
		timer = 1;
	}
}
// this function kind of works as a jump type thing, it's not entirely accurate but it seems to work well enough idk


function moveLines() {
	for (let i = 0; i < lines.length; i++) {
		lines[i].adjustX(game.xOffset);
	}
} // end of moveLines


// =================
// DRAWING
// =================


// clears the entire canvas, by making the entire canvas transparent
function clearCanvas() {
	const canvas = document.getElementById('canvas');
	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
} // end of clearCanvas


// draws in the player, off of info from player obj
function drawPlayer() {
	const canvas = document.getElementById('canvas');
	const ctx = canvas.getContext('2d');

	ctx.fillStyle = player.fillColor;
	ctx.beginPath();
	ctx.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
	ctx.fill();
} // end of drawPlayer


function drawLines() {
	for (let i = 0; i < lines.length; i++) {
		lines[i].draw(ctx);
	}
} // end of drawLines


// the animate loop, draws in the new positions of objects
const animateID = setInterval(() => {
	resize();
	// called here so collision still works
	moveLines();

	propelPlayer();
	friction(player);
	collideWithLines();
	
	game.xOffset -= player.xSpeed / game.fps;

	movePlayer();
	moveLines();

	fall();

	clearCanvas();
	drawLines();
	drawPlayer();
	collidePoint.draw(ctx);
	collidePoint2.draw(ctx);

}, 1000 / game.fps); // 1000 is 1 second

// console.log(getAdj(45, 25));
// console.log(getOpp(45, 25));


