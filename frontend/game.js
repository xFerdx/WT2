const socket = new WebSocket('ws://192.168.0.108:8080');//new WebSocket('ws://localhost:8080');

const canvas = document.getElementById('myCanvas');
let ctx = canvas.getContext('2d');

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


console.log(window.innerHeight)
console.log(window.innerWidth)

const bgImage = new Image();
bgImage.src = '/Background/bg2.jpg';

const deadImage = new Image();
deadImage.src = '/assets/dead.png';

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
            document.getElementById('queue-status').style.display='none';
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

function sendRequestJoin(userName, playerNumber, ability){
    const payload = {
        type: 'requestJoin',
        userName: userName,
        playerNumber: playerNumber,
        ability: ability
    };
    socket.send(JSON.stringify(payload));
}

function setUsername() {
    username = document.getElementById('username').value;
    if(username) {
        socket.send(JSON.stringify({
            type:'setUsername',
            userName: username
        }));
        
        document.getElementById('nameInputSection').style.display='none';
        document.getElementById('game-mode-selection').style.display = 'block';

    }
}
function selectGameMode(gameMode) {
    if(username) {
        socket.send(JSON.stringify({
            type: 'selectGameMode',
            gameMode: gameMode
        }));
        document.getElementById('game-mode-selection').style.display = 'none';
        document.getElementById('queue-status').style.display = 'block';
    }
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
        if(p.status === "STUNNED")ctx.drawImage(shockEffects[Math.floor((picNum % 3)+1)], p.xPos-15, p.yPos-15,32,32);
        if(p.ability.activated && p.ability.abilityName === "stunner")ctx.drawImage(shockEffects[Math.floor((picNum % 18)/2)], p.xPos - 50, p.yPos - 50, 100, 100);
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


    if(map !== undefined)
    map.lasers.forEach(l => {
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

                let thisImg = (l.team === 0)?laserImagesBlue[Math.floor(picNum % 8)]:laserImagesRed[Math.floor(picNum % 8)];
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
    // map.powerups.foreach { }



    ctx.fillStyle = 'white';
    ctx.font = "30px Arial";
    ctx.fillText("fps: "+fps,30,40);

    picNum+= 0.2;

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
    let ability = document.getElementById('ability').value;
    sendRequestJoin(userName, playerNumber, ability);
}

function showGame(){
    console.log("showed")
    document.getElementById('joinButton').disabled = true;
    requestAnimationFrame(draw);
}