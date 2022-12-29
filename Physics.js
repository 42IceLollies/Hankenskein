class Physics{
    //gravity is -9.8 m/s^2 but I'm not entirely sure what a meter is in this game so feel free to change it
    static g = 9.8;
    static seconds = 0;
    static frameCount = 0;
    static lassoX = 0;
    static lassoY = 0;
     
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

    //method to release lasso when space bar is pressed with animation, falls and pulls in until catches on something 
    //called when spacebar is pressed
    static lassoRelease(){
        
    }


    //can probably put in main class but a reels in and d adds slack
}



