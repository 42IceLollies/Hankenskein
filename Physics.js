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


