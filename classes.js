class Physics{
    //gravity is -9.8 m/s^2 but I'm not entirely sure what a meter is in this game so feel free to change it
    static g = 9.8;
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


class Lasso{
    static hankX;
    static hankY;
    static pointX;
    static pointY;
    static lassoX;
    static lassoY;
    static lassoPoints = [];

    static setLassoProperties(hankX, hankY, pointX, pointY)
    {
        this.hankX = hankX;
        this.hankY = hankY;
        this.pointX = pointX;
        this.pointY = pointY;
       // console.log(pointX + ", " + pointY);
    }

    static setHankProperties(hankX, hankY)
    {
        this.hankX = hankX;
        this.hankY = hankY;
    }

    static setPointProperties(pointX, pointY)
    {
        this.pointX = pointX;
        this.pointY = pointY; 
    }


    //method to calculate direction and force of throw, 
    //pointX and pointY incremented while cursor is held down, and function is called
    //also returns distance of line
    static getLassoForce()
    {
        this.lassoX = this.pointX<this.hankX ? -(this.hankX-this.pointX) : this.pointX-this.hankX;
        this.lassoY = this.pointY<this.hankY ? -(this.hankY-this.pointY) : this.pointY-this.hankY;

        //uses pythagorean theorum to find length of line from hankenskein to point location
        return Math.sqrt((this.lassoX * this.lassoX) + (this.lassoY * this.lassoY));
    }

        
    //draw line method
    //called when cursor is being held down
    static drawPreLasso(ctx)
    {
        const tempLineWidth = ctx.lineWidth;
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#8CA231";
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(this.hankX, this.hankY);
        ctx.lineTo(this.pointX, this.pointY);
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
        var incrementX = (this.pointX-this.hankX)/segments;
        var incrementY = (this.pointY-this.hankY)/segments;
        var energyLoss = 0.85;
        var currPoint = new Point(this.hankX, this.hankY);

        lassoPath.moveTo(currPoint.x, currPoint.y); //might have to add getters but not entirely sure how js works

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

    static drawLasso()
    {
        //loop drawing lasso with x and y growing closer to the full length of prospected line 

    } 


    //can probably put in main class but a reels in and d adds slack
}




