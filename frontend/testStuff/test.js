class Turner{
    location;
    sides;
    lifeDuration;
    currentLifeDuration;
    angle;
    speed;
    radius;
    direction;
    team;
    startTime;
    movement;


    constructor(location, sides, lifeDuration, speed, radius, direction, startTime, movement) {
        this.location = location;
        this.sides = sides;
        this.lifeDuration = lifeDuration;
        this.angle = 0;
        this.currentLifeDuration = lifeDuration;
        this.speed = speed;
        this.radius = radius;
        this.direction = direction;
        this.team = -1;
        this.startTime = startTime;
        this.movement = movement;
    }

    calcNewAngle(){
        this.angle += this.speed * (this.direction?1:-1);
    }

}

const laserImage = new Image();

const bgImage = new Image();
bgImage.src = '../Background/bg2.jpg';


class Movement{
    xPos1;
    yPos1;
    xPos2;
    yPos2;
    direction;
    speed;


    constructor(xPos1, yPos1, xPos2, yPos2, speed) {
        this.xPos1 = xPos1;
        this.yPos1 = yPos1;
        this.xPos2 = xPos2;
        this.yPos2 = yPos2;
        this.speed = speed;
        this.direction = true;
    }

    getNormalVec(){
        let dx = this.xPos2 - this.xPos1;
        let dy = this.yPos2 - this.yPos1;
        let length = Math.sqrt(dx * dx + dy * dy);

        let nx = (dx / length) * (this.direction?1:-1) * this.speed;
        let ny = (dy / length) * (this.direction?1:-1) * this.speed;

        return [nx,ny];
    }

}



function map1(){
    let map = [];

    map.push(new Turner([xMin + 0.2 * (xMax - xMin), yMin + 0.3 * (yMax - yMin)],1,1000,0.007, 300, false, 500, null))
    map.push(new Turner([xMin + 0.2 * (xMax - xMin), yMin + 0.7 * (yMax - yMin)],2,1000,0.007, 300, false, 500, null))
    map.push(new Turner([xMin + 0.4 * (xMax - xMin), yMin + 0.3 * (yMax - yMin)],3,1000,0.007, 300, false, 500, null))
    map.push(new Turner([xMin + 0.4 * (xMax - xMin), yMin + 0.7 * (yMax - yMin)],4,1000,0.00007, 300, false, 500, null))
    map.push(new Turner([xMin + 0.6 * (xMax - xMin), yMin + 0.3 * (yMax - yMin)],5,1000,0.007, 300, false, 500, null))
    map.push(new Turner([xMin + 0.6 * (xMax - xMin), yMin + 0.7 * (yMax - yMin)],6,1000,0.007, 300, false, 500, null))
    map.push(new Turner([xMin + 0.8 * (xMax - xMin), yMin + 0.3 * (yMax - yMin)],3,1000,0.007, 300, false, 500, null))
    map.push(new Turner([xMin + 0.8 * (xMax - xMin), yMin + 0.7 * (yMax - yMin)],10,1000,0.005, 300, false, 500, null))

    let m1 = new Movement(xMin + 0.1 * (xMax - xMin), yMin + 0.5 * (yMax - yMin), xMin + 0.9 * (xMax - xMin),  yMin + 0.5 * (yMax - yMin),1)
    map.push(new Turner([xMin + 0.1 * (xMax - xMin), yMin + 0.5 * (yMax - yMin)],3,1000,0.007, 200, false, 10, m1))
    let m2 = new Movement(xMin + 0.9 * (xMax - xMin), yMin + 0.5 * (yMax - yMin), xMin + 0.1 * (xMax - xMin),  yMin + 0.5 * (yMax - yMin),1)
    map.push(new Turner([xMin + 0.9 * (xMax - xMin), yMin + 0.5 * (yMax - yMin)],3,1000,0.007, 200, false, 10, m2))
    
    return map;
}



const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let left = false, right = false, up = false, down = false;

let playerPos = [100,100];
let speed = 3;
let radius = 15;
let team = 1;

let dreher = [];

const screenWidth = window.screen.width * 0.98;
const screenHeight = window.screen.height * 0.84;

let xMin = screenWidth * 0.01;
let xMax = screenWidth * 0.99;
let yMin = screenHeight * 0.01;
let yMax = screenHeight * 0.99;

let picNum = 1;

function update() {
    let upOrDown = up || down;
    let leftOrRight = left || right;

    if(right)playerPos[0] += speed / (upOrDown?Math.sqrt(2):1);
    if(left)playerPos[0] -= speed / (upOrDown?Math.sqrt(2):1);
    if(down)playerPos[1] += speed / (leftOrRight?Math.sqrt(2):1);
    if(up)playerPos[1] -= speed / (leftOrRight?Math.sqrt(2):1);

    if(playerPos[0] > xMax)playerPos[0] = xMin;
    if(playerPos[0] < xMin)playerPos[0] = xMax;
    if(playerPos[1] > yMax)playerPos[1] = yMin;
    if(playerPos[1] < yMin)playerPos[1] = yMax;

    dreher.forEach(e =>{
        if(e.startTime > 0){
            e.startTime--;
            return;
        }
        if(Math.pow(radius + 10,2) >= Math.pow(playerPos[0] - e.location[0],2) +  Math.pow(playerPos[1] - e.location[1],2))
            e.team = team;
        e.calcNewAngle();
        if(e.movement !== null){
            let movement = e.movement.getNormalVec();
            e.location[0] += movement[0];
            e.location[1] += movement[1];
            let k = ((e.movement.direction?e.movement.xPos1:e.movement.xPos2) - e.location[0]) / (e.movement.xPos1 - e.movement.xPos2);
            if(isNaN(k)) k = ((e.movement.direction?e.movement.yPos1:e.movement.yPos2) - e.location[1]) / (e.movement.yPos1 - e.movement.yPos2);
            if(isNaN(k)) k = 0;
            if(Math.abs(k)>=1)e.movement.direction = !e.movement.direction;
        }
        if(e.team === -1){
            return;
        }
        e.currentLifeDuration--;
        if(e.currentLifeDuration <= 0){
            e.team = -1;
            e.currentLifeDuration = e.lifeDuration;
        }

    });

    picNum+= 0.1;
    if(picNum>=9)picNum = 1;

}

function checkCollisions(){
    dreher.forEach(d => {
        if(d.team === -1) return;
        for (let i = 0; i < d.sides; i++) {
            let x1 = d.location[0] + Math.cos(d.angle + i*(Math.PI * 2/d.sides)) * d.radius;
            let y1 = d.location[1] + Math.sin(d.angle + i*(Math.PI * 2/d.sides)) * d.radius;

            let vx = d.location[0] - x1;
            let vy = d.location[1] - y1;

            let x2 = playerPos[0];
            let y2 = playerPos[1];

            let q  = ((Math.pow(x2-x1,2)+Math.pow(y2-y1,2)-(Math.pow(radius,2)))/(Math.pow(vx,2)+Math.pow(vy,2)));
            let p = (2*(x2-x1)*vx+2*(y2-y1)*vy)/(Math.pow(vx,2)+Math.pow(vy,2));

            let k1 = -(-p/2 + Math.sqrt(Math.pow(p/2,2)-q));
            let k2 = -(-p/2 - Math.sqrt(Math.pow(p/2,2)-q));

            if (isNaN(k1) || isNaN(k2)) continue;
            let minK = Math.max(k1,k2);

            if(minK >= 0 && minK <= 1)console.log("hit");
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(bgImage, xMin, yMin, xMax - xMin, yMax - yMin);

    ctx.strokeStyle = "black";
    ctx.strokeRect(xMin, yMin, xMax - xMin, yMax - yMin);

    ctx.beginPath();
    ctx.arc(playerPos[0], playerPos[1], radius, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.closePath();


    dreher.forEach(e => {
        if(e.startTime !== 0)return;
        if(e.team === -1) {
            ctx.beginPath();
            ctx.arc(e.location[0], e.location[1], 10, 0, Math.PI * 2);
            ctx.strokeStyle = 'white';
            ctx.stroke();

            for (let i = 0; i < e.sides; i++) {
                let px = e.location[0] + Math.cos(e.angle + i * (Math.PI * 2 / e.sides)) * e.radius * 0.2;
                let py = e.location[1] + Math.sin(e.angle + i * (Math.PI * 2 / e.sides)) * e.radius * 0.2;

                ctx.beginPath();
                ctx.moveTo(e.location[0], e.location[1]);
                ctx.lineTo(px, py);
                ctx.strokeStyle = 'white';
                ctx.stroke();
                ctx.closePath();

                ctx.beginPath();
                ctx.arc(px, py, 5, 0, Math.PI * 2);
                ctx.stroke();
            }
        }else{
            laserImage.src = '../LaserBeam/'+(team === 0?'blue':'red')+'/laser_A_'+Math.floor(picNum)+'.png';
            for (let i = 0; i < e.sides; i++) {
                let px = e.location[0] + Math.cos(e.angle + i * (Math.PI * 2 / e.sides)) * e.radius;
                let py = e.location[1] + Math.sin(e.angle + i * (Math.PI * 2 / e.sides)) * e.radius;

                ctx.beginPath();
                ctx.moveTo(e.location[0], e.location[1]);
                ctx.lineTo(px, py);
                ctx.strokeStyle = e.team === 0 ? 'blue':'red';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.closePath();

                const scaleX = 1;
                const scaleY = e.radius / laserImage.height;
                const xPos = e.location[0];
                const yPos = e.location[1];
                const pivotX = laserImage.width / 2;
                const pivotY = laserImage.height;
                ctx.save();
                ctx.translate(xPos, yPos);
                ctx.rotate(e.angle + i * (Math.PI * 2 / e.sides) + 0.25 * 2*Math.PI);
                ctx.scale(scaleX, scaleY);
                ctx.drawImage(laserImage, -pivotX, -pivotY);
                ctx.restore();

                ctx.beginPath();
                ctx.arc(e.location[0], e.location[1], 10, 0, Math.PI * 2);
                ctx.fillStyle = 'white';
                ctx.fill();

            }
        }
    });



}

function setUp(){

    dreher = map1();
    const canvas = document.getElementById('myCanvas');
    canvas.width = screenWidth;
    canvas.height = screenHeight;
    console.log(screenWidth+" "+screenHeight);
    gameLoop()
}

function gameLoop() {
    update();
    draw();
    checkCollisions();
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

