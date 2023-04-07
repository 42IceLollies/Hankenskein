class Physics{
    //gravity is -9.8 m/s^2 but I'm not entirely sure what a meter is in this game so feel free to change it
    static g = 2.5;
    static seconds = 0;
    static frameCount = 0;
     
    static getSeconds()
    {
        return this.seconds;
    }

    // // pulls down player with gravitational accelleration
    // static affectGravity(initYSpeed, timeOffGround, metersToPixels)
    // {
    //     // v = v0 + at
    //     // new ySpeed = input ySpeed when jumps + g * secs since beginning of jump
    //     const ySpeed = initYSpeed + (this.g * timeOffGround);
    //     return ySpeed * metersToPixels;
    //     // To Do: find a conversion between meters and pixels

    // }

    // pulls down player with gravitational accelleration
    static affectGravity(initYSpeed, timeOffGround)
    {
        // v = v0 + at
        // new ySpeed = input ySpeed when jumps + g * secs since beginning of jump
        const ySpeed = initYSpeed + (this.g * timeOffGround);
        return ySpeed;
        // To Do: find a conversion between meters and pixels
        // px/m = player.shape.radius / player.radiusActual

    }

    // gives the acceleration from gravity in pixels
    // takes the fps the game is running at, and the current meter to pixel rate
    static gravityAcceleration(fps, pxPerM) {
        return (this.g * pxPerM) / fps;
    }


    static friction()//not static friction tho, just a static method for friction
    {
        //Equation for rolling friction:
        // or F=umg? 
        //F = force
        //u = coefficient of friction - around .3-.5
        //m = mass of yarn
        //r = rad 
        //g = gravity
        
        //To Do: find the friction constant through experimentation, find mass/ radius and how it decays when it is unwound of ball of string

    }

    // when it bounces, it loses most of it's momentum
    // arbitrary #'s, feel free to change
    static bounceMomentumLoss(speed) {
        speed -= speed * .7;
        if (speed < 1 && speed > -1) {
            speed = 0;
        }
        return speed;
    }
    
    //This returns the speed when it is slowing down
    static bounce(theSpeed){
        return -theSpeed;
    }
}




//==================LASSO CLASS============================
class Lasso{
    static lassoPoints;
    static collideHorizon = [];
    static lassoCounter = 0;

    //copy of lasso's variables because it's not working for some reason? - Was this a note I wrote to myself or was it someone else? (-Cordelia)
    static forceX = 0;
    static forceY = 0;
    // were causing loading issues, called resetForceBase() in start of other js file
    // static forceX = player.shape.x;
    // static forceY = player.shape.y;
    static mouseX = 0;
    static mouseY = 0;
    static forceLength = 0;
    static intervalId = null;
    static lassoStage = "not active";// I think this can  be gotten rid of eventually but might be useful for debugging
    static slope = 0;


	static setMouseCoordinates(x, y)
	{
		this.mouseX = x;
		this.mouseY = y;
	}

	static resetForceBase()
	{
		this.forceX = player.shape.x;
		this.forceY = player.shape.y;
	}

    //called when mouse is pressed down to make force projection longer and how far the lasso is thrown
	static incrementForce()
	{	
		Lasso.forceX+=(Lasso.mouseX-player.shape.x)/20;
		Lasso.forceY+=(Lasso.mouseY-player.shape.y)/20;

		//updates the length of the force
		var x = Lasso.forceX-player.shape.x;
		var y = Lasso.forceY - player.shape.y;
		Lasso.forceLength = Math.sqrt((x*x) + (y*y));
		Lasso.slope = y/x;

        Lasso.hankX = player.shape.x;
        Lasso.hankY = player.shape.y;
	}

	static changeMouseLocation(e)
	{ 
		//new location of cursor in reference to player
		const newX = e.clientX - player.shape.x;
		const newY = e.clientY - player.shape.y;

		//calculates length of force in reference to player's location
		const ratio = this.forceLength/Math.sqrt(newX*newX + newY*newY);

		//finds location of the end of the line
		const finalX = player.shape.x + (newX*ratio);
		const finalY = player.shape.y + (newY*ratio);

		//set forceX & forceY to new values 
		this.forceX = finalX;
		this.forceY = finalY;
		this.slope = newY/newX;
		
	}


    //increments the parts of the animation to call different functions
	static incrementLassoStage()
	{
		this.lassoCounter++;
		if(this.lassoCounter == 5)//this line will need to be changed as more of the lasso throw is implemented
		{
			this.lassoCounter = 0;
		}
		
	}


    //calls the correct function for the stage of the animation
	static drawLasso(ctx)
	{
		switch(this.lassoCounter)
		{
			case 0:
			break;
			
			case 1:
				Lasso.drawPreLasso(ctx);
			break;

			case 2:
				Lasso.throwLasso(ctx);
			break;

			 case 3: 
				Lasso.drawLassoFall(ctx);
			 break;

			case 4:
				Lasso.pullInLasso(ctx);
			break;

			 case 5:
			 	Lasso.lassoCaught(ctx);
			 break;
		}
	}
	


    //draw line method
    //called when cursor is being held down to draw the lasso projection
    static drawPreLasso(ctx)
    {
        const tempLineWidth = ctx.lineWidth;
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#8CA231";
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.moveTo(player.shape.x, player.shape.y)
       ctx.lineTo(this.forceX, this.forceY);
       
        ctx.stroke();

        //resetting everything for the rest of the code to work
        ctx.lineWidth = tempLineWidth;
        ctx.strokeStyle = "#000000"
        ctx.globalAlpha = 1;
    }

    //When space bar is pressed, lasso falls and pulls in until it catches on something 
    //called when spacebar is pressed
    static throwLasso(ctx)
    {
        this.lassoPoints = [];


        //divides paths into segments to create curve
        var segments = 10;
        var incrementX = (this.forceX-player.shape.x)/segments;
        var incrementY = (this.forceY-player.shape.y)/segments;
        var energyLoss = 0.85;
        var currPoint = new Point(player.shape.x, player.shape.y);
        var squiggliness = 30;

     
        //iterates through points to draw line with gradually decreasing slope
        for(var i = 0; i<segments*2; i+=2)
        {
            this.lassoPoints[i] = currPoint;
            //this.guidePoints.push(currPoint);
            currPoint = new Point(currPoint.x+incrementX, currPoint.y + (incrementY*Math.pow(energyLoss, i)));
        }


        //adds extra points to lassoPath to make squiggles
        var count = 0;
        for(var i = 1; i<segments*2-1; i+=2)
        {
            var xTemp = player.shape.x + incrementX*count + (Math.random()*incrementX);
          
            var yTemp = this.lassoPoints[i-1].y + incrementY*Math.pow(energyLoss, i) - Math.random()*squiggliness;
            count++;

            this.lassoPoints[i] = new Point(xTemp, yTemp);
        }
     
        this.incrementLassoStage();
    }


    //called to see if the lasso has fallen on anything 
    static lassoCollide(horizon, largerSlope)
    {
        //sees collision of horizon in reference to all registered obstructions
        //larger slope is used to have the lasso catch on things, seeing if it collides with anything above a 70 degree slope
        if(largerSlope){
            for(var i = 0; i<lines.length; i++)
            {
                //if()//check slope of each line before running testForLineCollision on it
            }

        } else{
            //otherwise it just returns true if it collides with anything at all

            for(var i = 0; i<lines.length; i++)
            {
                if(testForLineCollision(horizon, lines[i]))
                {
                    return(true);
                }
            }
            for (var i = 0; i < points.length; i++) {
                if (testForPointCollision(horizon, points[i])) {
                    return true;
                }
            }
         }

        return (false);


    }


    //called once the lasso has initially been drawn and animates its fall
    static drawLassoFall(ctx)
    {
        //draws lasso
        this.displayLasso(ctx);

         //update collideHorizon
         for(var i = 0; i<this.lassoPoints.length; i++)
         {
            this.collideHorizon[i] = {shape: new Circle(this.lassoPoints[i].x, this.lassoPoints[i].y, 5)};
         }
         
 
      
         //makes lasso move downwards 
        for(var i = 0; i<this.lassoPoints.length; i++)
        {
        
            //checks if a) points have collided with anything, b) they are stretching too far apart and drops the string further down if not
            if(!this.lassoCollide(this.collideHorizon[i], false) && 
             !(Math.abs(this.lassoPoints[i].y-this.lassoPoints[i-1])<=10||Math.abs(this.lassoPoints[i].y-this.lassoPoints[i+1])<=10))
            {
               this.lassoPoints[i].y+=3;//can be changed to grav acceleration
             }
        }
       
    }
    

    //called when up arrow is pushed
    static pullInLasso(ctx)
    {
        var pointsMoved = false;

        //makes the lasso point locations decrease/increase until they are in line with Hank 
        for(var i = 0; i<this.lassoPoints.length; i++)
        {
          if(!(this.lassoPoints[i].x<= this.hankX-3 || this.lassoPoints[i].x<= this.hankX+3)){
            this.lassoPoints[i].x = this.lassoPoints[i].x<Lasso.hankX? this.lassoPoints[i].xStart+=2 : this.lassoPoints[i].xStart-=2;
            pointsMoved = true;
          }

          //if last lasso point catches on a line that has a slope steeper than like 70 degrees, send to next stage
          if(this.lassoCollide(this.collideHorizon[this.collideHorizon.length-1], true))
          {
            this.lassoCounter++;
          }

        }
        
        //if points are all lined up with hank, deletes the lasso
        if(!pointsMoved)
        {
            this.lassoCounter = 0;
        }
        
        //draws the lasso
         this.displayLasso(ctx); 
    } 

    //called after lasso is pulled in and catches on something
    static lassoCaught(ctx)
    {
        //draws lasso
        this.displayLasso(ctx);


    }


    static displayLasso(ctx)
    {
        
         //settings for string style
         const tempLineWidth = ctx.lineWidth;
         ctx.lineWidth = 5;
         ctx.strokeStyle =  player.fillColor;
         //path for lasso and path for controlling lasso fall
         let lassoPath = new Path2D();

         ctx.lineCap = 'round';

         lassoPath.moveTo(this.lassoPoints[0].x, this.lassoPoints[0].y);

            //draws lasso string
       for(var i = 1; i<this.lassoPoints.length-3; i+=3)
       {
         lassoPath.bezierCurveTo(this.lassoPoints[i].x, this.lassoPoints[i].y, this.lassoPoints[i+1].x, this.lassoPoints[i+1].y, this.lassoPoints[i+2].x, this.lassoPoints[i+2].y);
        }
        ctx.stroke(lassoPath);
         
        ctx.lineWidth = tempLineWidth;
        ctx.strokeStyle = "#000000";

    }


    //can probably put in main class but a reels in and d adds slack
}



// ==================
// =LINE CLASS
// ==================


class Line {
    constructor(x1Start, y1, x2Start, y2, xOffset) {
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
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
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
            console.log("ERROR: 0 value for xChange in yChangeRate()");
            return false;
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

    get slopeIntercept() {
        const equation = [this.yChangeRate];
        const yInt = this.y1 + (-this.x1 * equation[0]);
        equation.push(yInt);
        return equation;
    }
} // end of Line


// ===============
// =POINT CLASS
// ===============

class Point {
    constructor(xStart, y, xOffset) {
        this.xStart = xStart;
        // this.x = xStart + xOffset;
        this.x = xStart;
        this.y = y;
    }

    adjustX(xOffset) {
        this.x = this.xStart + xOffset;
    }

    moveTo(x, y, xOffset) {
        this.xStart = x - xOffset;
        this.y = y;
        this.adjustX(xOffset);
    }

    draw(ctx) {
        ctx.fillStyle = "purple";
        ctx.fillRect(this.x - 2, this.y - 2, 5, 5);
    }
} // end of Point


// ==================
// =CIRCLE CLASS
// ==================


class Circle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    // color as string word
    fill(ctx, color) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
    }

    // color as string word
    outline(ctx, color) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
} // end of Circle


// ==================
// =BACKGROUND CLASS
// ==================


class Background {
    constructor(src, x, y, height) {
        this.img = new Image();
        this.img.src = src;
        this.widthFraction = this.img.width / this.img.height;
        this.startX = x;
        this.x = this.startX;
        this.y = 0;
        this.height = height;
        this.width = height * this.widthFraction;
    }

    updateOffset(xOffset) {
        this.x = this.startX + xOffset;
    }

    updateDimensions(height) {
        const widthFraction = this.img.width / this.img.height;
        this.height = height;
        this.width = height * widthFraction;
    }

    setStartX(newX) {
        this.startX = newX;
    }

    draw(ctx) {
        if (!this.img.src.includes("undefined")) {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }
}


