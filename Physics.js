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

    static bounce(theSpeed){
        return -theSpeed;
    }
}


class Lasso{
    //method to calculate direction and force of throw, 
    //pointX and pointY incremented while cursor is held down, and function is called
    //also returns distance of line
    static getLassoForce(hankX, hankY, pointX, pointY)
    {
        lassoX = pointX<hankX ? -(hankX-pointX) : pointX-hankX;
        lassoY = pointY<hankY ? -(hankY-pointY) : pointY-hankY;

        //uses pythagorean theorum to find length of line from hankenskein to point location
        return Math.sqrt((lassoX * lassoX) + (lassoY * lassoY));
    }
        
    //draw line method
    //called when cursor is being held down
    static drawPreLasso(hankX, hankY, pointX, pointY, ctx)
    {
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(hankX, hankY);
        ctx.lineTo(pointX, pointY);
    }

    //method to release lasso when space bar is pressed with animation, falls and pulls in until catches on something 
    //called when spacebar is pressed
    static lassoRelease(){
        
    }


    //can probably put in main class but a reels in and d adds slack
}



