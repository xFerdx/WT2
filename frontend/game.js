
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

let players = [];
let localPlayerIdx = -1;
let left = false, right = false, up = false, down = false;

const socket = new WebSocket('ws://localhost:8080');

socket.addEventListener('open', function (event) {
    console.log('Connected to WebSocket server');
});

socket.addEventListener('message', function (event) {
    const data = JSON.parse(event.data);

    switch (data.type) {
        case 'localPlayerIdx':
            localPlayerIdx = data.message;
            break;
        case 'playerUpdate':
            players = data.message;
            break;
        default:
            console.log("Unknown message type:", data.type);
    }
});

function displayMessage(message) {
    const messagesList = document.getElementById('messages');
    const li = document.createElement('li');
    li.textContent = message.toString();
    messagesList.appendChild(li);
}

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    players.forEach(player => {
        ctx.beginPath();
        ctx.arc(player.x, player.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();
    });
}

function update(deltaTime) {
    if (localPlayerIdx === -1) return;
    const speed = 1000;
    const distance = speed * deltaTime;

    if (right) players[localPlayerIdx].x += distance;
    if (left) players[localPlayerIdx].x -= distance;
    if (up) players[localPlayerIdx].y -= distance;
    if (down) players[localPlayerIdx].y += distance;
}

function sendPlayerToBE() {
    if (socket.readyState === socket.OPEN && localPlayerIdx !== -1) {
        socket.send(JSON.stringify(players[localPlayerIdx]));
    }
}

let lastTimestamp = 0;

function gameLoop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const deltaTime = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    draw();
    update(deltaTime);
    sendPlayerToBE();

    requestAnimationFrame(gameLoop);
}

function setUp() {
    requestAnimationFrame(gameLoop);
}

setUp();

document.addEventListener('keydown', (e) => {
    if (e.code === "KeyA") left = true;
    if (e.code === "KeyD") right = true;
    if (e.code === "KeyS") down = true;
    if (e.code === "KeyW") up = true;
});

document.addEventListener('keyup', (e) => {
    if (e.code === "KeyA") left = false;
    if (e.code === "KeyD") right = false;
    if (e.code === "KeyS") down = false;
    if (e.code === "KeyW") up = false;
});
