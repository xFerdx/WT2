const socket = new WebSocket('ws://localhost:8080');

const canvas = document.getElementById('myCanvas');
let ctx = canvas.getContext('2d');

let inGame = false;

//document.getElementById('preLobby').style.display = 'block';
//document.getElementById('game').style.display = 'none';

const laserImageBlue = new Image();
const laserImageRed = new Image();

const bgImage = new Image();
bgImage.src = './Background/bg2.jpg';

const deadImage = new Image();
deadImage.src = './assets/dead.png';

let picNum = 1;

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
        case 'startGame':
            inGame = true;
            showGame();
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

function sendRequestJoin(userName, playerNumber){
    const payload = {
        type: 'requestJoin',
        userName: userName,
        playerNumber: playerNumber
    };
    socket.send(JSON.stringify(payload));
}

let players = [];
let map;

let dings = 0;
let now = Date.now();

function draw() {
    dings++;
    if(dings % 1000 === 0)console.log(players);
    let fps = Math.round(1000/(Date.now()-now));
    now = Date.now();


    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(bgImage, 0,0, 1900, 900);

    players.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.xPos, p.yPos, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.team === 0?'blue':'red';
        ctx.fill();
        ctx.closePath();
        if(p.status === "DEAD")ctx.drawImage(deadImage, p.xPos-15, p.yPos-15,30,30);

        ctx.beginPath();
        ctx.arc(p.xPos, p.yPos, p.radius+2, 0, Math.PI * 1.5);
        ctx.strokeStyle = 'white';
        ctx.stroke();
        ctx.closePath();
        if(p.status === "DEAD")ctx.drawImage(deadImage, p.xPos-15, p.yPos-15,30,30);

        ctx.fillStyle = 'white';
        ctx.font = "12px Arial";
        ctx.fillText(p.name, p.xPos - p.name.length * 4, p.yPos-p.radius-3);
    });


    if(map !== undefined)
    map.lasers.forEach(l => {
        if(l.startTime !== 0)return;
        if(l.team === -1) {
            ctx.beginPath();
            ctx.arc(l.location[0], l.location[1], 10, 0, Math.PI * 2);
            ctx.strokeStyle = 'white';
            ctx.stroke();

            for (let i = 0; i < l.sides; i++) {
                let px = l.location[0] + Math.cos(l.angle + i * (Math.PI * 2 / l.sides)) * l.radius * 0.2;
                let py = l.location[1] + Math.sin(l.angle + i * (Math.PI * 2 / l.sides)) * l.radius * 0.2;

                ctx.beginPath();
                ctx.moveTo(l.location[0], l.location[1]);
                ctx.lineTo(px, py);
                ctx.strokeStyle = 'white';
                ctx.stroke();
                ctx.closePath();

                ctx.beginPath();
                ctx.arc(px, py, 5, 0, Math.PI * 2);
                ctx.stroke();
            }
        }else{
            laserImageBlue.src = './LaserBeam/blue/laser_A_'+Math.floor(picNum)+'.png';
            laserImageRed.src = './LaserBeam/red/laser_A_'+Math.floor(picNum)+'.png';
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

                let thisImg = (l.team === 0)?laserImageBlue:laserImageRed;
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

    picNum+= 0.2;
    if(picNum>=9)picNum = 1;

    if(!inGame)
        console.log("ret");
    else
        requestAnimationFrame(draw);





}


document.addEventListener('keydown', (e) => {
    if(!inGame)return;
    if (e.code === "KeyA") sendKey('A', true);
    if (e.code === "KeyD") sendKey('D', true);
    if (e.code === "KeyS") sendKey('S', true);
    if (e.code === "KeyW") sendKey('W', true);
    if (e.code === "Space") sendKey('SPACE', true);
});

document.addEventListener('keyup', (e) => {
    if(!inGame)return;
    if (e.code === "KeyA") sendKey('A', false);
    if (e.code === "KeyD") sendKey('D', false);
    if (e.code === "KeyS") sendKey('S', false);
    if (e.code === "KeyW") sendKey('W', false);
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
    sendRequestJoin(userName, playerNumber);
}

function showGame(){
    console.log("showed")
    //document.getElementById('preLobby').style.display = 'none';
    //document.getElementById('game').style.display = 'block';
    requestAnimationFrame(draw);
}