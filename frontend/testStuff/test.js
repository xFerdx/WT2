class turner{
    location;
    sides;
    lifeDuration;
    currentLifeDuration;
    angle;
    speed;
    radius;
    direction;

    constructor(location, sides, lifeDuration, speed, radius, direction) {
        this.location = location;
        this.sides = sides;
        this.lifeDuration = lifeDuration;
        this.angle = 0;
        this.currentLifeDuration = lifeDuration;
        this.speed = speed;
        this.radius = radius;
        this.direction = direction;
    }

    calcNewAngle(){
        this.angle += this.speed * (this.direction?1:-1);
    }
}



const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let left = false, right = false, up = false, down = false;

let playerPos = [100,100];
let playerSpeed = [0,0];
let maxSpeed = 1;
let acceleration = 0.009, deceleration= 0.06;

let dreher = [];

function update() {
    if(right)playerSpeed[0] = Math.max(playerSpeed[0] + acceleration, maxSpeed);
    if(left)playerSpeed[0] = Math.min(playerSpeed[0] - acceleration, -maxSpeed);
    if(down)playerSpeed[1] = Math.max(playerSpeed[1] + acceleration, maxSpeed);
    if(up)playerSpeed[1] = Math.min(playerSpeed[1] - acceleration, -maxSpeed);

    if(!right && !left){
        if(Math.abs(playerSpeed[0])<=acceleration)playerSpeed[0]=0;
        else if(playerSpeed[0]>0) playerSpeed[0] -= deceleration;
        else if(playerSpeed[0]<0) playerSpeed[0] += deceleration;
    }

    if(!up && !down){
        if(Math.abs(playerSpeed[1])<=acceleration)playerSpeed[1]=0;
        else if(playerSpeed[1]>0) playerSpeed[1] -= deceleration;
        else if(playerSpeed[1]<0) playerSpeed[1] += deceleration;
    }


    playerPos[0] += playerSpeed[0];
    playerPos[1] += playerSpeed[1];

    dreher.forEach(e => {
        e.calcNewAngle();
    });

}

function checkCollisions(){
    dreher.forEach(d => {
        //if()console.log("hit");
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(playerPos[0], playerPos[1], 20, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.closePath();

    dreher.forEach(e => {
        for (let i = 0; i < e.sides; i++) {
            let px = e.location[0] + Math.cos(e.angle + i*(Math.PI * 2/e.sides)) * e.radius;
            let py = e.location[1] + Math.sin(e.angle + i*(Math.PI * 2/e.sides)) * e.radius;

            ctx.beginPath();
            ctx.moveTo(e.location[0], e.location[1]);
            ctx.lineTo(px, py);
            ctx.strokeStyle = 'blue';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.closePath();
        }

    });



}

function setUp(){

    dreher.push(new turner([200,200],10,100,0.01, 150, false))

    gameLoop()
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}


setUp();



document.addEventListener('keydown', (e) => {
    console.log(e.code)
    if (e.code === "KeyA")left = true;
    if (e.code === "KeyD")right = true;
    if (e.code === "KeyS")down = true;
    if (e.code === "KeyW")up = true;
});

document.addEventListener('keyup', (e) => {
    if (e.code === "KeyA")left = false;
    if (e.code === "KeyD")right = false;
    if (e.code === "KeyS")down = false;
    if (e.code === "KeyW")up = false;
});

