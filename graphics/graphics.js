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

	draw() {
		//we could maybe just pass in the parameters of canvas and context instead of declaring it everytime
		//idk its the same thing ig tho just fewer lines
		// they're already global variables, so these were redundant, thanks
		// const canvas = document.getElementById('canvas');
		// const ctx = canvas.getContext('2d');

		ctx.beginPath();
		ctx.moveTo(this.x1, this.y1);
		ctx.lineTo(this.x2, this.y2);
		ctx.stroke();
	}
} // end of Line


//===================
//OBSTRUCTION CLASS
//====================

//creates any physical objects that the ball rolls on/ runs into, etc

class Obstruction{
    constructor(x, y, width, height){
        this.xStart = x;
		this.x = x;
		this.y = y;
        this.width = width;
        this.height = height;
    }

	//tells if the player has touched any obstructions
	collide(player)
	{
		//there's either an error in this or somewhere in the setting of canvas size because it thinks that canvas.height is 
		//at least 50 px below where my screen ends
		//but anyway, yeah, the ground should be changed but i'm too lazy to do it rn
		//and also the x collide isn't working but now my computer's gonna die
		//also could be made more accurate using pi instead of just pretending the circle is a square
		if(player.x + player.radius >= this.x && player.x - player.radius <= this.x + this.width &&
		   player.y + player.radius >= this.y && player.y - player.radius <= this.y + this.height)
		{
			return true;
		} 
		return false;
	}

	//tells which direction the collision has happened from
	//can only be called after it is established that there is a collision

	// if you're called a switch statement for it outside, why not just
	// test for these outside?

	// directionCollided(player)
	// {
	// 	if(player.x + player.radius >=this.x)
	// 	{
	// 		return "from left";
	// 	}
	// 	if(player.x - player.radius <= this.x + this.width)
	// 	{
	// 		return "from right";
	// 	}
	// 	if(player.y + player.radius >= this.y)
	// 	{
	// 		return "from top";
	// 	}
	// 	if(player.y - player.radius <= this.y + this.height)
	// 	{
	// 		return "from bottom";
	// 	}
	// }

	adjustX(xOffset) {
		this.x = this.xStart + xOffset;

	} 
} // end of Obstruction


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

const testLine = new Line(900, 900, 0, 300);
const ground = new Line(0, 1000, 300, 300);
lines.push(testLine);
lines.push(ground);


// ====================
// UNSORTED
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
	//changed this to if statements so that you can press more than one key at once

	// if an arrow key is down, add more speed in that direction
		if(keydown.left){
			player.xSpeed -= player.acceleration / game.fps;
		}
		if(keydown.right){
			player.xSpeed += player.acceleration / game.fps;
		}
		if(keydown.up){
			//player.ySpeed -= player.acceleration / game.fps;
			//makes gravity on jump more realistic, also easier to maneuver
			player.ySpeed -= Physics.affectGravity(15, 150, timer);
		}
		if(keydown.down){
			player.ySpeed += player.acceleration / game.fps;
		}
	
} // end of propelPlayer


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
		if (line.x1 == line.x2) {
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
		} else if (line.y1 == line.y2) {
			// if player's lower, stop moving up
			if (player.y > line.y1 && player.ySpeed < 0) {
				player.ySpeed = 0;
				player.y += player.radius - (player.y - line.y1);
			// if player's higher, stop moving down
			} else if (player.y < line.y1 && player.ySpeed > 0) {
				player.ySpeed = 0;
				player.y -= player.radius - (line.y1 - player.y);
			}
		}
	}	
}


function withinRange(num, rangeStart, rangeEnd) {
	return (num >= rangeStart && num <= rangeEnd);
} // end of withinRange


// only works for horizontal and vertical lines
function testForCollision(circle, line) {
	const circleLeft = circle.x - circle.radius;
	const circleRight = circle.x + circle.radius;
	const circleUp = circle.y - circle.radius;
	const circleDown = circle.x + circle.radius;

	// vertical line
	if (line.x1 == line.x2) {
		if (withinRange(circleUp, line.y1, line.y2) || withinRange(circleDown, line.y1, line.y2)) {
			if (Math.abs(circle.x - line.x1) <= circle.radius) {
				return true;
			}
		}
	// horizontal line
	} else if (line.y1 == line.y2) {
		if (withinRange(circleLeft, line.x1, line.x2) || withinRange(circleRight, line.x1, line.x2)) {
			if (Math.abs(circle.y - line.y1) <= circle.radius) {
				return true;
			}
		}
	}
	return false;
} // end of testForCollision


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
} // end of resize


// resizes the canvas to the size of the window
function resizeCanvas() {
	canvas.width = window.innerWidth - 20; // -20 to get around padding I can't find
	canvas.height = window.innerHeight - 20;

	player.x = canvas.width / 2;
} // end of resizeCanvas


// =====================
// MOVING
// =====================


// moves the player
function movePlayer() {
	// speeds are pixels/second, so reduce it for how frequently it's happening
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


// function moveObstructions() {
// 	for (const key in obstructions) {
// 		obstructions[key].adjustX(game.xOffset);
// 	}
// } // end of moveObstructions


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
		lines[i].draw();
	}
} // end of drawLines


// the animate loop, draws in the new positions of objects
const animateID = setInterval(() => {
	resize();

	propelPlayer();
	friction(player);
	collideWithLines();
	
	game.xOffset -= player.xSpeed / game.fps;

	movePlayer();
	moveLines();
	// moveObstructions();

	fall();

	// testForCollision(player, testLine);

	clearCanvas();
	drawLines();
	drawPlayer();

}, 1000 / game.fps); // 1000 is 1 second



