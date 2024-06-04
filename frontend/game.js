const socket = new WebSocket('ws://localhost:8080');

const canvas = document.getElementById('myCanvas');
let ctx = canvas.getContext('2d');
canvas.style.display = 'none';

let inGame = false;

document.getElementById('preLobby').style.display = 'block';
document.getElementById('game').style.display = 'none';


socket.addEventListener('open', function (event) {
    console.log('Connected to WebSocket server');
});

socket.addEventListener('message', function (event) {
    const data = JSON.parse(event.data);
    console.log("got stuff");
    console.log(data);

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
        type: (pressed?'pressedKey':'KeyReleased'),
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



function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    players.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.xPos, p.yPos, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();
    });
    console.log(players);

    if(!inGame)
        console.log("ret");
    else
        requestAnimationFrame(draw);


}


document.addEventListener('keydown', (e) => {
    if (e.code === "KeyA") sendKey('A', true);
    if (e.code === "KeyD") sendKey('D', true);
    if (e.code === "KeyS") sendKey('S', true);
    if (e.code === "KeyW") sendKey('W', true);
    if (e.code === "Space") sendKey('SPACE', true);
});

document.addEventListener('keyup', (e) => {
    if (e.code === "KeyA") sendKey('A', true);
    if (e.code === "KeyD") sendKey('D', false);
    if (e.code === "KeyS") sendKey('S', false);
    if (e.code === "KeyW") sendKey('W', false);
});


function requestJoin(){
    let userName = document.getElementById('userName').value;
    let playerNumber = document.getElementById('playerNumber').value;
    sendRequestJoin(userName, playerNumber);
}

function showGame(){
    console.log("showed")
    document.getElementById('preLobby').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    requestAnimationFrame(draw);
}