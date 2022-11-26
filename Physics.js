class Physics{
    //gravity is -9.8 m/s^2 but I'm not entirely sure what a meter is in this game so feel free to change it
    //I'm going to say hankenskein is a tenth of a meter in diameter to make things easy
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
        // console.log(ySpeed);
        return ySpeed;

    }
}



