//bolds the box in settings which shows whether music and sfx are on or off
function bold(sound)
{
    if(game.music==true && (sound=="music"|| sound=="all") && window.location.href.includes("/levels/level"))
    {
        document.getElementById("musicOn").classList.add("bold"); 
        document.getElementById("musicOff").classList.remove("bold");  
    } else if(game.music== false && (sound=="music"|| sound=="all") && window.location.href.includes("/levels/level"))
    {
        document.getElementById("musicOff").classList.add("bold");
        document.getElementById("musicOn").classList.remove("bold");
    }
                
    if(game.sfx == true && (sound=="sfx"|| sound=="all") && window.location.href.includes("/levels/level"))
    {
        document.getElementById("sfxOn").classList.add("bold");
        document.getElementById("sfxOff").classList.remove("bold");
    } else if(game.sfx == false && (sound=="sfx"|| sound=="all") && window.location.href.includes("/levels/level"))
    {
        document.getElementById("sfxOff").classList.add("bold");
        document.getElementById("sfxOn").classList.remove("bold");
    }
}

//turns music on or off
function toggleMusic(onOrOff, audioExists)
{
    if(onOrOff == "on")
    {
        game.music = true;
                    
        if(audioExists){
            playMusic();
            storeData();
        }
    } else if(onOrOff=="off")
    {
        game.music = false;

        if(audioExists){
            pauseMusic(); 
            storeData();
        }
    }
}

//turns sound effects on or off
function toggleSfx(onOrOff, audioExists)
{
    if(onOrOff == "on")
    {
        game.sfx = true;

        if(audioExists)
        {

        }
    } else if(onOrOff=="off")
    {
        game.sfx = false; 
        if(audioExists)
        {
                        
        }
    }
} // end of toggleSfx


setTimeout(() => {bold("all")}, 100);


function pauseGame()
{
    document.getElementById("hiddenBtns").classList.remove("hidden");
    document.getElementById("pauseDiv").classList.remove("hidden");
    stop();
} // end of pauseGame

function playGame()
{
    console.log("play");
    document.getElementById("hiddenBtns").classList.add("hidden");
    document.getElementById("pauseDiv").classList.add("hidden");
    document.getElementById("settings").classList.add("hidden");
    main();
} // end of playGame