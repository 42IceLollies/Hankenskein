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
        if (Math.abs(speed) < 1) {
            speed = 0;
        }
        return speed;
    }
} // end of Physics




// ==================LASSO CLASS============================ (classo)

class Lasso {
    static lassoPoints;
    static collideHorizon = [];
    static lassoCounter = 0;

    //copy of lasso's variables because it's not working for some reason? - Was this a note I wrote to myself or was it someone else? (-Cordelia) - i dunno but I want to keep adding to this cause i think it's funny (-Ryan)
    static forceX = 0;
    static forceY = 0;
    // were causing loading issues, called resetForceBase() in start of other js file
    // static forceX = player.shape.x - game.xOffset;
    // static forceY = player.shape.y;
    static mouseX = 0;
    static mouseY = 0;
    static forceLength = 0;
    static intervalId = null;
    static slope = 0;
    static maxSegmentLength;
    static moveNum = 4;


	static setMouseCoordinates(x, y, xOffset)
	{
		this.mouseX = x;
		this.mouseY = y;
	}

	static resetForceBase()
	{
		this.forceX = player.shape.x - game.xOffset;
		this.forceY = player.shape.y;
	}

    //called when up arrow is pressed down to make force projection longer and how far the lasso is thrown
	static incrementForce()
	{	
		Lasso.forceX+=(Lasso.mouseX-player.shape.x)/20;
		Lasso.forceY+=(Lasso.mouseY-player.shape.y)/20;

		//updates the length of the force
		var x = Lasso.forceX - player.shape.x;
		var y = Lasso.forceY - player.shape.y;
		Lasso.forceLength = Math.sqrt((x*x) + (y*y));
        if (this.forceLength > game.canvas.height * 6) {this.forceLength = game.canvas.height * 6;}
		Lasso.slope = y/x;

        Lasso.hankX = player.shape.x;
        Lasso.hankY = player.shape.y;
	}

    static decrementForce() {
        Lasso.forceX-=(Lasso.mouseX-player.shape.x)/20;
        Lasso.forceY-=(Lasso.mouseY-player.shape.y)/20;

        //updates the length of the force
        var x = Lasso.forceX - (player.shape.x);
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

        if (this.forceLength > game.canvas.height * 6) {this.forceLength = game.canvas.height * 6;}

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
		if(this.lassoCounter == 6)//this line will need to be changed as more of the lasso throw is implemented
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
                this.resetForceBase();
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
                // Lasso.pullInLasso2(ctx);
                // Lasso.move(ctx);
                // Lasso.lassoPoints[0].moveTo(player.shape.x, player.shape.y, game.xOffset);
                // this.displayLasso(ctx);
                // console.log(Lasso.lassoPoints[0]);
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
        // ctx.lineWidth = 5;
        // so the lasso looks small on small screens
        ctx.lineWidth = game.canvas.height * .007;
        if (ctx.lineWidth < 1) {ctx.lineWidth = 1};
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
        this.moveNum = 4;
        this.lassoPoints = [];


        //divides paths into segments to create curve
        var segments = 10;
        var incrementX = (this.forceX-player.shape.x)/segments;
        var incrementY = (this.forceY-player.shape.y)/segments;
        var energyLoss = 0.85;
        var currPoint = new Point(player.shape.x-game.xOffset, player.shape.y);
        var squiggliness = 30;

     
        //iterates through points to draw line with gradually decreasing slope
        for(var i = 0; i<segments*2; i+= 2)
        {
            this.lassoPoints[i] = currPoint;
            //this.guidePoints.push(currPoint);
            currPoint = new Point(currPoint.x+incrementX, currPoint.y + (incrementY*Math.pow(energyLoss, i)));
        }


        //adds extra points to lassoPath to make squiggles
        var count = 0;
        for(var i = 1; i<segments*2-1; i+= 2)
        {
            var xTemp = player.shape.x-game.xOffset + incrementX*count + (Math.random()*incrementX);
          
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
            for(var i = 0; i<game.lines.length; i++)
            {
                //check slope of each line before running each one through line collision
                // console.log(Math.abs((lines[i].y1 - lines[i].y2))/Math.abs((lines[i].x1-lines[i].x2)));
              // console.log(lines.length);
              //  if(lines[i].x1-lines[i].x2 !=0 || Math.abs((lines[i].y1 - lines[i].y2))/Math.abs((lines[i].x1-lines[i].x2))>=0.5)
                if(game.lines[i].degree>=70)
                {
                   // console.log("yes");
                    if(testForLineCollision(horizon, game.lines[i]))
                    {
                        return(true);
                    }
                }
            }

        } else{
            //otherwise it just returns true if it collides with anything at all

            for(var i = 0; i<game.lines.length; i++)
            {
                if(testForLineCollision(horizon, game.lines[i]))
                {
                    return(true);
                }
            }
            for (var i = 0; i < game.points.length; i++) {
                if (testForPointCollision(horizon, game.points[i])) {
                    return true;
                }
            }
         }

        return (false);


    }


    //called once the lasso has initially been drawn and animates its fall
    static drawLassoFall(ctx)
    {

        //update collideHorizon
        for(var i = 0; i<this.lassoPoints.length; i++)
        {
            this.collideHorizon[i] = {shape: new Circle(this.lassoPoints[i].x, this.lassoPoints[i].y, 5)};
        }
         
        var pointsMoved = 0;


        // const xy = [player.shape.x, player.shape.y];
        // move the base point to be following the player
        this.lassoPoints[0].moveTo(player.shape.x, player.shape.y, game.xOffset);
 
      
        //makes lasso move downwards 
        for(var i = 1; i<this.lassoPoints.length; i++)
        {
        
            //checks if a) points have collided with anything, b) they are stretching too far apart and drops the string further down if not
            if(!this.lassoCollide(this.collideHorizon[i], false) && 
             !(Math.abs(this.lassoPoints[i].y-this.lassoPoints[i-1])<=10||Math.abs(this.lassoPoints[i].y-this.lassoPoints[i+1])<=10))
            {
               // this.lassoPoints[i].y+=3;//can be changed to grav acceleration
               this.lassoPoints[i].y += game.canvas.height * .005;
               pointsMoved++;
            }
        }

        if(pointsMoved ==0)
        {
            // console.log("incrementing");
            this.lassoCounter++;
        }
       
        this.displayLasso(ctx);
    } // end of drawFall
    

    //called when up arrow is pushed
    static pullInLasso(ctx)
    {
        // console.log("hi");
        var pointsMoved = false;

        //makes the lasso point locations decrease/increase until they are in line with Hank 
        for(var i = 0; i<this.lassoPoints.length; i++) {
            if(!(this.lassoPoints[i].x >= this.hankX-5 && this.lassoPoints[i].x <= this.hankX+5)) {
                this.lassoPoints[i].xStart = this.lassoPoints[i].x < Lasso.hankX ? this.lassoPoints[i].xStart+= 2 : this.lassoPoints[i].xStart-= 2;
                pointsMoved = true;
            }
            if (!(this.lassoPoints[i].y >= this.hankY+player.shape.radius-5 && this.lassoPoints[i].y <= this.hankY+player.shape.radius+5)) {
                this.lassoPoints[i].y = this.lassoPoints[i].y < Lasso.hankY + player.shape.radius - 5 ? this.lassoPoints[i].y+= 2 : this.lassoPoints[i].y-= 2;
            }

        //   //if last lasso point catches on a line that has a slope steeper than like 70 degrees, send to next stage
        //   if(this.lassoCollide(this.collideHorizon[this.collideHorizon.length-1], true))
        //   {
        //     this.lassoCounter++;
        //     break;
        //   }

        } // end of lassoPoints loop
        
        //if points are all lined up with hank, deletes the lasso
        if(!pointsMoved && this.lassoCounter != 5)
        {
            this.lassoCounter = 0;
        }
        
        //draws the lasso
        this.displayLasso(ctx);
    }

    static pullInLasso2(ctx) {
        var pointsMoved = false;

        const nextPointNum = 7;

        this.lassoPoints[this.lassoPoints.length - nextPointNum].adjustX(game.xOffset);
        const pointX = this.lassoPoints[this.lassoPoints.length - nextPointNum].x;
        const pointY = this.lassoPoints[this.lassoPoints.length - nextPointNum].y;

        // makes the lasso point locations decrease/increase until they are in line with Hank 
        for (var i = this.lassoPoints.length-this.moveNum; i < this.lassoPoints.length; i++) {
            if(!(this.lassoPoints[i].x >= pointX-5 && this.lassoPoints[i].x <= this.pointX+5)) {
                this.lassoPoints[i].xStart = this.lassoPoints[i].x < pointX ? this.lassoPoints[i].xStart+= 2 : this.lassoPoints[i].xStart-= 2;
                pointsMoved = true;
                console.log(this.lassoPoints[i].x + " | " + pointX);
            }
            // console.log(pointX, pointY);
            // console.log(this.lassoPoints[i]);
            // if (!(this.lassoPoints[i].y >= pointY + player.shape.radius-5 && this.lassoPoints[i].y <= pointY + player.shape.radius+5)) {
            //     this.lassoPoints[i].y = this.lassoPoints[i].y < pointY + player.shape.radius - 5 ? this.lassoPoints[i].y+= 2 : this.lassoPoints[i].y-= 2;
            //     pointsMoved = true;
            // }

        //   //if last lasso point catches on a line that has a slope steeper than like 70 degrees, send to next stage
        //   if(this.lassoCollide(this.collideHorizon[this.collideHorizon.length-1], true))
        //   {
        //     this.lassoCounter++;
        //     break;
        //   }

        } // end of lassoPoints loop

        if (this.withinRange(this.lassoPoints[this.lassoPoints.length-1].x, pointX-10, pointX+10)) {
            this.lassoPoints.splice(this.lassoPoints.length-3);

            // const nextPoint = this.lassoPoints[this.lassoPoints.length-this.moveNum-1];
            // for (let i = this.lassoPoints.length-this.moveNum; i < this.lassoPoints.length; i++) {
            //     this.lassoPoints[i].xStart = nextPoint.xStart;
            //     this.lassoPoints[i].y = nextPoint.y;
            // }
            // this.moveNum+=3;
        }
        
        //if points are all lined up with hank, deletes the lasso
        // if(!pointsMoved && this.lassoCounter != 5) {
        //     console.log("yeahyeah");
        //     this.lassoPoints.splice(this.lassoPoint.length-4);
        // }
        
        //draws the lasso
        this.displayLasso(ctx);
    }


    static withinRange(num, rangeStart, rangeEnd) {
        if (rangeStart < rangeEnd) {
            return (num >= rangeStart && num <= rangeEnd);
        } else {
            return (num >= rangeEnd && num <= rangeStart);
        }
    }

    static move(ctx) {
        // 19 points moving 2px each, 38 px movement == < for pullInLasso \/
        // when it's small it retracts faster, at a rate of 9% of game.canvas.height when it's good
        
        // save a copy of the old point
        const prevPoint = Lasso.lassoPoints[0].copy();
        prevPoint.adjustX(game.xOffset);
        // move the base point to the player
        Lasso.lassoPoints[0].moveTo(player.shape.x, player.shape.y, game.xOffset);
        // calculate the new added distance, sqrt of a^2 + b^2 = c
        const addedDistance = this.pythagorean(prevPoint.x - Lasso.lassoPoints[0].x, prevPoint.y - Lasso.lassoPoints[0].y);
        // const addedDistance = 2;
        // console.log(prevPoint, this.lassoPoints[0], addedDistance);
        let resolvedDistance = 0;

        // drop a new point if it's longer than the max segment length

        for (let i = Lasso.lassoPoints.length-1; i > 0; i--) {
            if (resolvedDistance >= addedDistance) {return;}
            // console.log(i);

            let currPoint = Lasso.lassoPoints[i];
            const nextPoint = Lasso.lassoPoints[i-1];

            // find the distance to the next point
            const pointDifference = this.pythagorean(currPoint.x - nextPoint.x, currPoint.y - nextPoint.y);
            // if it's less than the amount moved, delete this point and reduce the distance
            if (pointDifference < addedDistance - resolvedDistance) {
                console.log("yeah");
                Lasso.lassoPoints.splice(Lasso.lassoPoints.length-1);
                resolvedDistance += pointDifference;
                if (this.lassoPoints.length < 2) {this.lassoCounter = 0;}
            } else if (addedDistance - resolvedDistance > 0) {
                // console.log("else");
                // find the fraction of the distance we have to move
                const moveFraction = (addedDistance - resolvedDistance) / pointDifference;
                // console.log("mark" + moveFraction);
                // console.log(pointDifference);
                const xMove = (currPoint.x - nextPoint.x) * moveFraction;
                // console.log(xMove);
                const yMove = (currPoint.y - nextPoint.y) * moveFraction;
                // console.log(xMove, yMove);

                const currCopy = currPoint.copy();
                currCopy.adjustX(game.xOffset);

                this.lassoPoints[this.lassoPoints.length-1].xStart -= xMove; 
                this.lassoPoints[this.lassoPoints.length-1].y -= yMove;

                // this.lassoPoints[this.lassoPoints.length-1].moveTo(currPoint.x - xMove, currPoint.y - yMove, game.xOffset);
                this.lassoPoints[this.lassoPoints.length-1].adjustX(game.xOffset);
                resolvedDistance += this.pythagorean(xMove, yMove);
                // console.log(resolvedDistance);

                // console.log(currCopy.x + ", " + currCopy.y + " || " + currPoint.x + ", " + currPoint.y);

                currPoint = this.lassoPoints[i];
                // console.log(currCopy.x - currPoint.x, currCopy.y - currPoint.y);

                this.displayLasso(ctx);
                
                return;
            }
        }

        // for (let i = 1; i < Lasso.lassoPoints.length; i++) {
        //     // move towards where the previous point was
        //     // no, move towards where it is now, don't use the previous point
        //     // old stuff ^
        // }

        // just shorten the end and make new points on the player end

    }

    //called after lasso is pulled in and catches on something
    static lassoCaught(ctx)
    {
        //draws lasso
        this.displayLasso(ctx);
        //currently has bugs in something I'm not sure how it works so I'm worried about messing it up but...
        //here's some pseudocode
        //call lassoCollide function, with true for larger slope and passing in collide horizon of the point at the end of the lasso
        //method should return true if the point is in contact with a line steeper than a certain slope
        //if it catches, move on to pull in hank method
        //if it fully pulls in and the end reaches hank's coordinates, return to lassoCounter = 0
    }

    static pullInHank(ctx)
    {
        //this one I'm not so sure about how to do, will need to move hank's x value closer to the end of the lasso
        //and kinda just reverse

    }

    // I used it a lot, and need it to be accessible
    static pythagorean(a, b) {
        return Math.sqrt(Math.pow(Math.abs(a), 2) + Math.pow(Math.abs(b), 2));
    }


    static displayLasso(ctx)
    {
        
         //settings for string style
         const tempLineWidth = ctx.lineWidth;
         // ctx.lineWidth = 5;
         // so it shrinks with the screen
         ctx.lineWidth = game.canvas.height * .009;
         if (ctx.lineWidth < 1) {ctx.lineWidth = 1;}

         ctx.strokeStyle =  player.fillColor;
         //path for lasso and path for controlling lasso fall
         let lassoPath = new Path2D();

         ctx.lineCap = 'round';

         lassoPath.moveTo(this.lassoPoints[0].x, this.lassoPoints[0].y);

        // draws lasso string
        for(var i = 1; i<this.lassoPoints.length-3; i+=3)
        {
            lassoPath.bezierCurveTo(this.lassoPoints[i].x, this.lassoPoints[i].y, this.lassoPoints[i+1].x, this.lassoPoints[i+1].y, this.lassoPoints[i+2].x, this.lassoPoints[i+2].y);
        }
        ctx.stroke(lassoPath);
         
        ctx.lineWidth = tempLineWidth;
        ctx.strokeStyle = "#000000";

    }

    // static displayLasso(ctx) {
    //     //settings for string style
    //      const tempLineWidth = ctx.lineWidth;
    //     // ctx.lineWidth = 5;
    //     // so it shrinks with the screen
    //     ctx.lineWidth = game.canvas.height * .009;
    //     if (ctx.lineWidth < 1) {ctx.lineWidth = 1;}

    //     ctx.strokeStyle =  player.fillColor;
    //     //path for lasso and path for controlling lasso fall
    //     let lassoPath = new Path2D();

    //     ctx.lineCap = 'round';

    //     lassoPath.moveTo(this.lassoPoints[0].x, this.lassoPoints[0].y);

    //     // draws lasso string
    //     for(var i = 1; i<this.lassoPoints.length-2; i+=2) {
    //         lassoPath.quadraticCurveTO(this.lassoPoints[i].x, this.lassoPoints[i].y, this.lassoPoints[i+1].x, this.lassoPoints[i+1].y);
    //     }
    //     ctx.stroke(lassoPath);
         
    //     ctx.lineWidth = tempLineWidth;
    //     ctx.strokeStyle = "#000000";
    // }


    //can probably put in main class but a reels in and d adds slack
} // end of Lasso



// ==================
// =2nd LASSO CLASS
// ==================



class Lasso2 {
    constructor() {
        // the radius of the circle used for collision around points
        this.collideRadius = game.canvas.height * 0.015;
        // the point that stays with player
        this.start = new Point(0, 0);
        // the point moving out
        // this.endPoint = new Point(0, 0);
        // circle that acts as collision detection for the point
        // this.endCircle = new Circle(0, 0, this.collideRadius);
        this.end = {
            shape: new Circle(0, 0, this.collideRadius),
            xSpeed: 0, // horizontal speed in [px/s]
            ySpeed: 0, // vertical speed in [px/s]
        }
        this.forceX = 0;
        this.forceY = 0;
        this.mouseCoords = [0, 0];
        this.forceLength = 0;
        this.slope = 0;
        // 0: nothing | 1: aiming | 2: 
        this.stage = 0;
    } // end of constructor


    // updates parts that need to be routinely updated
    update(xOffset, mouse) {
        this.collideRadius = game.canvas.height * 0.015;
        this.end.shape.radius = this.collideRadius;
        // move start to be under the player
        this.start.moveTo(player.shape.x, player.shape.y, xOffset);
        // reset forceLength if not stage 1
        if (this.stage != 1) {this.resetForceBase();}
        // sets the mouse location
        this.mouseCoords = mouse;
    } // end of update


    // I used it a lot, and need it to be accessible
    static pythagorean(a, b) {
        return Math.sqrt(Math.pow(Math.abs(a), 2) + Math.pow(Math.abs(b), 2));
    } // end of pythagorean


    // test if num is within the given range
    static withinRange(num, rangeStart, rangeEnd) {
        if (rangeStart < rangeEnd) {
            return (num >= rangeStart && num <= rangeEnd);
        } else {
            return (num >= rangeEnd && num <= rangeStart);
        }
    } // end of withinRange


    setMouseCoordinants(x, y) {
        this.mouseCoords = [x, y];
    } // end of setMouseCoordinants


    resetForceBase() {
        this.forceX = player.shape.x - game.xOffset;
        this.forceY = player.shape.y;
        this.forceLength = 0;
    } // end of resetForceBase


    // called when up arrow is pressed down to make force projection longer and how far the lasso is thrown
    incrementForce() {   
        this.forceX += (this.mouseCoords[0]-player.shape.x)/20;
        this.forceY += (this.mouseCoords[1]-player.shape.y)/20;

        //updates the length of the force
        var x = this.forceX - player.shape.x;
        var y = this.forceY - player.shape.y;
        this.forceLength = Math.sqrt((x*x) + (y*y));
        if (this.forceLength > game.canvas.height * 6) {this.forceLength = game.canvas.height * 6;}
        this.slope = y/x;

        if (this.stage == 0) {this.stage++;}
    } // end of incrementForce


    decrementForce() {
        this.forceX -= (this.mouseCoords[0]-player.shape.x)/20;
        this.forceY -= (this.mouseCoords[1]-player.shape.y)/20;

        //updates the length of the force
        var x = this.forceX - (player.shape.x);
        var y = this.forceY - player.shape.y;
        this.forceLength = Math.sqrt((x*x) + (y*y));
        this.slope = y/x;

        if (this.stage == 0) {this.stage++;}
    } // end of decrementForce


    changeMouseLocation(e) { 
        //new location of cursor in reference to player
        const newX = e.clientX - player.shape.x;
        const newY = e.clientY - player.shape.y;

        if (this.forceLength > game.canvas.height * 6) {this.forceLength = game.canvas.height * 6;}

        //calculates length of force in reference to player's location
        const ratio = this.forceLength/Math.sqrt(newX*newX + newY*newY);

        //finds location of the end of the line
        const finalX = player.shape.x + (newX*ratio);
        const finalY = player.shape.y + (newY*ratio);

        //set forceX & forceY to new values
        this.forceX = finalX;
        this.forceY = finalY;
        this.slope = newY/newX;
    } // end of changeMouseLocation


    drawAiming(ctx) {
        const tempLineWidth = ctx.lineWidth;
        // ctx.lineWidth = 5;
        // so the lasso looks small on small screens
        ctx.lineWidth = game.canvas.height * .007;
        if (ctx.lineWidth < 1) {ctx.lineWidth = 1};
        ctx.strokeStyle = "#8CA231";
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.forceX, this.forceY);
       
        ctx.stroke();

        //resetting everything for the rest of the code to work
        ctx.lineWidth = tempLineWidth;
        ctx.strokeStyle = "#000000"
        ctx.globalAlpha = 1;
    } // end of drawAiming


    // for testing purposes
    // draws the end point collision circle
    endDraw(ctx) {
        const prevFillColor = ctx.fillColor;
        ctx.fillStyle = "#ff0000"
        
        ctx.beginPath();
        
        const x = this.end.shape.x - this.end.shape.radius;
        const y = this.end.shape.y;
        const radius = this.end.shape.radius;

        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = prevFillColor;
    } // end of drawEnd


    // draws the arc from start to end points
    // color should be acceptable by ctx.fillStyle directly
    drawArc(ctx, color) {
        // MAKES A STRAIGHT LINE RIGHT NOW, NEED A CONSISTENT WAY TO FIND A CONTROL POINT
        const prevColor = ctx.strokeStyle;

        // const start = [this.start.x, this.start.y];
        // const end = [this.end.shape.x, this.end.shape.y];
        const start = {x: this.start.x, y: this.start.y};
        const end = {x: this.end.shape.x, y: this.end.shape.y};

        const middle = {x: start.x + (end.x - start.x)/2, y: start.y + (end.y - start.y)/2};
        // const middle = {x: start.x + 2*(end.x - start.x), y: start.y + 2*(end.y - start.y)};

        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.strokeStyle = "dd0000";

        ctx.moveTo(start.x, start.y);
        ctx.quadraticCurveTo(middle.x, middle.y, end.x, end.y);
        ctx.stroke();

        ctx.strokeStyle = prevColor;
    } // end of drawArc


    // draws the lasso in all of it's stages
    draw(ctx) {
        switch(this.stage) {
            case 0:
                break;
            case 1: // pre-lasso/aiming
                this.drawAiming(ctx);
                break;
            case 2: // thrown and moving
                this.endDraw(ctx);
                this.drawArc(ctx, player.fillColor);
                break;
        }
    } // end of draw


    // throws the end point out | called in stage 1
    throw() {
        if (this.stage != 1) {return;} // only call in stage 1
        this.stage++; // move to stage 2

        this.end.shape.moveTo(player.shape.x, player.shape.y, game.xOffset);

        // this.end.xSpeed = (this.forceX - player.shape.x) / 2;
        // this.end.ySpeed = (this.forceY - player.shape.y) * 1.5;

        this.end.xSpeed = (this.forceX - player.shape.x) / 1.5;
        this.end.ySpeed = (this.forceY - player.shape.y);
    } // end of throw


    // adds gravity to the end that's launched
    endFall(gravityAmount) { // get gravity from Physics.gravity, same as player with adjustments as needed
        this.end.ySpeed += gravityAmount / 1.8;
    } // end of endFall


    // moves the end's x and y based on their respective speeds
    endMove(fps) {
        this.end.shape.x += this.end.xSpeed / fps;
        this.end.shape.y += this.end.ySpeed / fps;
    }


    // planning on testing for collision in the environment js file
    // grabs the end onto a fixed point
    endGrab() {

    } // end of endGrab
} // end of Lasso2



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
    constructor(xStart, y) {
        this.xStart = xStart;
        this.x = xStart;
        this.y = y;
    }

    adjustX(xOffset) {
        this.x = this.xStart + xOffset;
    }

    moveTo(x, y, xOffset) {
        this.xStart = x - xOffset;
        this.y = y;
        this.x = x;
        // this.adjustX(xOffset);
    }

    draw(ctx) {
        ctx.fillStyle = "purple";
        ctx.fillRect(this.x - 2, this.y - 2, 5, 5);
    }

    copy() {
        return new Point(this.xStart, this.y);
    }

    equals(other) {
        return this.x == other.x && this.y == other.y;
    }
} // end of Point


// ==================
// =CIRCLE CLASS
// ==================


class Circle {
    constructor(x, y, radius) {
        this.x = x;
        this.xStart = x;
        this.y = y;
        this.radius = radius;
    }

    // move according to the offset
    adjustX(xOffset) {
        this.x = this.xStart + xOffset;
    }

    // move to a new spot
    moveTo(x, y, xOffset) {
        this.x = x;
        this.xStart = x - xOffset;
        this.y = y;
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
} // end of Background


// ==================
// =YARN TRAIL CLASS
// ==================


class YarnTrail {
    // basePoint [x, y]
    constructor(basePoint, xOffset) {
        this.basePoint = new Point(basePoint[0], basePoint[1], xOffset);
        this.trailPoints = [];
    }

    draw(ctx) {

        //settings for string style
        const tempLineWidth = ctx.lineWidth;
        // so it shrinks with the screen
        ctx.lineWidth = game.canvas.height * .009;
        if (ctx.lineWidth < 1) {ctx.lineWidth = 1;}

        ctx.strokeStyle =  player.fillColor;
        // path for lasso and path for controlling lasso fall
        let trailPath = new Path2D();

        ctx.lineCap = 'round';

        trailPath.moveTo(this.basePoint.x, this.basePoint.y);

        // draws lasso string
        for (let i = 1; i < this.lassoPoints.length; i++) {
            // lassoPath.bezierCurveTo(this.trailPoints[i].x, this.trailPoints[i].y, this.trailPoints[i+1].x, this.trailPoints[i+1].y, this.trailPoints[i+2].x, this.trailPoints[i+2].y);
        }
        ctx.stroke(trailPath);
         
        ctx.lineWidth = tempLineWidth;
        ctx.strokeStyle = "#000000";

    } // end of draw
} // end of yarnTrail



// ==================
// =BACKUP CLASS
// ==================



class Backup {
    // if you change this, it'll lose all track of all the save data's location. Only change in the very beginning if you think of a better key
    // the key in local storage, for the array that holds all the keys that've been used
    static listKey = "saveDataKeyList!@!";
  
  
    // saves parameter 2 under parameter 1 in local storage
    static save(key, data) {
    // can't override the list of keys
    if (key == this.listKey) {
        console.error("Forbidden key name: " + key);
      return; // end it early
    }
    // stringify the data so it doesn't get badly automatically converted
    data = JSON.stringify(data);
    // save it to local storage
      localStorage.setItem(key, data);
    
    // ====== LOG KEY =======
    // get the keylist
    const keyList = Backup.getKeyList();
    // if the key's not in the list (it's not just being overwritten)
    if (!keyList.includes(key)) {
      // add the key name to the array
      keyList.push(key);
    }
    // resave the array to localStorage
    localStorage.setItem(this.listKey, JSON.stringify(keyList));
    } // end of save()
  
  
  
    // gets the value associated with the given key in local storage
    static retrieve(key) {
        // can't accidentally get the value for the keyList
        if (key == this.listKey) {
            console.error("Forbidden key name: " + key);
        return; // end it early
        }
        // gets the data from local storage
        let data = localStorage.getItem(key);
        // un-stringify it before returning it
        data = JSON.parse(data);
        return data;
    } // end of retrieve()
  
  
  
    // removes the key and associated data from local storage
    static remove(key) {
        // can't remove the keyList
        if (key == this.listKey) {
            console.error("Forbidden key name: " + key);
            return; // end it early
        }
        // remove it from local storage
        localStorage.removeItem(key);
    
        // remove the key from the keyList in localStorage
        // ======= UNLOG KEY =========
        // get the keylist
        const keyList = Backup.getKeyList();
        // get the index of the key in the array
        const index = keyList.indexOf(key);
        // if it's in the array
        if (index > -1) {
            // cut it out
            keyList.splice(index, 1);
        }
        // resave the array to localStorage
        localStorage.setItem(this.listKey, JSON.stringify(keyList));
    } // end of remove
  
  
    // returns the array of localStorage keys from localStorage
    static getKeyList() {
        let keyList;
        // if it hasn't been created
        if (localStorage.getItem(this.listKey) === null) {
            // make it an empty array
            keyList = [];
        // if it already exists
        } else {
            // get the array from local storage
            keyList = localStorage.getItem(this.listKey);
            // if it's nothing
            if (keyList == "") {
                // make it an empty array, to be handled easier
                keyList = [];
            // if there's stuff in it
            } else {
                // un-stringify it
                keyList = JSON.parse(keyList);
            }
        } // end of else

        return keyList;
    } // end of getKeyList
  
} // end of Backup 