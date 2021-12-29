// By Andreas Faisst, December 2021
// Graphics from: https://www.gamedeveloperstudio.com/

// Canvas setup
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 700;
canvas.height = 400;

let gamestarted = false;
let score = 0;
let gameFrame = 0;
let gameOver = false;
ctx.font = '30px Georgia';
ctx.textAlign = "center";
ctx.textBaseline = "middle"

// Mouse Interactivity
let canvasPosition = canvas.getBoundingClientRect();
const mouse = {
    x: canvas.width/2,
    y: canvas.height/2,
    click:false
}
canvas.addEventListener('mousedown', function(event){
    mouse.click = true;
    mouse.x = event.x - canvasPosition.left;
    mouse.y = event.y - canvasPosition.top;
});
canvas.addEventListener('mouseup' , function(){
    mouse.click = false;
});

window.addEventListener('keydown' , function(event){
    if (event.code === "Space" && !gamestarted) {
        
        gameOver = false;
        animate();
        gamestarted = true;
    }
});


// Player -------------------
const playerImageLeft = new Image();
playerImageLeft.src = "./graphics/player1_Left.png";
const playerImageRight = new Image();
playerImageRight.src = "./graphics/player1_Right.png";

class Player {
    constructor(){
        this.x = canvas.width/2;
        this.y = canvas.height/2;
        this.radius = 30;
        this.angle = 0;
        this.frame = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.frametotX = 4;
        this.frametotY = 3;
        this.spriteWidth = 1992.0 / this.frametotX;
        this.spriteHeight = 981.0 / this.frametotY;
    }
    update() {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        
        // looking angle
        // Note that the fish should be horizontal if not moving.
        const theta = Math.atan2(dy , dx)
        this.angle = theta;
        if (Math.sqrt(dx*dx + dy*dy) < 10){
            if (this.x <= mouse.x){
                this.angle = 180 * Math.PI/180;
            } else {
                this.angle = 0;
            } 
        }

        // Move the fish
        if (mouse.x != this.x){
            this.x -= dx/30;
        }
        if (mouse.y != this.y){
            this.y -= dy/30;
        }
    }
    draw(){
        
        /*if (mouse.click){
            ctx.lineWidth = 0.2;
            ctx.beginPath();
            ctx.moveTo(this.x , this.y);
            ctx.lineTo(mouse.x , mouse.y);
            ctx.stroke();
            ctx.closePath();
        }*/
        
        /*ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius , 0 , Math.PI * 2 , true);
        ctx.fill();
        ctx.closePath();*/

        if (gameFrame % 8 == 0){
            this.frame++;
        }
        if (this.frame >= (this.frametotX*this.frametotY)) this.frame = 0;
        this.frameX = this.frame % 4;
        this.frameY = Math.ceil( (this.frame+1)/4 ) - 1; 
        if (this.x <= mouse.x) this.frameX = 3-this.frameX; // fix animation because flipped image

        ctx.save();
        ctx.translate(this.x , this.y);
        ctx.rotate(this.angle);
        if (this.x <= mouse.x){
            ctx.drawImage(playerImageRight ,
                this.frameX*this.spriteWidth , this.frameY*this.spriteHeight,
                this.spriteWidth, this.spriteHeight,
                0 - 35, 0 - 25 , this.spriteWidth/6.5 , this.spriteHeight/6.5)
        } else {
            ctx.drawImage(playerImageLeft ,
                this.frameX*this.spriteWidth , this.frameY*this.spriteHeight,
                this.spriteWidth, this.spriteHeight,
                0 - 35, 0 - 25 , this.spriteWidth/6.5 , this.spriteHeight/6.5)
        }
        ctx.restore();
        
    }
}
const player = new Player();





// Shark
const sharksArray = [];
const sharkImageLeft = new Image();
sharkImageLeft.src = "./graphics/enemy1_Left.png";
const sharkImageRight = new Image();
sharkImageRight.src = "./graphics/enemy1_Right.png";


class Shark{
    constructor(){
        this.radius = 50;
        
        this.entryedge = 1;
        this.entryedge = Math.round( Math.random()*1+1 );
        if (this.entryedge == 1){
            this.x = canvas.width + this.radius*2;
            this.y = Math.random()*(canvas.height-20) + 20;
            this.vsignx = -1
            this.vsigny = 1;
        } else {
            this.x = 0 - this.radius*2;
            this.y = Math.random()*(canvas.height-20) + 20;
            this.vsignx = 1
            this.vsigny = 1;
        }

        
        this.vx = this.vsignx * (Math.random()*2+1);
        this.vy = this.vsigny * 0.0;

        this.distance;
        this.attack = false;
        this.counted = false;
        this.influence = Math.random()*2.5 + 1.5; // radius of includence in this.radius

        this.angle = 0;
        this.frame = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.frametot = 6;
        this.spriteWidth = 1536.0 / 6.0;
        this.spriteHeight = 256.0 / 1.0;
    }
    update(){
        const dx = this.x - player.x; // distance to player
        const dy = this.y - player.y;

        // compute distance for collision and attraction
        this.distance = Math.sqrt( dx*dx + dy*dy );

        // attack
        //if (this.distance < Math.sqrt( canvas.width*canvas.width + canvas.height*canvas.height )*0.2){
        if (this.distance < this.radius*this.influence){
            this.x = this.x - dx/100;
            this.y = this.y - dy/100;
            if (this.x >= player.x){ // have to add X degs to angle
                this.angle = Math.atan2(dy , dx);
            } else {
                this.angle = Math.atan2(dy , dx) + 180*Math.PI/180;
            }
            this.attack = true;

        } else {
            this.x = this.x + this.vx;
            this.y = this.y + this.vy;
            this.angle = 0;
            this.attack = false;
        }
        
    }
    draw(){
        /*ctx.fillStyle = 'green';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius , 0 , Math.PI * 2 , true);
        ctx.fill();
        ctx.closePath();*/

        if (gameFrame % 12 == 0){
            this.frame++;
        }
        if (this.frame >= this.frametot) this.frame = 0;
        this.frameX = this.frame;

        ctx.save();
        ctx.translate(this.x , this.y);
        ctx.rotate(this.angle);
        if (!this.attack){
            if (this.vsignx < 0){
                ctx.drawImage(sharkImageLeft ,
                    this.frameX*this.spriteWidth , this.frameY*this.spriteHeight,
                    this.spriteWidth, this.spriteHeight,
                    0 - 65, 0 - 60 , this.spriteWidth*0.48 , this.spriteHeight*0.48);
            } else {
                ctx.drawImage(sharkImageRight ,
                    this.frameX*this.spriteWidth , this.frameY*this.spriteHeight,
                    this.spriteWidth, this.spriteHeight,
                    0 - 65, 0 - 60 , this.spriteWidth*0.48 , this.spriteHeight*0.48);
            }

        } else {
            if (this.x >= player.x){
                ctx.drawImage(sharkImageLeft ,
                    this.frameX*this.spriteWidth , this.frameY*this.spriteHeight,
                    this.spriteWidth, this.spriteHeight,
                    0 - 65, 0 - 60 , this.spriteWidth*0.48 , this.spriteHeight*0.48);
            } else {
                ctx.drawImage(sharkImageRight ,
                    this.frameX*this.spriteWidth , this.frameY*this.spriteHeight,
                    this.spriteWidth, this.spriteHeight,
                    0 - 65, 0 - 60 , this.spriteWidth*0.48 , this.spriteHeight*0.48);
            }
            
        }

        
        ctx.restore();

    }
}
function handleSharks(){
    if ( (gameFrame % 50 == 0) && (sharksArray.length < Math.ceil(score / 20)) ){
        sharksArray.push(new Shark());
    }
    for (let i = 0; i < sharksArray.length; i++){
        sharksArray[i].update();
        sharksArray[i].draw();
    }
    for (let i = 0; i < sharksArray.length; i++){ // do separate loop to avoid flickering
        if (sharksArray[i].distance < (sharksArray[i].radius + player.radius) ){
            if (!sharksArray[i].counted){
                //alert("Game Over (eaten by shark)");
                gameOver = true;
                sharksArray[i].counted = true;
                sharksArray.splice(i,1);
            }
        } else {
            if ( (sharksArray[i].x > (canvas.width + sharksArray[i].radius*2)) || (sharksArray[i].x < (0-sharksArray[i].radius*2)) ) {
                sharksArray.splice(i,1);
            }
        }

    }


}

// Bubbles
const bubblesArray = [];
const bubbleImage = new Image();
bubbleImage.src = "./graphics/bubblepop.png";
class Bubble{
    constructor(){
        this.radius = 20;
        this.x = Math.random() * (canvas.width - this.radius) + this.radius;
        this.y = canvas.height + this.radius;
        
        this.speed = Math.random() * 5 + 1;
        this.distance;
        this.counted = false;

        this.frame = 0;
        this.frameX = 0;
        this.frameY = 0;
        this.spriteWidth = 2048 / 4.0;
        this.spriteHeight = 1024 / 2.0;
    }
    update(){
        this.y -= this.speed;
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        this.distance = Math.sqrt( dx*dx + dy*dy );
    }
    draw(){
        /*ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius , 0 , Math.PI * 2 , true);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();*/
        ctx.drawImage(bubbleImage,
            this.frameX*this.spriteWidth, this.frameY*this.spriteHeight,
            this.spriteWidth, this.spriteHeight ,
            this.x-29 , this.y-27.5 , this.spriteWidth*0.112 , this.spriteHeight*0.112);
    }
}
function handleBubbles(){
    if (gameFrame % 50 == 0){
        bubblesArray.push(new Bubble());
    }
    for (let i = 0; i < bubblesArray.length; i++){
        bubblesArray[i].update();
        bubblesArray[i].draw();

        if (bubblesArray[i].y < (0 - bubblesArray[i].radius*2) ){
            bubblesArray.splice(i,1);
            i--;
        } else {
            if (bubblesArray[i].distance < (bubblesArray[i].radius + player.radius) ){
                if (!bubblesArray[i].counted){
                    score++;
                    bubblesArray[i].counted =true;
                    bubblesArray.splice(i,1);
                    i--;
                }
            }
        }

    }
    
}

// Game over
function handleGameOver(){
    if (gameOver){

        ctx.lineWidth = 3;
        ctx.strokeText('Game Over! Score: ' + score , canvas.width/2 , canvas.height/2);
        ctx.strokeText('press Space Bar to continue', canvas.width/2 , canvas.height/2+100);

        ctx.fillStyle = "cyan";
        ctx.fillText('Game Over! Score: ' + score , canvas.width/2 , canvas.height/2);
        ctx.fillText('press Space Bar to continue', canvas.width/2 , canvas.height/2+100);

        score = 0; 
        gamestarted = false;   
    }
}

//Animation Loop
function animate(){
    ctx.clearRect(0, 0, canvas.width , canvas.height);
    handleBubbles();
    handleSharks();
    
    player.update();
    player.draw();

    // score
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' + score , 70, 30);
    
    handleGameOver();
    gameFrame++;
    if (!gameOver) requestAnimationFrame(animate);
}

// Start game
function start(){

    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.strokeText('Catch the bubbles and', canvas.width/2, canvas.height/2-20);
    ctx.strokeText('avoid the other fish', canvas.width/2, canvas.height/2+20);
    ctx.strokeText('press SPACE BAR to START', canvas.width/2, canvas.height/2+100);

    ctx.fillStyle = 'white';
    ctx.fillText('Catch the bubbles and', canvas.width/2, canvas.height/2-20);
    ctx.fillText('avoid the other fish', canvas.width/2, canvas.height/2+20);

    ctx.fillStyle = 'cyan';
    ctx.fillText('press SPACE BAR to START', canvas.width/2, canvas.height/2+100);
    

}

start();