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
		const xChange = this.x2 - this.x1;
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
		const xChange = this.x2 - this.x1;
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

// const obstructions = {
// 	ground: new Obstruction(0, canvas.height/2, canvas.width, 20),
// 	testLine: new Obstruction(300,0,5,300)
// }

const lines = [];

const testLine = new Line(500, 800, 200000, 0);
const ground = new Line(0, 1000, 300, 300);
lines.push(testLine);
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
	// changed this to if statements so that you can press more than one key at once

	// if an arrow key is down, add more speed in that direction
		if(keydown.left){
			player.xSpeed -= player.acceleration / game.fps;
		}
		if(keydown.right){
			player.xSpeed += player.acceleration / game.fps;
		}
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
	// if player runs into an obstruction, it can't move in that direction
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
			console.log("angled collide");
		}
	}	
}


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
		if (withinRange(line.yAt(point1[0]), circle.y, point1[1]) &&
		withinRange(line.xAt(point1[1]), circle.x, point1[0])) {
			return true;
		} else if (withinRange(line.yAt(point2[0]), circle.y, point2[1]) &&
		withinRange(line.xAt(point2[1]), circle.x, point2[0])) {
			return true;
		}
	}
	return false;
} // end of testForCollision


// returns the degree of the point on a circle
// where it would collide with the specified line
function collisionDegree(circle, line) {
	const degree = (-45 * line.yChangeRate) + 90;
	return degree;
} // end of getCollisionDegree


// don't input vertical or horizontal lines (not sure what'll happen though)
// returns the (x, y) of the point on the circle that would collide with the line
function collisionPoints(circle, line) {
	const hyp = circle.radius;
	const adjs = [];
	const opps = [];

	const degree1 = collisionDegree(circle, line);
	adjs.push(getAdj(degree1, hyp));
	opps.push(getOpp(degree1, hyp));

	const degree2 = degree1 + 180;
	adjs.push(getAdj(degree2, hyp));
	opps.push(getOpp(degree2, hyp));

	// keep it in range of 0-360
	const degrees = [degree1 % 360, degree2 % 360];
	const points = [];

	for (let i = 0; i < 2; i++) {
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


// ==============
// MISC. MATH
// ==============


// returns the length of the adjacent
function getAdj(degree, hyp) {
	degree %= 90;
	return hyp * (Math.cos(degree));
} // end of getAdj


// returns the length of the the opposite
function getOpp(degree, hyp) {
	degree %= 90;
	return hyp * (Math.sin(degree));
} // end of getOpp


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
			console.log(collisionDegree(player, testLine));
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
	// if (player.y + player.radius <= obstructions.ground.y) {
	if (!testForCollision(player, ground)) {
		// reversed because the negative direction is opposite of usual
		player.ySpeed -= Physics.affectGravity(0, player.ySpeed, timer);
	} else {
		timer = 0;
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

}, 1000 / game.fps); // 1000 is 1 second
