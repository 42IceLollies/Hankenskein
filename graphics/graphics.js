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

	get degree() {
		if (this.isVertical()) {
			return 90;
		}
		let degree = Math.atan(-this.yChangeRate) * (180 / Math.PI);
		if (degree < 0) {
			degree = 180 + degree;
		}
		return degree;
	}
} // end of Line

// ===============
// POINT CLASS
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
		ctx.fillStyle = "purple";
		ctx.fillRect(this.x - 2, this.y - 2, 5, 5);
	}
} // end of Point


function fillPoints() {
	points = [];
	for (let i = 0; i < lines.length; i++) {
		points.push(new Point(lines[i].x1, lines[i].y1));
		points.push(new Point(lines[i].x2, lines[i].y2))
	}
} // end of fillPoints


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
	screenPercent: 0.035,
	radiusActual: 0.1016, // 4 inches in meters
	weightActual: "idk", // in kilograms?
};

const lines = [];
let points = [];

const testLine = new Line(1500, 500, 0, 1000, game.xOffset);
// const testLine2 = new Line(500, 700, 200, 0);
const ground = new Line(0, 1000, 300, 400, game.xOffset);

const collidePoint = new Point(0, 0);

lines.push(testLine);
// lines.push(testLine2);
lines.push(ground);

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
		// if an arrow key is down, add more speed in that direction
		if (keydown.left) {
			player.xSpeed -= player.acceleration / game.fps;
		}
		if (keydown.right) {
			player.xSpeed += player.acceleration / game.fps;
		}
} // end of propelPlayer


// ==================
// COLLISION
// ==================


// handles player collision with lines
// doesn't handle collision with the point on the end of the line
function collideWithLines() {
	// if player runs into a line, it can't move in that direction
	// tests the player against every line
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		// if they aren't colliding, skip this one
		if (!testForLineCollision(player, line)) {
			continue;
		}
		// if the line's vertical
		if (line.isVertical()) {

			// if player's to the left, stop moving right
			if (player.x < line.x1 && player.xSpeed > 0) {
				game.xOffset += player.radius - (line.x1 - player.x);
			// if player's to the right, stop moving left
			} else if (player.x > line.x1 && player.xSpeed < 0) {
				game.xOffset -= player.radius - (player.x - line.x1);
			}
			// reverse horizontal direction, with reduced speed
			player.xSpeed = -Physics.bounceMomentumLoss(player.xSpeed);

		// if the line's horizontal
		} else if (line.isHorizontal()) {

			// if player's lower, stop moving up
			if (player.y > line.y1 && player.ySpeed < 0) {
				player.y += player.radius - (player.y - line.y1);
				player.y--;
			// if player's higher, stop moving down
			} else if (player.y < line.y1 && player.ySpeed > 0) {
				player.y -= player.radius - (line.y1 - player.y);
				player.y++;
			}
			// reverse vertical speed, with less speed
			player.ySpeed = -Physics.bounceMomentumLoss(player.ySpeed);

		// if the line's angled
		} else {
			const points = collisionPoints(player, line);
			const point1 = points[0];
			const point2 = points[1];

			let collideDegree;

			// if it's the first point (upper half)
			if (withinRange(line.yAt(point1[0]), player.y, point1[1]) ||
		withinRange(line.xAt(point1[1]), player.x, point1[0])) {
				// get the degree
				collideDegree = collisionDegree(-line.yChangeRate);
			// if it's the second point (lower half)
			} else if (withinRange(line.yAt(point2[0]), player.y, point2[1]) ||
			withinRange(line.xAt(point2[1]), player.x, point2[0])) {
				// get the degree, and add 180 to go to the other side
				collideDegree = collisionDegree(-line.yChangeRate) + 180;
			}

			// test against the 4 90-degree segments of the circle
			switch (true) {
				case withinRange(collideDegree, 0, 90):
					// insert bounce here in place of next 2 lines (and in the other cases)
					if (player.xSpeed > 0) {player.xSpeed = 0;}
					if (player.ySpeed < 0) {player.ySpeed = 0;}
					// move diagonally away from the line until not touching anymore
					while (testForLineCollision(player, line)) {
						game.xOffset++; // reverse
						line.adjustX(game.xOffset);
						player.y++;
					}
					player.y--;
					game.xOffset--;
					// no up or right
					break;
				case withinRange(collideDegree, 90, 180):
					if (player.xSpeed < 0) {player.xSpeed = 0;};
					if (player.ySpeed < 0) {player.ySpeed = 0;}
					// move diagonally away from the line until not touching anymore
					while (testForLineCollision(player, line)) {
						game.xOffset--; // reverse
						line.adjustX(game.xOffset);
						player.y++;
					}
					player.y--;
					game.xOffset++;
					// no up or left
					break;
				case withinRange(collideDegree, 180, 270):
					if (player.xSpeed < 0) {player.xSpeed = 0;}
					if (player.ySpeed > 0) {player.ySpeed = 0;}
					// move diagonally away from the line until not touching anymore
					while (testForLineCollision(player, line)) {
						game.xOffset--; // reverse
						line.adjustX(game.xOffset);
						player.y--;
					}
					player.y++;
					game.xOffset++;
					// no down or left
					break;
				case withinRange(collideDegree, 270, 360):
					if (player.xSpeed > 0) {player.xSpeed = 0;}
					if (player.ySpeed > 0) {player.ySpeed = 0;}
					// move diagonally away from the line until not touching anymore
					while (testForLineCollision(player, line)) {
						game.xOffset++; // reverse
						line.adjustX(game.xOffset);
						player.y--;
					}
					player.y++;
					game.xOffset--;
					// no down or right
					break;
			}
		}
	}	
} // end of collideWithLines



function testForLineCollision(circle, line) {
	const points = collisionPoints(circle, line);
	const point1 = points[0];
	const point2 = points[1];

	if (withinRange(line.yAt(point1[0]), circle.y, point1[1]) ||
	withinRange(line.xAt(point1[1]), circle.x, point1[0])) {
		return true;
	} else if (withinRange(line.yAt(point2[0]), circle.y, point2[1]) ||
	withinRange(line.xAt(point2[1]), circle.x, point2[0])) {
		return true;
	}

	return false;
} // end of testForLineCollision


function collisionDegree(slope) {
	let degree = radiansToDegrees(Math.atan(inverseSlope(slope)));
	if (slope >= 0) {
		degree = 180 - Math.abs(degree);
	}
	return degree;
} // end of collisionDegree


// returns the (x, y) of the point on the circle that would collide with the line
function collisionPoints(circle, line) {
	const hyp = circle.radius;
	const adjs = [];
	const opps = [];

	let degree1;
	// avoids dividing by 0
	if (line.isVertical()) {
		degree1 = 0;
	} else {
		// negative cause graph y and canvas y are opposite
		degree1 = collisionDegree(-line.yChangeRate);
	}
	// if in the 1st or 3rd quarter, keep it normal
	if (degree1 % 180 < 90) {
		adjs.push(Math.abs(getAdj(degree1, hyp)));
		opps.push(Math.abs(getOpp(degree1, hyp)));
	// if in the 2nd or 4th quarter, switch adj and opp
	} else {
		opps.push(Math.abs(getAdj(degree1, hyp)));
		adjs.push(Math.abs(getOpp(degree1, hyp)));
	}

	// the other point of collision is directly opposite
	let degree2 = degree1 + 180;
	// if in the 1st or 3rd quarter, keep it normal
	if (degree2 % 180 < 90) {
		adjs.push(Math.abs(getAdj(degree2, hyp)));
		opps.push(Math.abs(getOpp(degree2, hyp)));
	// if in the 2nd or 4th quarter, switch adj and opp
	} else {
		opps.push(Math.abs(getAdj(degree2, hyp)));
		adjs.push(Math.abs(getOpp(degree2, hyp)));
	}

	// array for easy reference
	const degrees = [degree1, degree2];
	const points = [];

	// for every point of possible collision
	for (let i = 0; i < degrees.length; i++) {
		// test against every 90-degree segment of the circle
		// determines whether to add/subtract the adj/opp
		switch (true) {
			case withinRange(degrees[i], 0, 90):
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


// for angled lines only
// tests if 
function angledCollisionAbove(circle, line) {
	const circleLeft = circle.x - circle.radius;
	const circleRight = circle.x + circle.radius;
	const circleUp = circle.y - circle.radius;
	const circleDown = circle.x + circle.radius;

	// vertical line
	if (line.isVertical() || line.isHorizontal()) {
		return;
	} else {
		const points = collisionPoints(circle, line);
		const point1 = points[0];
		const point2 = points[1];

		// if it's the first (upper) point
		if (withinRange(line.yAt(point1[0]), circle.y, point1[1]) ||
		withinRange(line.xAt(point1[1]), circle.x, point1[0])) {
			return true;
		// if it's the second (lower) point
		} else if (withinRange(line.yAt(point2[0]), circle.y, point2[1]) ||
		withinRange(line.xAt(point2[1]), circle.x, point2[0])) {
			return false;
		}
	}
} // end of angledCollisionAbove


// handles player collision with points
function collideWithPoints() {
	const points = [];
	// every end of a line is a point to collide with
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]
		points.push(new Point(line.x1, line.y1));
		points.push(new Point(line.x2, line.y2));
	}
	// for every point
	for (let i = 0; i < points.length; i++) {
		const point = points[i];
		if (!testForPointCollision(player, point)) {
			continue;
		}

		const side1 = point.x - player.x;
		const side2 = point.y - player.y;
		// insert bounce here below
		// don't count it if it's on the very edge
		if (Math.abs(side2) < (player.radius / 12) * 11) {
			// if player's moving toward collision, stop them
			if (side1 > 0 && player.xSpeed > 0) {
				player.xSpeed = 0;
			} else if (side1 < 0 && player.xSpeed < 0) {
				player.xSpeed = 0;
			}
		}
		// don't count it if it's on the very edge
		if (Math.abs(side1 < (player.radius / 12) * 11)) {
			// if player's moving toward collision, stop them
			if (side2 > 0 && player.ySpeed > 0) {
				player.ySpeed = 0;
			} else if (side2 < 0 && player.ySpeed < 0) {
				player.ySpeed = 0;
			}
		}
	}
} // end of collideWithPoints


// tests for collision of a circle with a point
function testForPointCollision(circle, point) {
	const side1 = point.x - circle.x;
	const side2 = point.y - circle.y;
	const hyp = getHyp(side1, side2);
  
	return hyp < circle.radius;
} // end of testForPointCollision


function pointCollisionBelow(circle, point) {
	if (!testForPointCollision(circle, point)) {
		console.log("here");
		return false;
	}
	
	return point.y > circle.y;
}


// ==============
// MISC. MATH
// ==============


// returns the length of the adjacent
// takes degree of the angle and length of hypotenuse
function getAdj(degree, hyp) {
	degree %= 90;
	degree = degreesToRadians(degree);
	return hyp * (Math.cos(degree));
} // end of getAdj


// returns the length of the the opposite
// takes degree of the angle and length of hypotenuse
function getOpp(degree, hyp) {
	degree %= 90;
	degree = degreesToRadians(degree);
	return hyp * (Math.sin(degree));
} // end of getOpp


// returns length of hypotenuse off other 2 side lengths
function getHyp(side1, side2) {
	adj = Math.abs(side1);
  opp = Math.abs(side2);
	return Math.sqrt(Math.pow(adj, 2) + Math.pow(opp, 2));
} // end of getHyp


// returns the slope of the line perpindicular to the given slope
function inverseSlope(x) {
	return -(1 / x);
} // end of invertSlope


// converts radians to degrees
function radiansToDegrees(x) {
	return x * (180 / Math.PI);
} // end of RadiansToDegrees


// converts degrees to radians
function degreesToRadians(x) {
	return x / (180 / Math.PI);
} // end of degreesToRadians


// true if num is between rangeStart and rangeEnd
function withinRange(num, rangeStart, rangeEnd) {
	// order it correctly, so a larger # can be given first
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
	space: false,
	w: false,
	s: false,
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
		case 32:
			keydown.space = true;
			break;
		case 87:
			keydown.w = true;
			break;
		case 83:
			keydown.s = true;
			break;
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
		case 32:
			keydown.space = false;
			break;
		case 87:
			keydown.w = false;
			break;
		case 83:
			keydown.s = false;
			break;
	}
});


// ================
// RESIZING
// ================


// resizes everything in the canvas to stay the same relative to each other
function resize() {
	// saves the canvas dimensions for comparison after
	const prevCanvas = canvas.width + " " + canvas.height;
	// saves what fraction of canvas height player.y is
	const playerHeight = player.y / canvas.height;

	// holds the fractions representing lines' x's and y's
	const lineYs = [];
	const lineXs = [];
	// save for all the lines
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		// for y's, a fraction of the canvas height
		lineYs.push([line.y1 / canvas.height, line.y2 / canvas.height]);
		// for x's, the distance from player to line-point, divided by player.radius
		lineXs.push([(line.x1 - player.x) / player.radius, (line.x2 - player.x) / player.radius]);
	}

	// resize the canvas to fill the whole window
	resizeCanvas();

	// compare the new and old dimensions
	// if no change, end it now
	const currCanvas = canvas.width + " " + canvas.height;
	if (prevCanvas == currCanvas) {
		return;
	}

	// center player horizontally
	player.x = canvas.width / 2;
	// make radius the set fraction of the height
	player.radius = canvas.height * player.screenPercent;
	player.y = canvas.height * playerHeight;
	player.acceleration = player.radius * 6;

	// resizes the lines
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		line.y1 = lineYs[i][0] * canvas.height;
		line.y2 = lineYs[i][1] * canvas.height;

		// multiplied by player radius so it stays on the same scale as player
		const x1Distance = lineXs[i][0] * player.radius;
		const x2Distance = lineXs[i][1] * player.radius;
		// factor in xOffset when changing xStarts
		line.x1Start = (player.x - game.xOffset) + x1Distance;
		line.x2Start = (player.x - game.xOffset) + x2Distance;
	}
	// move the lines, so anything after this still works
	moveLines();
	points = [];
	fillPoints();
} // end of resize


// resizes the canvas to the size of the window
function resizeCanvas() {
	// -20 to get around padding I can't find
	canvas.width = window.innerWidth - 20; 
	canvas.height = window.innerHeight - 20;
} // end of resizeCanvas


function meterPixelRate() {
	// console.log(player.radius, player.radiusActual, player.radius / player.radiusActual);
	return player.radius / player.radiusActual;
} // end of meterPixelRate


// =====================
// MOVING
// =====================


// moves the player vertically, everything else moves horizontally
function movePlayer() {
	// speeds are pixels/second, so it's reduced for how frequently it's happening
	player.y += player.ySpeed / game.fps;
} // end of movePlayer


// counts the seconds
// starts at 1 so there's always some gravity
var timer = 1;

setInterval(()=>{
	timer += 0.5;
}, 500);


// returns if the player is on top of a line
function atRest() {
	let atRest = false;

	// tests against every line
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		// if the line's vertical or there's no collision, skip this one
		if (line.isVertical() || !testForLineCollision(player, line)) {
			continue;
		// if the line's horizontal (and collision)
		} else if (line.isHorizontal()) {
			// at rest if player is above the line
			if (player.y < line.y1) {
				atRest = true;
			}
		// if angled (and colliding)
		} else {
			// if the angled collision's below, it's at rest
			if (!angledCollisionAbove(player, line)) {
				atRest = true;
			}
		}
	}

	// collidePoint.moveTo(points[0].x, points[0].y);

	for (let i = 0; i < points.length; i++) {
		const point = points[i];
		// console.log(testForPointCollision(player, point));
		if (testForPointCollision(player, point) && pointCollisionBelow(player, point)) {
			atRest = true;
		}
	}

	return atRest;
} // end of atRest


// adds gravity to the player's speed when applicable
function fall() {
	// if it's in midair
	if (!atRest()) {
		// apply gravity
		// reversed because the negative direction is opposite of usual
		// console.log(Physics.affectGravity(0, timer, meterPixelRate()) / game.fps);
		
		// player.ySpeed += Physics.affectGravity(0, timer, meterPixelRate()) / game.fps;

		player.ySpeed += Physics.affectGravity(0, timer);
		// console.log(Physics.affectGravity(0, timer));
	// if it's at rest
	} else {
		// reset to 1 to avoid a second of no gravity
		timer = 1;
	}
} // end of fall


function horizontalRollEnergy(energy, degree) {
	let x = degree;
	if (withinRange(x, 0, 90)) {
		return (x * (x - 90)) / (2025 / (0.5 * energy));
	} else {
		x -= 90;
		return -(x * (x - 90)) / (2025 / (0.5 * energy));
	}
	
} // end of horizontalRollEnergy


function roll() {
	if (!atRest()) {return;}

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		// only keep going if it's an angled line, collided on the bottom half of the player
		if (line.isVertical() || line.isHorizontal() 
		|| !testForLineCollision(player, line) || angledCollisionAbove(player, line)) {
			continue;
		}
		let vForce = Physics.affectGravity(0, 1);
		const hForce = horizontalRollEnergy(vForce, line.degree % 180);
		vForce -= Math.abs(hForce);
		// player.ySpeed += vForce;
		// player.xSpeed += hForce;
		// player.y += vForce;
		game.xOffset -= hForce;
		player.y += -(line.yChangeRate * hForce);
		while (testForLineCollision(player, line)) {
			player.y--;
		}
		player.y++;
		// console.log(vForce, hForce);
	}
} // end of roll


// moves the lines (based on player.xSpeed movement)
function moveLines() {
	// for every line
	for (let i = 0; i < lines.length; i++) {
		// adjust their x position
		lines[i].adjustX(game.xOffset);
	}
} // end of moveLines


// =================
// DRAWING
// =================


// clears the canvas to transparent
function clearCanvas(ctx) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
} // end of clearCanvas


// draws in the player, info from player{}
function drawPlayer(ctx) {
	ctx.fillStyle = player.fillColor;
	ctx.beginPath();
	ctx.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
	ctx.fill();
} // end of drawPlayer


// draws in the lines
function drawLines() {
	for (let i = 0; i < lines.length; i++) {
		lines[i].draw(ctx);
	}
} // end of drawLines

// resize it before starting
resizeCanvas();
// center player
player.x = canvas.width / 2;
// size the player correctly
player.radius = canvas.height * player.screenPercent;

// the animate loop, cycles everything
const animateID = setInterval(() => {
	resize();
	// called here so collision still works
	moveLines();

	propelPlayer();
	friction(player);
	collideWithLines();
	collideWithPoints();
	
	game.xOffset -= player.xSpeed / game.fps;

	movePlayer();
	moveLines();
	fillPoints();

	fall();
	// console.log(atRest());
	roll();

	clearCanvas(ctx);
	drawLines();
	drawPlayer(ctx);
	// collidePoint.draw(ctx);

}, 1000 / game.fps); // 1000 is 1 second


