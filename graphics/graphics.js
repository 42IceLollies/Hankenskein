const canvas = document.getElementById('graphics');
const ctx = canvas.getContext('2d');

// it reaches a natural speed cap, where friction is equal to acceleration
// we can still add an additional speed cap though

const game = {
	fps: 20,
};


const player = {
	x: 100,
	y: 100,
	radius: 25,
	xSpeed: 0,
	ySpeed: 0,
	acceleration: 200,
	fillColor: "#e2619f",
};


// clears the entire canvas, by making the entire canvas transparent
function clearCanvas() {
	const canvas = document.getElementById('graphics');
	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
} // end of clearCanvas


// draws in the player, off of info from player obj
function drawPlayer() {
	const canvas = document.getElementById('graphics');
	const ctx = canvas.getContext('2d');

	ctx.fillStyle = player.fillColor;
	ctx.beginPath();
	ctx.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
	ctx.fill();
} // end of drawPlayer


// reduces the speed of an objects speed
function friction(obj) {
	const decimal = .95;
	
	obj.xSpeed *= decimal;

	obj.ySpeed *= decimal;
	
	if (Math.abs(obj.xSpeed) < 1) {obj.xSpeed = 0;}
	if (Math.abs(obj.ySpeed) < 1) {obj.ySpeed = 0;}
} // end of friction


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
} // end of propelPlayer


// resizes the canvas to the size of the window
function resizeCanvas() {
	canvas.width = window.innerWidth - 20; // -20 to get around padding I can't find
	canvas.height = window.innerHeight - 20;
}


// the animate loop, draws in the new positions of objects
const animateID = setInterval(() => {
	propelPlayer();
	friction(player);

	resizeCanvas();

	// speeds are pixels/second, so reduce it for how frequently it's happening
	player.x += player.xSpeed / game.fps;
	player.y += player.ySpeed / game.fps;

	clearCanvas();
	drawPlayer();

}, 1000 / game.fps); // 1000 is 1 second

