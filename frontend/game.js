const socket = new WebSocket('ws://192.168.0.109:8080');

const canvas = document.getElementById('myCanvas');
let ctx = canvas.getContext('2d');
canvas.width = window.screen.width;
canvas.height = window.screen.height;
const notFSBuffer = [0.99,0.96]
const defaultHeight = 1080;
const defaultWidth = 1920;
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

document.getElementById('nameInputSection').style.display='flex';
document.getElementById('game-mode-selection').style.display = 'none'
document.getElementById('abilitySelection').style.display = 'none';
document.getElementById('game').style.display = 'none';

const bgImage = new Image();
bgImage.src = '/Background/bg2.jpg';

const deadImage = new Image();
deadImage.src = '/assets/dead.png';

const resetImage = new Image();
resetImage.src = '/assets/reset_icon.png';

const reverseImage = new Image();
reverseImage.src = '/assets/reverse.png';

let picInc = 1;
let incrementingCounter = 0;
let showWinner = false;

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
            updatePlayerNumberDisplay(0,0,false)
            showGame();
            break;
        case 'endGame':
            inGame = false;
            showWinner = false;
            closeGame();
            break;
        case 'playerNumberUpdate':
            updatePlayerNumberDisplay(data.message.playerNumber,data.message.maxPlayer,true);
            break;
        case 'showWinner':
            showWinner = true;
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
let userName = "";

let now = performance.now();
let fpsSum = 0;
let fps = 0;

function draw() {
    if(incrementingCounter % 1000 === 0){console.log(players);console.log(map);}
    fpsSum += Math.round(1000000/(performance.now()*1000-now*1000));
    now = performance.now();
    if(Math.round(incrementingCounter) % 10 === 0){
        fps = Math.round(fpsSum/10);
        fpsSum = 0;
    }
    fullScreenHandler();

    ctx.clearRect(0, 0, defaultWidth + 100, defaultHeight + 100);
    ctx.drawImage(bgImage, 0,0, defaultWidth, defaultHeight);

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

    map && map.powerUps.forEach(p=> {
        if(!p.enabled)return;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        if(p.type==="reverse") {
            ctx.fillStyle = 'yellow';
        } else if(p.type==="reset") {
            ctx.fillStyle = 'green';
        }

        ctx.fill();

        ctx.closePath();
        if(p.type==="reverse") {
            ctx.drawImage(reverseImage,p.x-10,p.y-10,20,20);
        }else if(p.type==="reset") {
            ctx.drawImage(resetImage,p.x-10,p.y-10,20,20);
        }

    });


    ctx.fillStyle = 'white';
    ctx.font = "30px Arial";
    ctx.fillText("fps: "+fps,30,40);

    ctx.fillStyle = 'blue';
    ctx.font = "30px Arial";
    ctx.fillText(scores[0],defaultWidth/2 - 21,40);
    ctx.fillStyle = 'white';
    ctx.fillText("|",defaultWidth/2, 40);
    ctx.fillStyle = 'red';
    ctx.fillText(scores[1],defaultWidth/2 + 10,40);


    if(showWinner){
        if(scores[0] > scores[1]){
            ctx.fillStyle = 'blue';
            ctx.font = "60px Arial";
            ctx.fillText("Blue won",defaultWidth/2 - 100, defaultHeight/3);
        }else{
            ctx.fillStyle = 'red';
            ctx.font = "60px Arial";
            ctx.fillText("Red won",defaultWidth/2 - 100, defaultHeight/3);
        }
    }


    picInc += 0.2;
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

document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

function requestJoin(playerNumber){
    let ability = document.getElementById('abilitySelection').value;
    sendRequestJoin(userName, playerNumber, ability);
    document.getElementById('game-mode-selection').style.display = 'none';
    document.getElementById('queue-status').style.display = 'block';
    document.getElementById('abilitySelection').style.display = 'none';
}

function requestFS(){
    let element;
    if(inGame)element = document.getElementById('game');
    else element = document.getElementById('frontPage');

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
        document.getElementById('FSButton').style.display = 'none';
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(window.screen.width/defaultWidth,window.screen.height/defaultHeight);
    }else{
        document.getElementById('FSButton').style.display = 'flex';
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(window.innerWidth/defaultWidth * notFSBuffer[0],window.innerHeight/defaultHeight * notFSBuffer[1]);
    }
}

function showGame(){
    fullScreenHandler();
    document.getElementById('enterLobby').disabled = true;
    document.getElementById('game').style.display = 'block';
    document.getElementById('frontPage').style.display = 'none';
    if (isMobileDevice() ) {
        createTouchControls();
    }
    requestAnimationFrame(draw);
}

function closeGame(){
    location.reload();
}

let waitingPoints = 1;
function updatePlayerNumberDisplay(currentNumber, maxNumber, waitingForJoin){
    let element = document.getElementById('queue-status');
    if(waitingForJoin){
        element.innerHTML = "Waiting for more players to join"+".".repeat(waitingPoints/10)+"<br>"+ currentNumber + " / " + maxNumber;
    }else{
        element.textContent = "";
    }
    waitingPoints ++;
    if(waitingPoints === 40)waitingPoints = 0;
}

function setUsername() {
    userName = document.getElementById('username').value;
    document.getElementById('nameInputSection').style.display='none';
    document.getElementById('game-mode-selection').style.display = 'block'
    document.getElementById('abilitySelection').style.display = 'block';
}

function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|ipod/i.test(navigator.userAgent);
}

function createTouchControls() {
    const controlContainer = document.createElement('div');
    controlContainer.style.position = 'fixed';
    controlContainer.style.bottom = '10px';
    controlContainer.style.bottom = '20%';
    controlContainer.style.left = '10px';
    controlContainer.style.transform = 'translateY(0)';
    controlContainer.style.display = 'grid';
    controlContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
    controlContainer.style.gridTemplateRows = 'repeat(3, 1fr)';
    controlContainer.style.gap = '10px';

    const buttons = [
        { id: 'left', label: '⬅️', gridArea: '2 / 1 / 3 / 2' },
        { id: 'up', label: '⬆️', gridArea: '1 / 2 / 2 / 3' },
        { id: 'down', label: '⬇️', gridArea: '3 / 2 / 4 / 3' },
        { id: 'right', label: '➡️', gridArea: '2 / 3 / 3 / 3' }
    ];

    buttons.forEach(button => {
        const btn = document.createElement('button');
        btn.id = button.id;
        btn.innerHTML = button.label;
        btn.style.padding = '5px';
        btn.style.fontSize = '20px';
        btn.style.borderRadius = '0px';
        btn.style.backgroundColor = 'rgba(255, 255, 255, 0)';
        btn.style.border = '1px solid #000';
        btn.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        btn.style.gridArea = button.gridArea;
        controlContainer.appendChild(btn);

        btn.addEventListener('touchstart', () => handleTouchStart(button.id));
        btn.addEventListener('touchend', () => handleTouchEnd(button.id));
    });

    const abilityButtonDiv = document.createElement('div');
    abilityButtonDiv.style.position = 'fixed';
    abilityButtonDiv.style.bottom = '20px';
    abilityButtonDiv.style.right= '10px';
    abilityButtonDiv.style.display = 'flex';
    abilityButtonDiv.style.alignItems= 'center';

    const abilityButton = {id: 'special', label: '🔥'};
    const abilityBtn = document.createElement('button');
    abilityBtn.id = abilityButton.id;
    abilityBtn.innerHTML = abilityButton.label;
    abilityBtn.style.padding = '5px';
    abilityBtn.style.fontSize = '20px';
    abilityBtn.style.borderRadius = '0px';
    abilityBtn.style.backgroundColor = '#fff';
    abilityBtn.style.backgroundColor = 'rgba(255, 255, 255, 0)';
    abilityBtn.style.border = '1px solid #000';
    abilityBtn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    abilityButtonDiv.appendChild(abilityBtn);

    abilityBtn.addEventListener('touchstart',()=>handleTouchStart(abilityButton.id));
    abilityBtn.addEventListener('touchend',()=>handleTouchEnd(abilityButton.id));

    document.getElementById("game").appendChild(controlContainer);
    document.getElementById("game").appendChild(abilityButtonDiv);
}

function handleTouchStart(direction) {
    if (!inGame) return;
    switch (direction) {
        case 'left':
            sendKey('A', true);
            break;
        case 'up':
            sendKey('W', true);
            break;
        case 'down':
            sendKey('S', true);
            break;
        case 'right':
            sendKey('D', true);
            break;
        case 'special':
            sendKey('SPACE',true);
            break;
    }
}

function handleTouchEnd(direction) {
    if (!inGame) return;
    switch (direction) {
        case 'left':
            sendKey('A', false);
            break;
        case 'up':
            sendKey('W', false);
            break;
        case 'down':
            sendKey('S', false);
            break;
        case 'right':
            sendKey('D', false);
            break;

    }
}