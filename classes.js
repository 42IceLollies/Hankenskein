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
    static lassoPoints = [];
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
		if(this.lassoCounter == 3)//this line will need to be changed as more of the lasso throw is implemented
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

			// case 3: 
			// 	lassoStage = "falling";
			// break;

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
        const tempLineWidth = ctx.lineWidth;
        ctx.lineWidth = 5;
        ctx.strokeStyle =  player.fillColor;

        let lassoPath = new Path2D();

        var segments = 10;
        var incrementX = (this.forceX-player.shape.x)/segments;
        var incrementY = (this.forceY-player.shape.y)/segments;
        var energyLoss = 0.85;
          var currPoint = new Point(player.shape.x, player.shape.y);

        lassoPath.moveTo(currPoint.x, currPoint.y);

        for(var i = 0; i<segments; i++)
        {
            this.lassoPoints.push(currPoint);
            currPoint = new Point(currPoint.x+incrementX, currPoint.y+incrementY);
            incrementY *= energyLoss;
            lassoPath.lineTo(currPoint.x, currPoint.y);
            ctx.stroke(lassoPath);
        }

        //lassoPath.smooth(); //maybe ctx.lineCap = 'smooth' - can figure out later;
        //all my prayers that this acually does something

        ctx.lineWidth = tempLineWidth;
        ctx.strokeStyle = "#000000";
    }

    static pullInLasso()
    {
    } 


    //can probably put in main class but a reels in and d adds slack
}




