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
    static guidePoints;
    static lassoCounter = 0;

    //copy of lasso's variables because it's not working for some reason?
    static forceX = player.shape.x;
    static forceY = player.shape.y;
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
        console.log(this.mouseX + " " + this.mouseY);
	}

	static resetForceBase()
	{
		this.forceX = player.shape.x;
		this.forceY = player.shape.y;
	}


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


	static incrementLassoStage()
	{
        //console.log(this.lassoCounter);
		this.lassoCounter++;
		if(this.lassoCounter == 4)//this line will need to be changed as more of the lasso throw is implemented
		{
			this.lassoCounter = 0;
		}
		
	}


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

			// case 4:
			// 	lassoStage = "grabbing";
			// break;

			// case 5:
			// 	lassoStage = "at rest";
			// break;
		}
	}
	


    //draw line method
    //called when cursor is being held down
    static drawPreLasso(ctx)
    {
      //  console.log( this.hankX + " " + this.hankY + " " + this.pointX + " " + this.pointY);
        const tempLineWidth = ctx.lineWidth;
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#8CA231";
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.moveTo(player.shape.x, player.shape.y)
       // ctx.lineTo(this.pointX, this.pointY);
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
        this.guidePoints = [];

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
            this.guidePoints.push(currPoint);
            currPoint = new Point(currPoint.x+incrementX, currPoint.y + (incrementY*Math.pow(energyLoss, i)));
        }

       // incrementY = (this.forceY-player.shape.y)/segments;

        //adds extra points to lassoPath to make squiggles
        var count = 0;
        for(var i = 1; i<segments*2-1; i+=2)
        {
            var xTemp = player.shape.x + incrementX*count + (Math.random()*incrementX);
           // var rand = Math.random();
           // console.log(rand);
          //  var yTemp =  Math.random()>0.5 ? (this.lassoPoints[i-1].y + incrementY*Math.pow(energyLoss,i) + Math.random()*squiggliness) : this.lassoPoints[i-1].y + incrementY*Math.pow(energyLoss,i) - Math.random()*squiggliness ;
            var yTemp = this.lassoPoints[i-1].y + incrementY*Math.pow(energyLoss, i) - Math.random()*squiggliness;
            count++;

            this.lassoPoints[i] = new Point(xTemp, yTemp);
        }

        //lassoPath.smooth(); //maybe ctx.lineCap = 'smooth' - can figure out later;
        //all my prayers that this acually does something
     
        this.incrementLassoStage();
    }

    //notes to myself on what I'm planning to do lol
//    //make random points along to make line squiggly
        //make points sink and the starting draw point for line gets set to x of wherever the line has just touched the ground 
        //use an invisible line without wiggles to determine point of x
        //everything before x becomes just a straight line on ground
        //stops at x of the end of the squiggly line

        //need to clear the arrays of points when making a new line?
        //yeah, at least the guidePoints one, it's being weird


    static drawLassoFall(ctx)
    {
         //settings for string style
         const tempLineWidth = ctx.lineWidth;
         ctx.lineWidth = 5;
         ctx.strokeStyle =  player.fillColor;
         //path for lasso and path for controlling lasso fall
         let lassoPath = new Path2D();
         let guidePath = new Path2D();

         ctx.lineCap = 'round';

         lassoPath.moveTo(this.lassoPoints[0].x, this.lassoPoints[0].y);
         guidePath.moveTo(this.guidePoints[0].x, this.guidePoints[0].y);
 
       for(var i = 1; i<this.lassoPoints.length-3; i+=3)
       {
          //some typeerror in this line 
        //console.log(this.lassoPoints[i]);
         lassoPath.bezierCurveTo(this.lassoPoints[i].x, this.lassoPoints[i].y, this.lassoPoints[i+1].x, this.lassoPoints[i+1].y, this.lassoPoints[i+2].x, this.lassoPoints[i+2].y);
        }
        ctx.stroke(lassoPath);

        for(var i = 1; i<this.guidePoints.length; i++)
        {
            guidePath.lineTo(this.guidePoints[i].x, this.guidePoints[i].y);
        }
        //ctx.stroke(guidePath);

    
        ctx.lineWidth = tempLineWidth;
        ctx.strokeStyle = "#000000";
    }
    

    static pullInLasso()
    {
    } 


    //can probably put in main class but a reels in and d adds slack
}




