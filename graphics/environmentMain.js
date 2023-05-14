// // gets the canvas that we'll do everything on initialized
// const canvas = document.getElementById('canvas');
// // the part we'll actually call all the drawing on
// const ctx = canvas.getContext('2d');

//I'm not sure where the background behind the level image is set but could we switch it to #ffe0f0 so that all the pink backgrounds are similar shades?


// ==================
// =DATA OBJECTS
// ==================


//needed to move the variables since just linking the environment main file to 
//other non-level files to access them throws errors since there's no canvas

// holds some general variables that are handy to keep together
const game = {
	fps: 35,
	xOffset: 0,
	frictionRate: .6,
	idList: [],
	background: undefined,
	lines: [],
	points: [],
	level:undefined,
	levelEndPoint: undefined,
	music: true,
	sfx: true,
	canvas: undefined,
	ctx: undefined,
	maxLevel: 2,
};

// holds all the player information
// turns out hank is complicated
const player = {
	// for ease of drawing and moving (x, y, radius)
	// shape: new Circle(100, 100, 25), // the object that's drawn on the canvas, for simplicity
	shape: undefined, // the object that's drawn on the canvas, for simplicity
	// keeps track of where it just was for trajectory calculations
	prevX: 100,
	prevY: 100,
	xSpeed: 0, // horizontal speed in [px/s]
	// the above is updated with the sum of the below
	xSpeeds: {
		rollDown: 0, // x speed when rolling down a line
		rollUp: 0, // x speed when rolling up a line
		normal: 0, // the regular moving-to-the-side force (from arrow keys directly)
	},
	ySpeed: 0, // vertical speed in [px/s]
	// the above is updated with the sum of the below
	ySpeeds: {
		gravity: 0,
		// both y rolls updated to match their x counterparts
		rollDown: 0,
		rollUp: 0,
	},
	// how much speed it can gain, set elsewhere [in resize()]
	acceleration: 300,
	fillColor: "#ffe0f0", // pink // this doesn't show when the drawing's in place // i'm using it for yarn color
	screenPercent: 0.04, // 4% of the height of the canvas
	radiusActual: 0.1016, // 4 inches in meters // used for physics calculations
	unravelPercent: 1.0, // 1.0 = not unraveled, 0 = completely unraveled
	// tracks which directions it's blocked by something
	blocked: {
		up: false,
		down: false,
		left: false,
		right: false,
	},
	// tracks which directions it's stopped moving by something
	stopped: {
		up: false,
		down: false,
		left: false,
		right: false,
	},
	rotation: 0, // degrees // keeps track of how much it's spun
	pauseSpin: false, // if it should stop visually spinning
	lasso: undefined,
	yarnTrail: undefined,
};



// gathered all the loose setup code into this function, called from each html file
// input the lines to draw for that level, file path for background art, and x and y the player should start at
function setup(linesArray, backgroundPath) {
	game.canvas = document.getElementById('canvas');
	game.ctx = game.canvas.getContext('2d');

	xOffsetStart = 430; // cor if you have the issue again uncomment this line
	// center player
	player.shape = new Circle(game.canvas.width / 2, 400, game.canvas.height * player.screenPercent * player.unravelPercent);
	// player.shape.x = game.canvas.width / 2;
	// player.shape.y = 400;
	// // size the player correctly
	// player.shape.radius = game.canvas.height * player.screenPercent * player.unravelPercent;
	
	//MAY NEED TO UNCOMMENT THIS, CHANGED SO IT WORKS ON MY COMPUTER (comment in capitals so it's easier to find)
	//player.shape.y = playerY;

	// makes line objects from the (x, y) points in the array
	createLines(linesArray, xOffsetStart);

	// create the lasso
	player.lasso = new Lasso2();

	Lasso.resetForceBase();
	player.lasso.resetForceBase();

	// sets the background image with the file provided
	game.background = new Background(backgroundPath, xOffsetStart, 0, game.canvas.height);

	//ALSO UNCOMMENTED THIS FOR THE MOMENT- IN CASE I FORGET TO REVERT IT BEFORE PUSHING
	// creates the yarn trail
	//player.yarnTrail = new YarnTrail(yarnCoords, game.xOffset);

	main();
} // end of setup


// creates actual line objects from the [x, y], [x, y] points provided in the array
function createLines(pointsArray, offset) {
	// for every set (line)
	for (let i = 0; i < pointsArray.length; i++) {
		const set = pointsArray[i];
		// pass the points into the constructor
		const newLine = new Line(set[0][0] + offset, set[0][1], set[1][0] + offset, set[1][1], 0);
		// console.log(offset);
		game.lines.push(newLine);
	}
} // end of createLines



// can be moved to physics
// ====================
// =SPEED CHANGES
// ====================


// reduces player's speed
function frictionPlayerX() {
	// for every xSpeed
	for (key in player.xSpeeds) {
		// apply friction
		player.xSpeeds[`${key}`] -= (player.xSpeeds[`${key}`] * game.frictionRate) / game.fps;
		// round to 0 if it's tiny
		if (Math.abs(player.xSpeeds[`${key}`]) < 1) {player.xSpeeds[`${key}`] = 0;}
	}
} // end of frictionPlayer


function frictionPlayerY() {
	const harshness = 20;
	player.ySpeeds.rollUp -= (player.ySpeeds.rollUp * game.frictionRate * harshness) / game.fps;
	player.ySpeeds.rollDown -= (player.ySpeeds.rollDown * game.frictionRate * harshness) / game.fps;
	if (Math.abs(player.ySpeeds.rollUp) < 1) {player.ySpeeds.rollUp = 0;}
	if (Math.abs(player.ySpeeds.rollDown) < 1) {player.ySpeeds.rollDown = 0;}
}


// can use arrows or aswd
// propels the player based on arrow keys & adjusts speed based on external elements
function propelPlayer() {
	updatePlayerSpeeds();
	// hold the speed seperately for testing
	let xSpeed = player.xSpeeds.normal;
	// holds the change amount seperately
	let speedChange = 0;
	// add the new input speed - unless stopped in that direction (by vertical line)
	if ((keydown.left || keydown.a) && !player.stopped.left) {
		xSpeed -= player.acceleration / game.fps;
		speedChange -= player.acceleration / game.fps;
	}
	if ((keydown.right || keydown.d) && !player.stopped.right) {
		xSpeed += player.acceleration / game.fps;
		speedChange += player.acceleration / game.fps;
	}
	// avoids dividing by zero in later function calls
	if (xSpeed == 0) {xSpeed = 0.00001;}

	// if (keydown.w) { // tried to jump
	// 	player.ySpeeds.gravity -= 10 / game.fps;
	// }

	// keep track of if the energy's been used
	let rollUpSignal = false;
	for (let i = 0; i < game.lines.length; i++) {
		if (rollUp(player, game.lines[i], xSpeed)) {
			rollUpSignal = true;
			break;
		}
	}

	// if the energy's been used by rollUp, end it
	if (rollUpSignal) {
		player.xSpeeds.normal = 0;
		return;
	}

	// if not, try rolling down
	let rollDownSignal = false;
	for (let i = 0; i < game.lines.length; i++) {
		if (rollDown(player, game.lines[i], xSpeed)) {
			rollDownSignal = true;
		}
	}

	// if it hasn't been used in rollUp or rollDown, put it into the normal speed
	if (!rollDownSignal) {
		// player.xSpeeds.normal = xSpeed;
		player.xSpeeds.normal += speedChange;
	// if it's been used, zero out normal speed
	} else {
		player.xSpeeds.normal = 0;
		if (getSign(player.xSpeeds.rollDown) == getSign(player.xSpeeds.rollUp)) {
			// player.xSpeeds.rollUp = 0;
		}
	}
} // end of propelPlayer



// ==================
// =COLLISION
// ==================


// handles player collision with lines
// doesn't handle collision with the point on the end of the line
function collideWithLines() {
	updatePlayerSpeeds();

	player.pauseSpin = false;

	// reset all those
	for (const key in player.blocked) {
		player.blocked[`${key}`] = false
	}
	for (const key in player.stopped) {
		player.stopped[`${key}`] = false;
	}
	// tests the player against every line
	for (let i = 0; i < game.lines.length; i++) {

		const line = game.lines[i];
		collideWithLine(line);

	}
} // end of collideWithLines


function collideWithLine(line) {
	// if they aren't colliding, skip this one
		if (!testForLineCollision(player, line)) {
			return;
		}
		// ========== VERTICAL ===========

		if (line.isVertical) {

			// if player's to the left, stop moving right
			if (player.shape.x < line.x1 && player.xSpeed > 0) {
				game.xOffset += player.shape.radius - (line.x1 - player.shape.x);
				player.blocked.right = true;
				player.stopped.right = true;
				player.pauseSpin = true;
				// temporary
				// for (let i = 0; i < player.xSpeeds.length; i++) {
				// 	player.xSpeeds[i] = 0;
				// }
			// if player's to the right, stop moving left
			} else if (player.shape.x > line.x1 && player.xSpeed < 0) {
				game.xOffset -= player.shape.radius - (player.shape.x - line.x1);
				player.blocked.left = true;
				player.stopped.left = true;
				player.pauseSpin = true;
				// temporary
				// for (let i = 0; i < player.xSpeeds.length; i++) {
				// 	player.xSpeeds[i] = 0;
				// }
			}

		// =========== HORIZONTAL =============

		} else if (line.isHorizontal) {

			// if player's lower, bounce back
			if (player.shape.y > line.y1 && player.ySpeed < 0) {
				player.shape.y += player.shape.radius - (player.shape.y - line.y1);
				player.shape.y--;
				player.blocked.up = true;
			// if player's higher, bounce back
			} else if (player.shape.y < line.y1 && player.ySpeed > 0) {
				player.shape.y -= player.shape.radius - (line.y1 - player.shape.y);
				player.shape.y++;
				player.blocked.down = true;
			}

		// ======== ANGLED ==========

		} else {
			const points = collisionPoints(player, line);
			const point1 = points[0];
			const point2 = points[1];

			let collideDegree;

			// if it's the first point (upper half)
			if (withinRange(line.yAt(point1[0]), player.shape.y, point1[1]) ||
		withinRange(line.xAt(point1[1]), player.shape.x, point1[0])) {
				// get the degree
				collideDegree = collisionDegree(-line.yChangeRate);
			// if it's the second point (lower half)
			} else if (withinRange(line.yAt(point2[0]), player.shape.y, point2[1]) ||
			withinRange(line.xAt(point2[1]), player.shape.x, point2[0])) {
				// get the degree, and add 180 to go to the other side
				collideDegree = collisionDegree(-line.yChangeRate) + 180;
			}

			// test against the 4 90-degree segments of the circle
			switch (true) {
				case withinRange(collideDegree, 0, 90):
					// move diagonally away from the line until not touching anymore
					while (testForLineCollision(player, line)) {
						game.xOffset++;
						line.adjustX(game.xOffset);
						player.shape.y++;
					}
					// then move back to touch it by one
					player.shape.y--;
					game.xOffset--;
					// no up or right
					player.blocked.up = true;
					player.blocked.right = true;
					break;
				case withinRange(collideDegree, 90, 180):
					// move diagonally away from the line until not touching anymore
					while (testForLineCollision(player, line)) {
						game.xOffset--; // reverse
						line.adjustX(game.xOffset);
						player.shape.y++;
					}
					player.shape.y--;
					game.xOffset++;
					// no up or left
					player.blocked.up = true;
					player.blocked.left = true;
					break;
				case withinRange(collideDegree, 180, 270):
					// move diagonally away from the line until not touching anymore
					while (testForLineCollision(player, line)) {
						game.xOffset--; // reverse
						line.adjustX(game.xOffset);
						player.shape.y--;
					}
					player.shape.y++;
					game.xOffset++;
					// no down or left
					player.blocked.down = true;
					player.blocked.left = true;
					break;
				case withinRange(collideDegree, 270, 360):
					// move diagonally away from the line until not touching anymore
					while (testForLineCollision(player, line)) {
						game.xOffset++; // reverse
						line.adjustX(game.xOffset);
						player.shape.y--;
					}
					player.shape.y++;
					game.xOffset--;
					// no down or right
					player.blocked.down = true;
					player.blocked.right = true;
					break;
			}
		}
} // end of collideWithLine


// returns whether a circle is colliding with a line
function testForLineCollision(circle, line) {
	const c = circle.shape;
	// gets the points where they would collide
	const points = collisionPoints(circle, line);
	const point1 = points[0];
	const point2 = points[1];

	// if the point on the line is between a collision point and the 
	// center of the circle, (on the x or y), they're colliding
	if (withinRange(line.yAt(point1[0]), c.y, point1[1]) ||
	withinRange(line.xAt(point1[1]), c.x, point1[0])) {
		return true;
	} else if (withinRange(line.yAt(point2[0]), c.y, point2[1]) ||
	withinRange(line.xAt(point2[1]), c.x, point2[0])) {
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
	const c = circle.shape;
	const hyp = c.radius;
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
				points.push([c.x + adjs[i], c.y - opps[i]]);
				break;
			case withinRange(degrees[i], 90, 180):
				points.push([c.x - adjs[i], c.y - opps[i]]);
				break;
			case withinRange(degrees[i], 180, 270):
				points.push([c.x - adjs[i], c.y + opps[i]]);
				break;
			case withinRange(degrees[i], 270, 360):
				points.push([c.x + adjs[i], c.y + opps[i]]);
				break;
		}
	}
	return points;
} // end of collisionPoints


// for angled lines only
// tests if a collision between the circle and line is on top of the circle
// gives false negatives, a false could be bottom collision or no collision so be careful
function angledCollisionAbove(circle, line) {
	const c = circle.shape;
	// no vertical or horizontal
	if (line.isVertical || line.isHorizontal) {return;}

	const points = collisionPoints(circle, line);
	const point1 = points[0];
	const point2 = points[1];

	// if it's the first (upper) point
	if (withinRange(line.yAt(point1[0]), c.y, point1[1]) ||
	withinRange(line.xAt(point1[1]), c.x, point1[0])) {
		return true;
	// if it's the second (lower) point
	} else if (withinRange(line.yAt(point2[0]), c.y, point2[1]) ||
	withinRange(line.xAt(point2[1]), c.x, point2[0])) {
		return false;
	}
} // end of angledCollisionAbove


// handles player collision with points
function collideWithPoints() {
	updatePlayerSpeeds();
	movePoints();

	// for every point
	for (let i = 0; i < game.points.length; i++) {
		const point = game.points[i];

		if (!testForPointCollision(player.shape, point)) {
			continue;
		}

		const collideLine = collisionPointToLine(player, point);
		collideWithLine(collideLine);
	}
} // end of collideWithPoints


function fillPoints() {
    game.points = [];
    for (let i = 0; i < game.lines.length; i++) {
        game.points.push(new Point(game.lines[i].x1, game.lines[i].y1));
        game.points.push(new Point(game.lines[i].x2, game.lines[i].y2))
    }
} // end of fillPoints


// // stops the circle from overlapping the line it's just collided with
// function resolveCollisionOverlap(circle, line) {
// 	const bounceDegree = getBounceDegree(circle, line);
// 	const sides = getBounceSides(circle, line, bounceDegree);

// 	if (sides == false) {
// 		// console.log("resolveCollisionOverlap");
// 		return;
// 	}

// 	const totalFraction = Math.abs(sides[0]) + Math.abs(sides[1]);


// 	while (testForLineCollision(circle, line)) {
// 		game.xOffset -= sides[0] / totalFraction;
// 		line.adjustX(game.xOffset);
// 		circle.shape.y += sides[1] / totalFraction;
// 	}
// }


function resolveVerticalOverlap(circle, line) {
	if (!line.isVertical || !testForLineCollision(circle, line)) {return;}
	console.log("here");

	// if player's to the left, stop moving right
	if (player.shape.x < line.x1 && player.xSpeed > 0) {
		game.xOffset += player.shape.radius - (line.x1 - player.shape.x);
		player.blocked.right = true;
		player.pauseSpin = true;
	// if player's to the right, stop moving left
	} else if (player.shape.x > line.x1 && player.xSpeed < 0) {
		game.xOffset -= player.shape.radius - (player.shape.x - line.x1);
		player.blocked.left = true;
		player.pauseSpin = true;
	}
	movePlayer();
	moveLines();
	game.background.updateOffset(game.xOffset);
	fillPoints();
} // end of resolveVerticalOverlap


// tests for collision of a circle with a point
function testForPointCollision(circle, point) {
	const side1 = point.x - circle.x;
	const side2 = point.y - circle.y;
	const hyp = getHyp(side1, side2);
  
	return hyp <= circle.radius;
} // end of testForPointCollision


function pointCollisionBelow(circle, point) {
	if (!testForPointCollision(circle, point)) {
		return false;
	}
	
	return point.y > circle.y;
} // end of pointCollisionBelow


//can be moved to physics
// ==============
// =BOUNCE
// ==============


// finds the degree the circle should bounce away from the line at
function getBounceDegree(circle, line) {
	if (!testForLineCollision(circle, line)) {return;}

	let diff = Math.abs(circle.prevX) - Math.abs(game.xOffset);
	if (game.xOffset < 0) {diff = -diff;}

	const prevPath = new Line(circle.shape.x - diff, circle.prevY, circle.shape.x, circle.shape.y, 0);
	const lineDegree = line.degree;
	const degreeDifference = line.degree - prevPath.degree;

	return (lineDegree + 180) - degreeDifference;
} // end of getBounceDegree



function getBounceSides(circle, line, bounceDegree) {
	if (!testForLineCollision(circle, line)) {return false;}
	// gets the 2 direction combination options
	const sides1 = getSides(bounceDegree, 10);

	sides1[0] = Math.abs(sides1[0]);
	if (!withinRange(bounceDegree, 90, 270)) {
		sides1[0] = -sides1[0];
	}
	sides1[1] = Math.abs(sides1[1]);
	if (withinRange(bounceDegree, 0, 180)) {
		sides1[1] = -sides1[1];
	}

	const sides2 = [-sides1[0], -sides1[1]];
	// get them as points to compare to the intersection point
	const point1 = [circle.shape.x + sides1[0], circle.shape.y + sides1[1]];
	const point2 = [circle.shape.x + sides2[0], circle.shape.y + sides2[1]];
	// the line the circle will travel along
	const currPath = new Line(point1[0], point1[1], point2[0], point2[1], 0);

	// get where the current path intersects with the colliding line
	let crossPoint;
	// if neither are vertical
	if (!line.isVertical && !currPath.isVertical) {
		// get the normal point of intersection
		crossPoint = pointOfIntersection(line.slopeIntercept, currPath.slopeIntercept);
	// if both are vertical, error
	} else if (line.isVertical && currPath.isVertical) {
		// console.log("2 vertical lines in getBounceSides");
		return false;
	// if one of them is vertical, pass it to a special intersection function
	// since a vertical line doesn't have a slope intercept form
	} else {
		if (line.isVertical) {
			crossPoint = pointOfIntersectionWithVertical(currPath.slopeIntercept, line.x1);
		} else if (currPath.isVertical) {
			crossPoint = pointOfIntersectionWithVertical(line.slopeIntercept, currPath.x1);
		}
	}
	// if they have the same slope, don't bounce
	// (if the circle is traveling parallel to the line it's hitting)
	if (crossPoint == "parallel") {return false;}

	// if the first point ISN'T in the same quadrant as the intersection, it's the right way
	if ((getSign(player.shape.x - point1[0]) == getSign(player.shape.x - crossPoint[0])
	&& getSign(player.shape.y - point1[1]) == getSign(player.shape.y - crossPoint[1]))) {
		return sides2;
	// if the first point ISN'T in the same quadrant as the intersection, it's the right way
	} else if ((getSign(player.shape.x - point2[0]) == getSign(player.shape.x - crossPoint[0])
	&& getSign(player.shape.y - point2[1]) == getSign(player.shape.y - crossPoint[1]))) {
		return sides1;
	}
} // end of getBounceSides


function circleLineBounce(circle, line) {
	if (!testForLineCollision(circle, line)) {return;}
	// if (line.isVertical) {console.log(1);}
	updatePlayerSpeeds();
	const c = circle.shape;
	// the degree the circle should bounce away at
	const bounceDegree = getBounceDegree(circle, line);

	if (Math.abs(bounceDegree % 180 - line.degree % 180) <= 2) {
		return;
	}

	// gets the sides (adj, opp) of an example movement in the right direction
	const sides = getBounceSides(circle, line, bounceDegree);

	if (sides == false) {
		return;
	}

	// calculate the fraction of the energy going to each direction
	const totalFraction = Math.abs(sides[0]) + Math.abs(sides[1]);
	// don't .abs the values this time, cause then it carries the correct sign through
	const hFraction = sides[0] / totalFraction;
	const vFraction = sides[1] / totalFraction;

	const hForce = circle.xSpeeds.normal;
	const vForce = circle.ySpeeds.gravity;

	// add together the net force we're using, reduce by the bounce momentum loss
	// .abs since it's still a positive amount of energy, even moving in a negative direction on the canvas
	const totalEnergy = Physics.bounceMomentumLoss(Math.abs(hForce) + Math.abs(vForce));

	// put the right amount of the reduced energy into the normal speed
	circle.xSpeeds.normal = hFraction * totalEnergy;

	// put all the new energy into gravity (probably should have its own at some point)
	circle.ySpeeds.gravity = vFraction * totalEnergy;
	updatePlayerSpeeds();
} // end of circleLineBounce


function circlePointBounceAll(circle) {
	movePoints();

	for (let i = 0; i < game.points.length; i++) {
		const collideLine = collisionPointToLine(circle, game.points[i]);
		// now just feed it into the line collision, since it already exists
		circleLineBounce(circle, collideLine);
	}
} // end of circlePointBounceAll


function collisionPointToLine(circle, point) {
	// a line between the center of the circle and the point it's colliding with
	const pathLine = new Line(circle.shape.x, circle.shape.y, point.x, point.y, 0);
	// the degree of the equivalent line it's colliding with, perpindicular to pathLine's degree
	const collideDegree = (pathLine.degree + 90) % 180;
	// get a point further along the collision line
	const sides = getSides(collideDegree, 40);
	// the collision line, made of points a bit further away
	const collideLine = new Line(point.x + sides[0], point.y + sides[1], point.x - sides[0], point.y - sides[1], 0);
	// return the line
	return collideLine;
} // end of collisionPointToLine


// ==============
// =MATH MISC.
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


// returns [adj, opp]
function getSides(degree, hyp) {
	const sides = [];
	// if in the 1st or 3rd quarter, keep it normal
	if (degree % 180 < 90) {
		sides.push(getAdj(degree, hyp));
		sides.push(getOpp(degree, hyp));
	// if in the 2nd or 4th quarter, switch adj and opp
	} else {
		sides.push(getOpp(degree, hyp));
		sides.push(getAdj(degree, hyp));
	}
	return sides;
} // end of getSides


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


// takes 2 slope-intercept form equations in [mx, b], returns [x, y] of intersection
function pointOfIntersection(slope1, slope2) {
	// the equivalent of getting everything on one side of the equation
	// while leaving slope2 unchanged
	slope1[0] -= slope2[0];
	slope1[1] -= slope2[1];

	// update to allow a slope to be a straight vertical line

	if (slope1[0] == 0) {return "parallel";}
	// holds the point of intersection (roll credits!)
	const coords = [];
	// in (2x + 9), you'd do (-9 / 2) to find x
	coords.push(-slope1[1] / slope1[0]);
	// plug x into equation/slope 2 to find the y
	// multiply the slope by x, and add the y-int
	coords.push(coords[0] * slope2[0] + slope2[1]);

	return coords;
} // end of pointOfIntersection


// finds the intersection of 2 lines when one of them is vertical
// takes slope in [mx, b] form, vertical line location as just a number
// returns point of intersection in [x, y] form
function pointOfIntersectionWithVertical(slope, vertX) {
	return [vertX, (slope[0] * vertX) + slope[1]];
} // end of pointOfIntersectionWithVertical


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
	if (num == 0) {return 0;}
	return num / Math.abs(num);
} // end of getSign


// gives the current conversion rate from meters to pixels
// based on how big the player is on screen, and how big it's supposed to be
function getPxPerM() {
	return player.shape.radius / player.radiusActual;
} // end of getPxPerM


// ====================
// =KEY TRACKING
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
	r: false,
	a: false,
	d: false,
	mouse: false,
}; // end of keydown object


// keeps track of the mouse
const mouse = {
	down: false,
	x: 0,
	y: 0,
}; // end of mouse object


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
			if (Lasso.lassoCounter == 3) {
				Lasso.incrementLassoStage();
			}
			if (Lasso.lassoCounter == 0) {Lasso.incrementLassoStage();}
			// Lasso.pullInLasso();
			break;
		case 40:
			keydown.down = true;
			if (Lasso.lassoCounter == 0) {Lasso.incrementLassoStage();}
			break;
		case 32:
			keydown.space = true;

			player.lasso.throw(); // only works in stage 1/aiming

			// if(Lasso.lassoCounter == 1)
			// {
			// 	Lasso.incrementLassoStage();
			// 	Lasso.forceLength = 0;
			// }
			// == this was here for stepping through the code 1 frame at a time for testing == 
			// movePlayer();
			// moveLines();
			// fall();
			// roll();
			// for (let i = 0; i < game.lines.length; i++) {
			// 	circleLineBounce(player, game.lines[i]);
			// }
			// updatePlayerSpeeds();
			// console.log(player.xSpeeds, player.ySpeeds);
			break;
		case 87:
			keydown.w = true;
			if (Lasso.lassoCounter == 3) {
				Lasso.incrementLassoStage();
			}
			if (Lasso.lassoCounter == 0) {Lasso.incrementLassoStage();}
			// Lasso.pullInLasso();
			break;
		case 83:
			keydown.s = true;
			if (Lasso.lassoCounter == 0) {Lasso.incrementLassoStage();}
			break;
		case 82:
			keydown.r = true;
			location.reload();
			break;
		case 65:
			keydown.a = true;
			break;
		case 68:
			keydown.d = true;
			break;
		case 8: // backspace
			Lasso.resetForceBase();
			player.lasso.resetForceBase();
			Lasso.forceLength = 0;
			if (Lasso.lassoCounter == 1) {
				Lasso.lassoCounter = 0;
			}
			if (player.lasso.stage == 1) {
				player.lasso.stage = 0;
			}
			break;
	}
}); // end of keydown listener

var listener;

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
			if(Lasso.lassoStage==1){
				clearInterval(Lasso.intervalId);
				document.removeEventListener('mousemove', mouseMove);
			}
			break;
		case 87:
			keydown.w = false;
			break;
		case 83:
			keydown.s = false;
			break;
		case 82:
			keydown.r = false;
			break;
		case 65:
			keydown.a = false;
			break;
		case 68:
			keydown.d = false;
			break;
	}
}); // end of keyup listener

const newPoints = [];
let count = 0;

document.addEventListener("mousedown", (e) => {
	// console.log(e.x - game.xOffset, e.y); // leave for testing

	// if (count == 0) {
	// 	newPoints.push([[Math.round(e.x - game.xOffset)-430, e.y], []]);
	// 	count++;
	// } else if (count == 1) {
	// 	newPoints[0][1] = [Math.round(e.x - game.xOffset)-430, e.y];
	// 	count++;
	// } else {
	// 	newPoints.push([newPoints[count-2][1], [Math.round(e.x - game.xOffset)-430, e.y]]);
	// 	count++;
	// }
	// let str = "";
	// for (let j = 0; j < newPoints.length; j++) {
	// 	const line = newPoints[j];
	// 	str += "[";
	// 	for (let h = 0; h < line.length; h++) {
	// 		const point = line[h];
	// 		str += "[";
	// 		for (let i = 0; i < point.length; i++) {
	// 			str += point[i];
	// 			if (i != point.length-1) {str += ", ";}
	// 		}
	// 		str += "]";
	// 		if (h == 0) {str += ", ";}
	// 	}
	// 	str += "], ";
	// }
	// console.log(str);

	mouse.down = true;

	//idk if this is needed still but it was doing weird stuff
	//Lasso.setMouseCoordinates(e.clientX, e.clientY);

	//will need to uncomment this stuff but thought I'd revert it to a point that at least semi works before commiting
	// if (Lasso.lassoCounter == 2 || Lasso.lassoCounter == 3 || Lasso.lassoCounter == 5) {
	// 	Lasso.incrementLassoStage();
	// }
		
	// if(Lasso.lassoCounter==1) {
		// Lasso.resetForceBase();
		// player.lasso.resetForceBase();
	// 	Lasso.intervalId = setInterval(Lasso.incrementForce, 100);
	// 	also add the mouse update in here
	// }
}); // end of mousedown listener


document.addEventListener("mousemove", (e) => {
	mouse.x = e.clientX;
	mouse.y = e.clientY;

	if (player.lasso == undefined) {return;}

	// Lasso.setMouseCoordinates(e.clientX, e.clientY);
	player.lasso.setMouseCoordinants(e.clientX, e.clientY);
	// Lasso.changeMouseLocation(e);
	player.lasso.changeMouseLocation(e);
});


document.addEventListener("mouseup", (e)=>{
	keydown.mouse = false;
	mouse.down = false;

	// clears interval that grows the prospected lasso line
	// clearInterval(Lasso.intervalId);

	// if(Lasso.lassoCounter == 1) {
		
	// 	//adds one that moves the line according to mouse location
	// 	Lasso.intervalId=setInterval(()=>{//Lasso.setHankProperties(player.shape.x, player.shape.y); 
	// 		listener = document.addEventListener('mousemove', mouseMove);
	// 		clearMouseMove();
	// 	}, 500);
	// }
}); // end of mouseup listener


//external function for eventListener above so it's easier to cancel later
function mouseMove(e) {
	//setMouseCoordinates(e.clientX, e.clientY); // need to get rid of this line once changeMouseLocation is working
	Lasso.changeMouseLocation(e);
	player.lasso.changeMouseLocation(e);
	//Lasso.setPointProperties(Lasso.forceX, Lasso.forceY); 
} // end of mouseMove

	//clears listener for mouse move whenever the lasso is launched
function clearMouseMove() {
	if(Lasso.lassoCounter==2){
		document.removeEventListener('mousemove', mouseMove)
	}
} // end of clearMouseMove


// ================
// =RESIZING
// =======


// resizes everything in the canvas to stay the same relative to each other when the canvas changes size
function resize() {
	// saves the canvas dimensions for comparison after
	const prevCanvas = game.canvas.width + " " + game.canvas.height;
	// saves what fraction of canvas height player.shape.y is
	const playerHeight = player.shape.y / game.canvas.height;

	// holds the fractions representing lines' x's and y's
	const lineYs = [];
	const lineXs = [];
	// save for all the lines
	for (let i = 0; i < game.lines.length; i++) {
		const line = game.lines[i];
		// for y's, a fraction of the canvas height
		lineYs.push([line.y1 / game.canvas.height, line.y2 / game.canvas.height]);
		// for x's, the distance from player to line-point, divided by player.shape.radius
		lineXs.push([(line.x1 - player.shape.x) / player.shape.radius, (line.x2 - player.shape.x) / player.shape.radius]);
	}

	game.background.updateDimensions(game.canvas.height);

	// the difference between the background location and the player location,
	// divided by the player radius for scale
	let backFraction = (game.background.x - player.shape.x) / player.shape.radius;

	const lassoPoints = []; // add in [x, y] format for each point
	if (Lasso.lassoPoints != undefined && Lasso.lassoPoints.length > 0) {
		for (let i = 0; i < Lasso.lassoPoints.length; i++) {
			const point = Lasso.lassoPoints[i];
			lassoPoints.push([(point.x - player.shape.x) / player.shape.radius, point.y / game.canvas.height]);
		}
	}

	// const mouseLocation = [(Lasso.mouseX - player.shape.x) / player.shape.radius, Lasso.mouseY / game.canvas.height];
	const forceLocation = [(Lasso.forceX - player.shape.x) / player.shape.radius, Lasso.forceY / game.canvas.height];

	// resize the canvas to fill the whole window
	resizeCanvas();

	// compare the new and old dimensions
	// if there was no change, end it now
	const currCanvas = game.canvas.width + " " + game.canvas.height;
	if (prevCanvas == currCanvas) {
		return;
	}

	// center player horizontally
	player.shape.x = game.canvas.width / 2;
	// make radius the set fraction of the height
	player.shape.radius = game.canvas.height * player.screenPercent * player.unravelPercent;
	player.shape.y = game.canvas.height * playerHeight;
	player.acceleration = player.shape.radius * 10;

	// resizes the lines
	for (let i = 0; i < game.lines.length; i++) {
		const line = game.lines[i];

		line.y1 = lineYs[i][0] * game.canvas.height;
		line.y2 = lineYs[i][1] * game.canvas.height;

		// multiplied by player radius so it stays on the same scale as player
		const x1Distance = lineXs[i][0] * player.shape.radius;
		const x2Distance = lineXs[i][1] * player.shape.radius;
		// factor in xOffset when changing xStarts
		line.x1Start = (player.shape.x - game.xOffset) + x1Distance;
		line.x2Start = (player.shape.x - game.xOffset) + x2Distance;
	}
	// move the lines, so anything after this still works
	moveLines();
	
	game.points = [];
	// every end of a line is a point to collide with
	for (let i = 0; i < game.lines.length; i++) {
		const line = game.lines[i]
		game.points.push(new Point(line.x1, line.y1, 0));
		game.points.push(new Point(line.x2, line.y2, 0));
	}

	// resize the image to fit height-wise
	game.background.updateDimensions(game.canvas.height);
	// the px amount of how far back the background should be from the player
	const backXDistance = player.shape.x - game.xOffset + (backFraction * player.shape.radius);
	// use this method cause setting it directly doesn't work
	game.background.setStartX(backXDistance);
	// update offset after
	game.background.updateOffset(game.xOffset);

	for (let i = 0; i < lassoPoints.length; i++) {
		const x = player.shape.x + (lassoPoints[i][0] * player.shape.radius);
		// const x = player.shape.x + (lassoPoints[i][0] * player.shape.radius);
		const y = lassoPoints[i][1] * game.canvas.height;
		Lasso.lassoPoints[i].moveTo(x, y, game.xOffset);
		Lasso.lassoPoints[i].adjustX(game.xOffset);
	}

	Lasso.forceX = player.shape.x + (forceLocation[0] * player.shape.radius);
	Lasso.forceY = forceLocation[1] * game.canvas.height;

} // end of resize


// resizes the canvas to the size of the window
function resizeCanvas() {
	// -20 to get around padding I can't find
	game.canvas.width = window.innerWidth - 10; 
	game.canvas.height = window.innerHeight - 10;
} // end of resizeCanvas


function meterPixelRate() {
	// console.log(player.shape.radius, player.radiusActual, player.shape.radius / player.radiusActual);
	return player.shape.radius / player.radiusActual;
} // end of meterPixelRate


// =====================
// =MOVING
// =====================


// adds rotation to player based on how far it's rolled
function spinPlayer() {
	if (player.pauseSpin) {return;}
	// the distance player has moved
	const distanceX = -game.xOffset - player.prevX;
	const distanceY = player.shape.y - player.prevY;
	// if it's not on a surface, turn less dramatically, and only based on xSpeed
	if (!atRest()) {
		player.rotation += distanceX / (2*Math.PI*player.shape.radius) * 360 / 3;
	// if it's moving across a surface
	} else {
		// find the actual distance it's traveled
		let distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
		// flip the sign if necessary
		if (distanceX < 0) {
			distance = -distance;
		}
		// and rotate it
		player.rotation += distance / (2*Math.PI*player.shape.radius) * 360;
	}
} // end of spinPlayer


// moves the player vertically, everything else moves horizontally
function movePlayer() {
	updatePlayerSpeeds();

	// cause it doesn't actually move horizontally
	player.prevX = -game.xOffset;
	player.prevY = player.shape.y;

	// speeds are pixels/second, so it's reduced for how frequently it's happening
	game.xOffset -= player.xSpeed / game.fps;
	
	player.shape.y += player.ySpeed / game.fps;

	let diff = Math.abs(player.prevX) - Math.abs(game.xOffset);
	if (game.xOffset < 0) {diff = -diff;}

	// console.log(diff);

	spinPlayer();
} // end of movePlayer


// counts the seconds
// starts at 1 so there's always some gravity
var timer = 1;


// returns if the player is on top of a line
function atRest() {
	let atRest = false;
	// console.log(game.lines);
	// tests against every line
	for (let i = 0; i < game.lines.length; i++) {
		const line = game.lines[i];
		// if the line's vertical or there's no collision, skip this one
		if (line.isVertical || !testForLineCollision(player, line)) {
			continue;
		// if the line's horizontal (and collision)
		} else if (line.isHorizontal) {
			// at rest if player is above the line
			if (player.shape.y < line.y1) {
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

	// collidePoint.moveTo(game.points[0].x, game.points[0].y);

	for (let i = 0; i < game.points.length; i++) {
		const point = game.points[i];
		if (testForPointCollision(player.shape, point) && pointCollisionBelow(player.shape, point)) {
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
		player.ySpeeds.gravity += Physics.gravityAcceleration(game.fps, getPxPerM());
		// player.ySpeeds.gravity += Physics.affectGravity(0, timer);

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
	for (let i = 0; i < game.lines.length; i++) {
		// adjust their x position
		game.lines[i].adjustX(game.xOffset);
	}
} // end of moveLines


// moves the points based on xOffset
function movePoints() {
	for (let i = 0; i < game.points.length; i++) {
		// adjust every point's x position
		game.points[i].adjustX(game.xOffset);
	}
} // end of movePoints


function moveLassoPoints() {
	if (Lasso.lassoPoints == undefined) {return;}
	for (let i = 0; i < Lasso.lassoPoints.length; i++) {
		// adjust every lasso point's location
		Lasso.lassoPoints[i].adjustX(game.xOffset);
	}
} // end of moveLassoPoints


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


//when hank hits the end of the level (or a specified end point), the level changes
function levelUp()
{
	// console.log(game.xOffset);

	if(game.xOffset >= game.levelEndPoint-2 && game.xOffset<= game.levelEndPoint+2)
	{
		if(game.level!= game.maxLevel) {
			window.location.assign("/levels/level" + (game.level+1) + ".html");
		} else {
			window.location.assign("/nonLevelPages/endPage.html");
		}
	}
	
}


// =================
// =ROLLING
// =================


// handles player rolling on angled lines
function roll() {
	// only runs when resting on a line
	if (!atRest()) {return;}

	// for every line
	for (let i = 0; i < game.lines.length; i++) {
		const line = game.lines[i];
		rollDownNatural(player, line);
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
function rollDownNatural(circle, line) {
	updatePlayerSpeeds();
	// only keep going if it's an angled line, collided on the bottom half of the player
	if (line.isVertical || line.isHorizontal 
	|| !testForLineCollision(circle, line) || angledCollisionAbove(circle, line)) {
		return;
	}
	// get the starting amount of gravity
	let vForce = Physics.gravityAcceleration(game.fps, getPxPerM());
	vForce *= (5/8);
	// get the horizontal energy based on the downward force and how steep the line is
	// (moduloed by 180 cause 30 degrees and 210 degrees are the same line) for simplicity
	const hForce = horizontalRollDownEnergy(vForce, line.degree % 180);
	vForce -= Math.abs(hForce);

	// if moving right and blocked
	if (hForce > 0 && circle.blocked.right) {
		// zero the speed, and return
		// if (circle.ySpeeds.rollDown > 0) {circle.ySpeeds.rollDown = 0;}
		// if (circle.xSpeeds.rollDown > 0) {circle.xSpeeds.rollDown = 0;}
		return;
	// if moving left and blocked
	} else if (hForce < 0 && circle.blocked.left) {
		// zero the speed and return
		// if (circle.ySpeeds.rollDown > 0) {circle.ySpeeds.rollDown = 0;}
		// if (circle.xSpeeds.rollDown < 0) {circle.xSpeeds.rollDown = 0;}
		return;
	}
	// if it's able to move, add the horizontal speed
	circle.xSpeeds.rollDown += hForce;
	// and add the necessary amount of vertical speed to get to the lower point on the line
	circle.ySpeeds.rollDown = line.yChangeRate * circle.xSpeeds.rollDown;
} // end of rollDownNatural


// rolls player up the line given, based on force given
function rollUp(circle, line, force) {
	// only keep going if it's an angled line, collided on the bottom half of the player
	if (line.isVertical || !testForLineCollision(circle, line)
	|| angledCollisionAbove(circle, line) || line.isHorizontal) {
		return false;
	}

	let yChange = line.yChangeRate;
	// if this line doesn't block in the direction it's moving
	if ((yChange > 0 && force > 0) || (yChange < 0 && force < 0)) {
		// if it's not currently rolling up, don't bother
		if (circle.xSpeeds.rollUp == 0) {return false;}
		// if it's not being blocked, but pushing in the direction it's already rolling, don't bother
		if (getSign(circle.xSpeeds.rollUp) == getSign(force)) {
			return false;
		}
	}

	if (getSign(force) == getSign(player.xSpeeds.rollDown)) {
		force += getHyp(player.xSpeeds.rollDown, player.ySpeeds.rollDown) * getSign(player.xSpeeds.rollDown);
		player.xSpeeds.rollDown = 0;
	}

	// if the push is going downhill, the rollUp code below works for taking away from
	// rollUp speed as well

	// add yChange and 1 to find the total
	const totalEnergy = Math.abs(yChange) + 1;
	// put it in a ratio with the amount of the total that's vertical
	const vFraction = yChange / totalEnergy;
	// or horizontal
	let hFraction = (1 / totalEnergy);

	// zero out rollUp if it's hit another line, so it doesn't accumulate speed wrong
	if ((circle.xSpeeds.rollUp > 0 && circle.blocked.left) || 
	(circle.xSpeeds.rollUp < 0 && circle.blocked.right)) {
		// console.log("hereye");
		// circle.xSpeeds.rollUp = 0;
	}

	// // // zero out rollUp if it's hit another line, so it doesn't accumulate speed wrong
	// if ((circle.xSpeeds.rollUp > 0 && circle.blocked.left) || 
	// (circle.xSpeeds.rollUp < 0 && circle.blocked.right)) {
	// 	// console.log("hereye");
	// 	circle.xSpeeds.rollUp = 0;
	// }

	// add to the rollUp xSpeed
	circle.xSpeeds.rollUp += hFraction * force;
	// circle.xSpeeds.rollUp = hFraction * force;
	// set the rollUp ySpeed to match the current xSpeed
	circle.ySpeeds.rollUp = (circle.xSpeeds.rollUp / hFraction) * vFraction;
	// send a message that the energy's been used
	return true;
} // end of rollUp



// rolls player up the line given, based on force given
function rollDown(circle, line, force) {
	// only keep going if it's an angled line, collided on the bottom half of the player
	if (line.isVertical || !testForLineCollision(circle, line)
	|| angledCollisionAbove(circle, line) || line.isHorizontal) {
		return false;
	}

	let yChange = line.yChangeRate;
	// if this line doesn't block in the direction it's moving
	if ((yChange > 0 && force < 0) || (yChange < 0 && force > 0)) {
		// if it's not currently rolling up, don't bother
		if (circle.xSpeeds.rollDown == 0) {return false;}
		// if it's not being blocked, but pushing in the direction it's already rolling, don't bother
		if (getSign(circle.xSpeeds.rollDown) == getSign(force)) {
			return false;
		}
	}

	if (getSign(force) == getSign(player.xSpeeds.rollUp)) {
		force += getHyp(player.xSpeeds.rollUp, player.ySpeeds.rollUp) * getSign(player.xSpeeds.rollUp);
		player.xSpeeds.rollUp = 0;
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

	// // zero out rollUp if it's hit another line, so it doesn't accumulate speed wrong
	// if ((circle.xSpeeds.rollDown > 0 && circle.blocked.right) || 
	// (circle.xSpeeds.rollDown < 0 && circle.blocked.left)) {
	// 	// console.log("hereye2");
	// 	circle.xSpeeds.rollDown = 0;
	// }

	// add to the rollUp xSpeed
	circle.xSpeeds.rollDown += hFraction * force;
	// circle.xSpeeds.rollDown = hFraction * force;
	// set the rollUp ySpeed to match the current xSpeed
	circle.ySpeeds.rollDown = (circle.xSpeeds.rollDown / hFraction) * vFraction;
	// send a message that the energy's been used
	return true;
} // end of rollUp


// =================
// =DRAWING
// =================


// clears the canvas to transparent
function clearCanvas(ctx) {
	ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
} // end of clearCanvas


// draws in the player, info from player{}
function drawPlayer(ctx) {
	const ball = new Image();
	ball.src = "../Art/Hankenskein.png";

	// const x = player.shape.x - player.shape.radius;
	// const y = player.shape.y - player.shape.radius;
	const centerX = player.shape.x;
	const centerY = player.shape.y;

	// gets it to rotate (i don't really get it either)
	ctx.translate(centerX, centerY);
	ctx.rotate(degreesToRadians(player.rotation % 360));
	ctx.drawImage(ball, 0-player.shape.radius, 0-player.shape.radius, player.shape.radius*2 , player.shape.radius*2);
	ctx.rotate(-degreesToRadians(player.rotation % 360));
	ctx.translate(-centerX, -centerY);

	drawPlayerEyes(ctx);
} // end of drawPlayer


function drawPlayerEyes(ctx) {
	// draw the big white circles with the black outline
	ctx.beginPath();
	const x1 = player.shape.x - player.shape.radius * (4/9);
	const x2 = player.shape.x + player.shape.radius * (4/9);
	let y1 = player.shape.y - player.shape.radius * (1/9);
	let y2 = player.shape.y - player.shape.radius * (1/9);
	const radius = player.shape.radius * (5/12);

	const bounces = Math.abs(player.rotation / 180);
	const movementFraction = 1/12;

	if (Math.floor(bounces) % 2 == 1) {
		y1 -= (player.shape.radius * movementFraction) * (bounces % 1);
		y2 += (player.shape.radius * movementFraction) * (bounces % 1);
	} else {
		y1 -= (player.shape.radius * movementFraction) * (1-(bounces % 1));
		y2 += (player.shape.radius * movementFraction) * (1- (bounces % 1));
	}

	const eye1 = new Circle(x1, y1, radius);
	const eye2 = new Circle(x2, y2, radius);

	eye1.fill(ctx, "white");
	eye2.fill(ctx, "white");
	eye1.outline(ctx, "black");
	eye2.outline(ctx, "black");

	// draw the smaller black circle

	let px1 = eye1.x;
	let px2 = eye2.x;
	let py1 = eye1.y;
	let py2 = eye2.y;

	const maxShift = eye1.radius * (4/16);
	let xShift = player.xSpeed / 200 * maxShift;
	let yShift = player.ySpeed / 200 * maxShift;

	if (Math.abs(xShift) > maxShift) {
		xShift = getSign(xShift) * maxShift;
	}
	if (Math.abs(yShift) > maxShift) {
		yShift = getSign(yShift) * maxShift;
	}

	px1 += xShift;
	px2 += xShift;
	py1 += yShift;
	py2 += yShift;

	const pupil1 = new Circle(px1, py1, eye1.radius / 2);
	const pupil2 = new Circle(px2, py2, eye2.radius / 2);

	pupil1.fill(ctx, "black");
	pupil2.fill(ctx, "black");

} // end of drawPlayerEyes


// unravels the player and updates radius
function unravelPlayer(percent) {
	player.unravelPercent = percent;
	player.shape.radius = game.canvas.height * player.screenPercent * percent;
	player.acceleration = player.shape.radius * 10;
}


// draws in the lines
function drawLines(ctx) {
	for (let i = 0; i < game.lines.length; i++) {
		game.lines[i].draw(ctx);
	}
	// for (let i = 0; i < drawnLines.length; i++) {
	// 	drawnLines[i].draw(ctx);
	// }
} // end of drawLines


// function drawWalls(ctx, background) {
// 	const thick = game.canvas.height / 10;

// 	ctx.beginPath();
// 	ctx.rect(background.x - thick, background.y - thick, background.width + thick*2, background.height + thick*2);
// 	ctx.strokeStyle = "#630";
// 	ctx.lineWidth = thick;
// 	ctx.stroke();
// } // end of drawWalls


function draw(ctx) {
	clearCanvas(ctx);
	ctx.beginPath();
	ctx.rect(0, 0, game.canvas.width, game.canvas.height);
	ctx.fillStyle = "#dad";
	ctx.fill();
	game.background.updateDimensions(game.canvas.height);
	game.background.draw(ctx);
	drawLines(ctx);
	// Lasso.drawLasso(ctx);
	player.lasso.draw(ctx);
	drawPlayer(ctx);
} // end of draw


//==================================
// =ANIMATE LOOP
//==================================


function main() {
	// lengthens the lasso forceLength
	const wUpId = setInterval(() => {
		if (keydown.up || keydown.w) {
			Lasso.incrementForce();
			player.lasso.incrementForce();
		}

		if (keydown.down || keydown.s) {
			Lasso.decrementForce();
			player.lasso.decrementForce();
		}
	}, 100); // end of wUp loop


	// the timer for gravity
	const gravityId = setInterval(()=>{
		timer += 0.1;
	}, 100); // end of gravity timer loop


	//sets level in game object by calling level's html file
	setLevel();


	// main! the animate loop, cycles everything
	const animateId = setInterval(() => {

		resize();
		updatePlayerSpeeds();
		// called here so collision still works
		moveLines();
		moveLassoPoints();
		player.lasso.update(game.xOffset);

		// if it's touching ground, apply friction
		if (atRest()) {
			frictionPlayerX();
		}
		// decay the vertical friction to avoid bugs
		frictionPlayerY();

		propelPlayer();
		// collision
		collideWithLines();
		collideWithPoints();
		// movement
		movePlayer();
		moveLines();
		game.background.updateOffset(game.xOffset);
		fillPoints();
		// natural physics have a turn
		fall();
		roll();
		// set new trajectories if needed
		for (let i = 0; i < game.lines.length; i++) {
			circleLineBounce(player, game.lines[i]);
		}

		// console.log(Lasso.lassoCounter);

		levelUp();

		draw(game.ctx);

	}, 1000 / game.fps); // 1000 is 1 second // end of animate loop

	// saves them all so they can be turned off
	game.idList = [wUpId, gravityId, animateId];
} // end of main


function stop() {
	for (let i = 0; i < game.idList.length; i++) {
		clearInterval(game.idList[i]);
	}
} // end of stop


