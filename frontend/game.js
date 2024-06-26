const socket = new WebSocket('ws://192.168.0.107:8080');//new WebSocket('ws://localhost:8080');

const canvas = document.getElementById('myCanvas');
let ctx = canvas.getContext('2d');
canvas.width = window.screen.width;
canvas.height = window.screen.height;
const notFSBuffer = [0.99,0.96]

let inGame = false;

const laserImagesBlue = [];
const laserImagesRed = [];
for (let i = 1; i < 9; i++) {
    let lb = new Image();
    let lr = new Image();
    lb.src = '/LaserBeam/blue/laser_A_' + i + '.png';
    lr.src = '/LaserBeam/red/laser_A_' + i + '.png';
    laserImagesBlue.push(lb);
    laserImagesRed.push(lr);
}

const shockEffects = [];
for (let i = 1; i < 10; i++) {
    let s = new Image();
    s.src = '/Effects/'+i+".png";
    shockEffects.push(s);
}

document.body.style.overflow = 'hidden';
document.documentElement.style.overflow = 'hidden';

const bgImage = new Image();
bgImage.src = '/Background/bg2.jpg';

const deadImage = new Image();
deadImage.src = '/assets/dead.png';

let picInc = 1;
let incrementingCounter = 0;

socket.addEventListener('open', function (event) {
    console.log('Connected to WebSocket server');
});

socket.addEventListener('message', function (event) {
    const data = JSON.parse(event.data);

    switch (data.type) {
        case 'mapUpdate':
            map = data.message;
            break;
        case 'playersUpdate':
            players = data.message;
            break;
        case 'scoreUpdate':
            scores = data.message;
            break;
        case 'startGame':
            inGame = true;
            showGame();
            break;
        case 'endGame':
            inGame = false;
            closeGame();
            break;
        default:
            console.log("Unknown message type:", data.type);
    }
});

function sendKey(key, pressed){
    const payload = {
        type: (pressed?'pressedKey':'releasedKey'),
        message: key
    };
    socket.send(JSON.stringify(payload));
}

function sendRequestJoin(userName, playerNumber, ability){
    const payload = {
        type: 'requestJoin',
        userName: userName,
        playerNumber: playerNumber,
        ability: ability
    };
    socket.send(JSON.stringify(payload));
}

let players = [];
let map;
let scores = [0,0];

let now = performance.now();
let fpsSum = 0;
let fps = 0;

function draw() {
    if(incrementingCounter % 1000 === 0)console.log(players);
    fpsSum += Math.round(1000000/(performance.now()*1000-now*1000));
    now = performance.now();
    if(Math.round(incrementingCounter) % 10 === 0){
        fps = Math.round(fpsSum/10);
        fpsSum = 0;
    }

    ctx.clearRect(0, 0, 1920, 1080);
    ctx.drawImage(bgImage, 0,0, 1920, 1080);

    players.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.xPos, p.yPos, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.team === 0?'blue':'red';
        ctx.fill();
        ctx.closePath();
        if(p.status === "DEAD")ctx.drawImage(deadImage, p.xPos-15, p.yPos-15,30,30);
        if(p.status === "STUNNED")ctx.drawImage(shockEffects[Math.floor((picInc % 3)+1)], p.xPos-15, p.yPos-15,32,32);
        if(p.ability.activated && p.ability.abilityName === "stunner")ctx.drawImage(shockEffects[Math.floor((picInc % 18)/2)], p.xPos - 50, p.yPos - 50, 100, 100);
        if(p.ability.activated && p.ability.abilityName === "hunter"){
            ctx.beginPath();
            ctx.moveTo(p.xPos, p.yPos);
            ctx.lineTo(p.ability.setPointX, p.ability.setPointY);
            ctx.strokeStyle = 'green';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();
        }

        let abilityPercent;
        if(p.ability.activated){
            abilityPercent = p.ability.currentDuration / p.ability.duration;
        }else{
            abilityPercent = (p.ability.coolDownTime - p.ability.currentCoolDownTime) / p.ability.coolDownTime;
        }
        ctx.beginPath();
        ctx.arc(p.xPos, p.yPos, p.radius+2, 0, Math.PI * 2 * abilityPercent);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = 'white';
        ctx.font = "12px Arial";
        ctx.fillText(p.name, p.xPos - p.name.length * 4, p.yPos-p.radius-3);


    });
    
    map && map.lasers.forEach(l => {
        if(l.startTime !== 0)return;
        if(l.team === -1) {
            ctx.beginPath();
            ctx.arc(l.location[0], l.location[1], 10, 0, Math.PI * 2);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'white';
            ctx.stroke();

            for (let i = 0; i < l.sides; i++) {
                let px = l.location[0] + Math.cos(l.angle + i * (Math.PI * 2 / l.sides)) * l.radius * 0.2;
                let py = l.location[1] + Math.sin(l.angle + i * (Math.PI * 2 / l.sides)) * l.radius * 0.2;

                ctx.beginPath();
                ctx.moveTo(l.location[0], l.location[1]);
                ctx.lineTo(px, py);
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.closePath();

                ctx.beginPath();
                ctx.arc(px, py, 5, 0, Math.PI * 2);
                ctx.stroke();
            }
        }else{
            for (let i = 0; i < l.sides; i++) {
                let px = l.location[0] + Math.cos(l.angle + i * (Math.PI * 2 / l.sides)) * l.radius;
                let py = l.location[1] + Math.sin(l.angle + i * (Math.PI * 2 / l.sides)) * l.radius;

                ctx.beginPath();
                ctx.moveTo(l.location[0], l.location[1]);
                ctx.lineTo(px, py);
                ctx.strokeStyle = l.team === 0 ? 'blue':'red';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.closePath();

                let thisImg = (l.team === 0)?laserImagesBlue[Math.floor(picInc % 8)]:laserImagesRed[Math.floor(picInc % 8)];
                const scaleX = 1;
                const scaleY = l.radius / thisImg.height;
                const xPos = l.location[0];
                const yPos = l.location[1];
                const pivotX = thisImg.width / 2;
                const pivotY = thisImg.height;

                ctx.save();
                ctx.translate(xPos, yPos);
                ctx.rotate(l.angle + i * (Math.PI * 2 / l.sides) + 0.25 * 2*Math.PI);
                ctx.scale(scaleX, scaleY);
                ctx.drawImage(thisImg, -pivotX, -pivotY);
                ctx.restore();

                ctx.beginPath();
                ctx.arc(l.location[0], l.location[1], 10, 0, Math.PI * 2);
                ctx.fillStyle = 'white';
                ctx.fill();

            }
        }
    });



    ctx.fillStyle = 'white';
    ctx.font = "30px Arial";
    ctx.fillText("fps: "+fps,30,40);

    ctx.fillStyle = 'blue';
    ctx.font = "30px Arial";
    ctx.fillText(scores[0],canvas.width/2 - 21,40);
    ctx.fillStyle = 'white';
    ctx.fillText("|",canvas.width/2, 40);
    ctx.fillStyle = 'red';
    ctx.fillText(scores[1],canvas.width/2 + 10,40);

    picInc+= 0.2;
    incrementingCounter++;


    if(inGame)
        requestAnimationFrame(draw);
}

document.addEventListener('keydown', (e) => {
    if(!inGame)return;
    if (e.code === "KeyA" || e.code === "ArrowLeft") sendKey('A', true);
    if (e.code === "KeyD" || e.code === "ArrowRight") sendKey('D', true);
    if (e.code === "KeyS" || e.code === "ArrowDown") sendKey('S', true);
    if (e.code === "KeyW" || e.code === "ArrowUp") sendKey('W', true);
    if (e.code === "Space") sendKey('SPACE', true);
});

document.addEventListener('keyup', (e) => {
    if(!inGame)return;
    if (e.code === "KeyA" || e.code === "ArrowLeft") sendKey('A', false);
    if (e.code === "KeyD" || e.code === "ArrowRight") sendKey('D', false);
    if (e.code === "KeyS" || e.code === "ArrowDown") sendKey('S', false);
    if (e.code === "KeyW" || e.code === "ArrowUp") sendKey('W', false);
});

window.addEventListener('blur', (event) => {
    if(!inGame)return;
    sendKey('A', false);
    sendKey('D', false);
    sendKey('S', false);
    sendKey('W', false);
});

function requestJoin(){
    let userName = document.getElementById('userName').value;
    let playerNumber = document.getElementById('playerNumber').value;
    let ability = document.getElementById('ability').value;
    sendRequestJoin(userName, playerNumber, ability);
}

function requestFS(){
    let element = document.getElementById('myCanvas');

    if (element.requestFullscreen)
        element.requestFullscreen();
     else if (element.mozRequestFullScreen)
        element.mozRequestFullScreen();
     else if (element.webkitRequestFullscreen)
        element.webkitRequestFullscreen();
     else if (element.msRequestFullscreen)
        element.msRequestFullscreen();

}

document.addEventListener('fullscreenchange', fullScreenHandler);

function fullScreenHandler(){
    if (document.fullscreenElement) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(window.screen.width/1920,window.screen.height/1080);
    }else{
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(window.innerWidth/1920 * notFSBuffer[0],window.innerHeight/1080 * notFSBuffer[1]);
    }
}

function showGame(){
    fullScreenHandler();
    document.getElementById('joinButton').disabled = true;
    document.getElementById('myCanvas').style.display = 'block';
    requestAnimationFrame(draw);
}

function closeGame(){
    document.getElementById('joinButton').disabled = false;
    document.getElementById('myCanvas').style.display = 'none';
}