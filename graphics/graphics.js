const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');


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

	get isVertical() {
		return (this.x1 == this.x2);
	}

	get isHorizontal() {
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
		//is this bit of code stil in use for redundancy or was it just for testing?
		if (xChange == 0) {
			console.log("ERROR: 0 value in xChange");
			return;
		}
		return yChange / xChange;
	}

	// returns the y value on the line at the given x
	yAt(x) {
		if (!Line.withinRange(x, this.x1, this.x2) || this.isVertical) {return;}
		if (this.isHorizontal) {return this.y1;}

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
		if (!Line.withinRange(y, this.y1, this.y2) || this.isHorizontal) {return;}
		if (this.isVertical) {return this.x1;}

		const x = this.x1 + (this.xChangeRate * (y - this.y1));
		return x;
	}

	get degree() {
		if (this.isVertical) {
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
	// gravityForce: 0, // updated by fall() // no longer in use
};


const player = {
	x: 100,
	y: 100,
	radius: 25,
	xSpeed: 0,
	// the above is updated with the sum of the below
	xSpeeds: {
		rollDown: 0,
		rollUp: 0,
		// the regular moving-to-the-side force (from arrow keys directly)
		normal: 0,
	},
	ySpeed: 0,
	// the above is updated with the sum of the below
	ySpeeds: {
		gravity: 0,
		rollDown: 0,
		rollUp: 0,
	},
	acceleration: 150,
	fillColor: "#e2619f", // pink
	screenPercent: 0.035, // 3.5% of the height
	radiusActual: 0.1016, // 4 inches in meters
	weightActual: "idk", // in kilograms?
	// tracks which directions it's blocked by something
	blocked: {
		up: false,
		down: false,
		left: false,
		right: false,
	},
};

// holds all the lines and points the player can collide with
const lines = [];
let points = [];

const testLine = new Line(1000, 2000, 500, 0, game.xOffset);
// const testLine2 = new Line(500, 700, 200, 0);
const ground = new Line(0, 1000, 300, 500, game.xOffset);

const collidePoint = new Point(0, 0);

lines.push(testLine);
// lines.push(testLine2);
lines.push(ground);


//can be moved to physics
// ====================
// SPEED CHANGES
// ====================

// reduces player's speed
function frictionPlayer() {
	// for every ySpeed
	for (key in player.ySpeeds) {
		// apply friction to rollDown and rollUp only
		if (key == "rollDown" || key == "rollUp") {
			player.ySpeeds[`${key}`] -= (player.ySpeeds[`${key}`] * game.frictionRate) / game.fps;
		}
		// round to zero if it's tiny
		if (Math.abs(player.ySpeeds[`${key}`]) < 1) {player.ySpeeds[`${key}`] = 0;}
	}

	// for every xSpeed
	for (key in player.xSpeeds) {
		// apply friction
		player.xSpeeds[`${key}`] -= (player.xSpeeds[`${key}`] * game.frictionRate) / game.fps;
		// round to 0 if it's tiny
		if (Math.abs(player.xSpeeds[`${key}`]) < 1) {player.xSpeeds[`${key}`] = 0;}
	}
} // end of frictionPlayer


// propels the player based on arrow keys & adjusts speed based on external elements
function propelPlayer() {
	updatePlayerSpeeds();
	// hold the speed seperately for testing
	let xSpeed = player.xSpeeds.normal;
	// add the new input speed
	if (keydown.left) {
		xSpeed -= player.acceleration / game.fps;
	}
	if (keydown.right) {
		xSpeed += player.acceleration / game.fps;
	}
	// avoids dividing by zero in rollUp()
	if (xSpeed == 0) {
		player.xSpeeds.normal = xSpeed;
		return;
	}

	// keep track of if the energy's been used
	let rollUpSignal = false;
	for (let i = 0; i < lines.length; i++) {
		if (rollUp(lines[i], xSpeed)) {
			rollUpSignal = true;
		}
	}
	// if it hasn't been used in rollUp, put it into the normal speed
	if (!rollUpSignal) {
		player.xSpeeds.normal = xSpeed;
	// if it's been used, zero out normal speed
	} else {
		player.xSpeeds.normal = 0;
	}
} // end of propelPlayer



// ==================
// COLLISION
// ==================


// handles player collision with lines
// doesn't handle collision with the point on the end of the line
function collideWithLines() {
	updatePlayerSpeeds();
	for (const key in player.blocked) {
		player.blocked[`${key}`] = false
	}
	// if player runs into a line, it can't move in that direction
	// tests the player against every line
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		// if they aren't colliding, skip this one
		if (!testForLineCollision(player, line)) {
			continue;
		}
		// ========== VERTICAL ===========

		if (line.isVertical) {

			// if player's to the left, stop moving right
			if (player.x < line.x1 && player.xSpeed > 0) {
				game.xOffset += player.radius - (line.x1 - player.x);
				game.xOffset--;
				player.blocked.right = true;
			// if player's to the right, stop moving left
			} else if (player.x > line.x1 && player.xSpeed < 0) {
				game.xOffset -= player.radius - (player.x - line.x1);
				game.xOffset++;
				player.blocked.left = true;
			}
			// reverse horizontal direction, with reduced speed
			playerXBounce();

		// =========== HORIZONTAL =============

		} else if (line.isHorizontal) {

			// if player's lower, bounce back
			if (player.y > line.y1 && player.ySpeed < 0) {
				player.y += player.radius - (player.y - line.y1);
				player.y--;
				player.blocked.up = true;
			// if player's higher, bounce back
			} else if (player.y < line.y1 && player.ySpeed > 0) {
				player.y -= player.radius - (line.y1 - player.y);
				player.y++;
				player.blocked.down = true;
			}
			// reverse vertical speed, with less speed
			// game.gravityForce = -Physics.bounceMomentumLoss(game.gravityForce);
			player.ySpeeds.gravity = -Physics.bounceMomentumLoss(player.ySpeeds.gravity);

		// ======== ANGLED ==========

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
					// bounce all the x speeds, and gravity
					if (player.xSpeed > 0) {playerXBounce();}
					if (player.ySpeeds.gravity < 0) {player.ySpeeds.gravity = -Physics.bounceMomentumLoss(player.ySpeeds.gravity);}
					// move diagonally away from the line until not touching anymore
					while (testForLineCollision(player, line)) {
						game.xOffset++; // reverse
						line.adjustX(game.xOffset);
						player.y++;
					}
					player.y--;
					game.xOffset--;
					// no up or right
					player.blocked.up = true;
					player.blocked.right = true;
					break;
				case withinRange(collideDegree, 90, 180):
					if (player.xSpeed < 0) {playerXBounce();}
					if (player.ySpeeds.gravity < 0) {player.ySpeeds.gravity = -Physics.bounceMomentumLoss(player.ySpeeds.gravity);}
					// move diagonally away from the line until not touching anymore
					while (testForLineCollision(player, line)) {
						game.xOffset--; // reverse
						line.adjustX(game.xOffset);
						player.y++;
					}
					player.y--;
					game.xOffset++;
					// no up or left
					player.blocked.up = true;
					player.blocked.left = true;
					break;
				case withinRange(collideDegree, 180, 270):
					if (player.xSpeed < 0) {playerXBounce();}
					if (player.ySpeeds.gravity > 0) {player.ySpeeds.gravity = -Physics.bounceMomentumLoss(player.ySpeeds.gravity);}
					// move diagonally away from the line until not touching anymore
					while (testForLineCollision(player, line)) {
						game.xOffset--; // reverse
						line.adjustX(game.xOffset);
						player.y--;
					}
					player.y++;
					game.xOffset++;
					// no down or left
					player.blocked.down = true;
					player.blocked.left = true;
					break;
				case withinRange(collideDegree, 270, 360):
					if (player.xSpeed > 0) {playerXBounce();}
					if (player.ySpeeds.gravity > 0) {player.ySpeeds.gravity = -Physics.bounceMomentumLoss(player.ySpeeds.gravity);}
					// move diagonally away from the line until not touching anymore
					while (testForLineCollision(player, line)) {
						game.xOffset++; // reverse
						line.adjustX(game.xOffset);
						player.y--;
					}
					player.y++;
					game.xOffset--;
					// no down or right
					player.blocked.down = true;
					player.blocked.right = true;
					break;
			}
		}
	}	
} // end of collideWithLines


// returns whether a circle is colliding with a line
function testForLineCollision(circle, line) {
	// gets the points where they would collide
	const points = collisionPoints(circle, line);
	const point1 = points[0];
	const point2 = points[1];

	// if the point on the line is between a collision point and the 
	// center of the circle, (on the x or y), they're colliding
	if (withinRange(line.yAt(point1[0]), circle.y, point1[1]) ||
	withinRange(line.xAt(point1[1]), circle.x, point1[0])) {
		return true;
	} else if (withinRange(line.yAt(point2[0]), circle.y, point2[1]) ||
	withinRange(line.xAt(point2[1]), circle.x, point2[0])) {
		return true;
	}
	// otherwise, they're not
	return false;
} // end of testForLineCollision


// returns the degree of the point on a circle that would collide with a line of given slope
function collisionDegree(slope) {
	let degree = radiansToDegrees(Math.atan(inverseSlope(slope)));
	// it's a weird kind of opposite from normal graphs, so subtract it from 180
	if (slope >= 0) {
		degree = 180 - Math.abs(degree);
	}
	return degree;
} // end of collisionDegree


// returns the (x, y)'s of the points on a circle that would collide with a line
function collisionPoints(circle, line) {
	const hyp = circle.radius;
	const adjs = [];
	const opps = [];

	let degree1;
	// avoids dividing by 0
	if (line.isVertical) {
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
// tests if a collision between the circle and line is on top of the circle
// gives false negatives, a false could be bottom collision or no collision so be careful
function angledCollisionAbove(circle, line) {
	// no vertical or horizontal
	if (line.isVertical || line.isHorizontal) {return;}

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
} // end of angledCollisionAbove


// handles player collision with points
// == currently does nothing, (changing xSpeed directly is outdated), awaiting updating ==
function collideWithPoints() {
	updatePlayerSpeeds();
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
		return false;
	}
	
	return point.y > circle.y;
}

//can be moved to physics
// ==============
// BOUNCE
// ==============

// called only with confirmed collision
function playerXBounce() {
	// only bounces the normal currently
	player.xSpeeds.normal = -Physics.bounceMomentumLoss(player.xSpeeds.normal);
} // end of playerXBounce


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


// returns +1 if positive, -1 if negative
function getSign(num) {
	return num / Math.abs(num);
} // end of getSign


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
			// movePlayer();
			// moveLines();
			// fall();
			// roll();
			// updatePlayerSpeeds();
			// console.log(player.xSpeeds, player.ySpeeds);
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

//================
//LASSOING
//================
	
	//***btw I haven't tested this yet, just committing it so that it doesn't get overwritten by github later
	var intervalId; 
	var forceX = 0;
	var forceY = 0;
	addEventListener('mousedown', (e)=>{intervalId= setInterval(()=>
		{
			//adds fraction of x component and y component of slope to cursor point each time
			forceX+= (e.clientX-player.x)/100;//100 is a random number, will figure out something better later
			forceY+= (e.clientY-player.y)/100;
			Lasso.drawPreLasso(player.x, player.y, forceX, forceY, ctx);
		}
	)});
	addEventListenter('mouseUp', (e)=>{clearInterval(intervalId)});
	//clears interval afterwards
	//there's got to be a better way to do this so that it doesn't repeat every time


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
	let yMoved = false;
	let xMoved = false;

	updatePlayerSpeeds();

	// speeds are pixels/second, so it's reduced for how frequently it's happening
	game.xOffset -= player.xSpeed / game.fps;
	xMoved = true;

	// console.log(player.xSpeeds.rollUp);
	
	player.y += player.ySpeed / game.fps;
	yMoved = true;
} // end of movePlayer


// counts the seconds
// starts at 1 so there's always some gravity
var timer = 1;

setInterval(()=>{
	timer += 0.1;
}, 100);


// returns if the player is on top of a line
function atRest() {
	let atRest = false;

	// tests against every line
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		// if the line's vertical or there's no collision, skip this one
		if (line.isVertical || !testForLineCollision(player, line)) {
			continue;
		// if the line's horizontal (and collision)
		} else if (line.isHorizontal) {
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
		player.ySpeeds.gravity += Physics.affectGravity(0, timer);

	// if it's at rest
	} else {
		// only reset the second time it's checked while at rest
		if (timer == 1) {
			player.ySpeeds.gravity = 0;
		}

		// reset gravity so it doesn't build
		// reset to 1 to avoid a second of no gravity
		timer = 1;
	}
} // end of fall


// moves the lines (based on player.xSpeed movement)
function moveLines() {
	// for every line
	for (let i = 0; i < lines.length; i++) {
		// adjust their x position
		lines[i].adjustX(game.xOffset);
	}
} // end of moveLines


// updates the main speeds in player
function updatePlayerSpeeds() {
	// add up all the speeds in xSpeeds and ySpeeds sub-objects of player
	let ySpeed = 0;
	let xSpeed = 0;
	for (key in player.ySpeeds) {
		ySpeed += player.ySpeeds[`${key}`];
	}
	for (key in player.xSpeeds) {
		xSpeed += player.xSpeeds[`${key}`];
	}
	// and set them
	player.ySpeed = ySpeed;
	player.xSpeed = xSpeed;
} // end of updatePlayerSpeeds


// =================
// ROLLING
// =================


// handles player rolling on angled lines
function roll() {
	// only runs when resting on a line
	if (!atRest()) {return;}

	// for every line
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		// possibly redundant to have nested functions, keeping it for now though
		rollDownNatural(line);
	}
} // end of roll


// returns the amount of energy of the input should go into moving horizontally,
// based on the given line slope
// (insert roll) replace this with actual roll physics at some point
function horizontalRollDownEnergy(energy, degree) {
	let x = degree; // for simple reference
	// if it's from 0-90, return the positive
	if (withinRange(x, 0, 90)) {
		return (x * (x - 90)) / (2025 / (0.5 * energy));
	// else: subtract 90, and make the result negative
	} else {
		x -= 90;
		return -(x * (x - 90)) / (2025 / (0.5 * energy));
	}
} // end of horizontalRollEnergy


// adds speed to roll player down the given line
function rollDownNatural(line) {
	updatePlayerSpeeds();
	// only keep going if it's an angled line, collided on the bottom half of the player
	if (line.isVertical || line.isHorizontal 
	|| !testForLineCollision(player, line) || angledCollisionAbove(player, line)) {
		return;
	}
	// (insert actual rolling physics here if we have it) (insert roll)
	// get the starting amount of gravity
	let vForce = Physics.affectGravity(0, 1);
	// get the horizontal energy based on the downward force and how steep the line is
	// (moduloed by 180 cause 30 degrees and 210 degrees are the same line)
	const hForce = horizontalRollDownEnergy(vForce, line.degree % 180);
	vForce -= Math.abs(hForce);

	// if moving right and blocked
	if (hForce > 0 && player.blocked.right) {
		// zero the speed, and return
		if (player.ySpeeds.rollDown > 0) {player.ySpeeds.rollDown = 0;}
		if (player.xSpeeds.rollDown > 0) {player.xSpeeds.rollDown = 0;}
		return;
	// if moving left and blocked
	} else if (hForce < 0 && player.blocked.left) {
		// zero the speed and return
		if (player.ySpeeds.rollDown > 0) {player.ySpeeds.rollDown = 0;}
		if (player.xSpeeds.rollDown < 0) {player.xSpeeds.rollDown = 0;}
		return;
	}
	// if it's able to move, add the horizontal speed
	player.xSpeeds.rollDown += hForce;
	// and add the necessary amount of vertical speed to get to the lower point on the line
	player.ySpeeds.rollDown = line.yChangeRate * player.xSpeeds.rollDown;
} // end of rollDownNatural


// rolls player up the line given, based on force given
function rollUp(line, force) {
	// only keep going if it's an angled line, collided on the bottom half of the player
	if (line.isVertical || !testForLineCollision(player, line)
	|| angledCollisionAbove(player, line) || line.isHorizontal) {
		return false;
	}

	let yChange = line.yChangeRate;
	// if this line doesn't block in the direction it's moving
	if ((yChange > 0 && force > 0) || (yChange < 0 && force < 0)) {
		// if it's not currently rolling up, don't bother
		if (player.xSpeeds.rollUp == 0) {return false;}
		// if it's not being blocked, but pushing in the direction it's already rolling, don't bother
		if (getSign(player.xSpeeds.rollUp) == getSign(force)) {
			return false;
		}
	}
	// finds the fraction of the energy to give to each part based on yChange
	// adds enough speed to get to a point higher on the line

	// if the push is going downhill, the rollUp code below works for taking away from
	// rollUp speed as well

	// add yChange and 1 to find the total
	const totalEnergy = Math.abs(yChange) + 1;
	// put it in a ratio with the amount of the total that's horizontal
	const vFraction = yChange / totalEnergy;
	// or vertical
	let hFraction = (1 / totalEnergy);

	// add to the rollUp xSpeed
	player.xSpeeds.rollUp += hFraction * force;
	// set the rollUp ySpeed to match the current xSpeed
	player.ySpeeds.rollUp = (player.xSpeeds.rollUp / hFraction) * vFraction;
	// send a message that the energy's been used
	return true;
} // end of rollUp


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
function drawLines(ctx) {
	for (let i = 0; i < lines.length; i++) {
		lines[i].draw(ctx);
	}
} // end of drawLines


function draw(ctx) {
	clearCanvas(ctx);
	drawLines(ctx);
	drawPlayer(ctx);
	// collidePoint.draw(ctx);
} // end of ctx


// resize it before starting
resizeCanvas();
// center player
player.x = canvas.width / 2;
// size the player correctly
player.radius = canvas.height * player.screenPercent;



//==================================
//ANIMATE LOOP
//==================================

// the animate loop, cycles everything
const animateID = setInterval(() => {

	resize();
	updatePlayerSpeeds();
	// called here so collision still works
	moveLines();

	propelPlayer();
	if (atRest()) {
		frictionPlayer();
	}
	collideWithLines();
	collideWithPoints();

	movePlayer();
	moveLines();
	fillPoints();

	fall();
	roll();

	draw(ctx);
	// updatePlayerSpeeds();
	// console.log(Math.round(player.xSpeed), Math.round(player.ySpeed));
	console.log(player.xSpeeds, player.ySpeeds);
}, 1000 / game.fps); // 1000 is 1 second


