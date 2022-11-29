class Physics{
    //gravity is -9.8 m/s^2 but I'm not entirely sure what a meter is in this game so feel free to change it
    static g = -9.8;
    static seconds = 0;
    static frameCount = 0;

   
     
    static getSeconds()
    {
        return this.seconds;
    }

    //pulls down player with gravitational accelleration
    static affectGravity(initYSpeed, ySpeed, timeOffGround)
    {
        //v = v0 + at
        //new ySpeed = input ySpeed when jumps + g * secs since beginning of jump
        ySpeed = initYSpeed + (this.g* timeOffGround);
        return ySpeed;
        //To Do: find a conversion between meters and pixels

    }


    static friction()//not static friction tho, just a static method for friction
    {
        //Equation for rolling friction: F = u * m/r
        // or F=umg? 
        //they're both equations but I'm not entirely clear what the difference between them is
        //with the first one, the friction would be less towards the end of the level
        //To Do: find the friction constant through experimentation, find mass/ radius and how it decays when it is unwound of ball of string

    }
}



