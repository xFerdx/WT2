import {updatePlayers,updateMap} from './game.js';
export const socket = new WebSocket('ws://localhost:8080');

socket.addEventListener('open', function (event) {
    console.log('Connected to WebSocket server');
});

socket.addEventListener('message', function (event) {
    const data = JSON.parse(event.data);
    console.log("got stuff");

    switch (data.type) {
        case 'mapUpdate':
            updatePlayers(data.message);
            break;
        case 'playersUpdate':
            updateMap(data.message);
            break;
        case 'startGame':
            window.location.href = 'game.html';
            break;
        default:
            console.log("Unknown message type:", data.type);
    }
});

export function sendKey(key, pressed){
    const payload = {
        type: (pressed?'pressedKey':'KeyReleased'),
        message: key
    };
    socket.send(JSON.stringify(payload));
}

export function sendRequestJoin(userName, playerNumber){
    const payload = {
        type: 'requestJoin',
        userName: userName,
        playerNumber: playerNumber
    };
    socket.send(JSON.stringify(payload));
}