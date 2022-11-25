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
		const canvas = document.getElementById('canvas');
		const ctx = canvas.getContext('2d');

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
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

	//tells if the player has touched any obstructions
	collide(player, game)
	{
		//there's either an error in this or somewhere in the setting of canvas size because it thinks that canvas.height is 
		//at least 50 px below where my screen ends
		//but anyway, yeah, the ground should be changed but i'm too lazy to do it rn
		if(player.x + player.radius >=this.x + game.xOffset && player.x - player.radius <= this.x + game.xOffset + this.width &&
		   player.y + player.radius >= this.y && player.y - player.radius <= this.y + this.height)
		{
			return true;
		} 
		return false;
	}

	//tells which direction the collision has happened from
	//can only be called after it is established that there is a collision
	directionCollided(player, game)
	{
		if(player.x + player.radius >=this.x + game.xOffset)
		{
			return "from left";
		}
		if(player.x - player.radius <= this.x + game.xOffset + this.width)
		{
			return "from right";
		}
		if(player.y + player.radius >= this.y)
		{
			return "from top";
		}
		if(player.y - player.radius <= this.y + this.height)
		{
			return "from bottom";
		}
	}

    
}





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

const obstructions = {
	ground: new Obstruction(0, canvas.height/2, canvas.width, 20)
}

const lines = [];

const testLine = new Line(300, 300, 0, 300);
lines.push(testLine);


// ====================
// UNSORTED
// ====================


// reduces the speed of an objects speed
function friction(obj) {
	obj.xSpeed -= (obj.xSpeed * game.frictionRate) / game.fps;
	obj.ySpeed -= (obj.ySpeed * game.frictionRate) / game.fps;
	
	if (Math.abs(obj.xSpeed) < 1) {obj.xSpeed = 0;}
	if (Math.abs(obj.ySpeed) < 1) {obj.ySpeed = 0;}
} // end of friction


// propels the player based on arrow keys
function propelPlayer() {
	// if an arrow key is down, add more speed in that direction
	switch (true) {
		case keydown.left:
			player.xSpeed -= player.acceleration / game.fps;
			break;
		case keydown.right:
			player.xSpeed += player.acceleration / game.fps;
			break;
		case keydown.up:
			player.ySpeed -= player.acceleration / game.fps;
			break;
		case keydown.down:
			player.ySpeed += player.acceleration / game.fps;
			break;
	}

	//if player runs into an obstruction, it can't move in that direction
	for(const key in obstructions)
	{
		if(obstructions[key].collide(player, game))
		{
			const direction = obstructions[key].directionCollided(player, game);
			switch(direction)
			{
				case "from top":
					//player.xSpeed cannot be less than 0
					if(player.xSpeed<0)
					{
						player.xSpeed = 0; 
					}
				break;

				case "from bottom":
					//player.xSpeed cannot be greater than 0
					if(player.xSpeed>0)
					{
						player.xSpeed = 0; 
					}
				break;

				case "from left":
					//player.ySpeed cannot be greater than 0
					if(player.ySpeed>0)
					{
						player.ySpeed = 0;
					}
				break;

				case "from right":
					//player.ySpeed cannot be less than 0
					if(player.ySpeed<0)
					{
						player.ySpeed =0;
					}
				break;
				}
		}
	}
} // end of propelPlayer


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
	// player.x += player.xSpeed / game.fps;
	player.y += player.ySpeed / game.fps;
} // end of movePlayer


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
		lines[i].draw();
	}
} // end of drawLines


// the animate loop, draws in the new positions of objects
const animateID = setInterval(() => {
	resize();

	propelPlayer();
	friction(player);
	
	game.xOffset -= player.xSpeed / game.fps;
	movePlayer();
	moveLines();

	clearCanvas();
	drawLines();
	drawPlayer();

}, 1000 / game.fps); // 1000 is 1 second



