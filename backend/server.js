import { WebSocketServer } from 'ws';
import {lobbyStates, Lobby} from './Lobby.js';
import {User} from './User.js';
import {Player} from "./Player.js";
import {MapFactory, Map} from "./Map.js";

console.log("server started")
const wss = new WebSocketServer({ port: 8080 });

let lobbies = [];

lobbies.push(new Lobby(true));

function mainLoop() {
    update();
    sendData();
    for (let i = 0; i < lobbies.length; i++) {
        console.log("lobby "+i+" : "+lobbies[i].users.length);
    }
}

setInterval(mainLoop, 10);

wss.on('connection', function connection(ws) {
    console.log('A client connected.');
    lobbies[0].users.push(new User(ws));

    ws.on('message', function incoming(message) {
        const data = JSON.parse(message);
        console.log('Received: %s', data);

        switch (data.type) {
            case 'pressedKey': {
                let user = findUser(ws);
                user.player.keyPressed(data.message);
                break;
            }
            case 'releasedKey': {
                let user = findUser(ws);
                user.player.keyReleased(data.message);
                break;
            }
            case 'requestJoin': {
                joinLobby(ws, data.playerNumber, data.userName)
                break;
            }
            default:
                console.log("Unknown message type:", data.type);
        }

    });

    ws.on('close', function close() {
        console.log('A client disconnected.');
        deleteWSFromLobby(ws);
    });

});

function findUser(webSocket){
    for (let l of lobbies) {
        for (let u of l.users) {
            if (u.websocket === webSocket) {
                return u;
            }
        }
    }
    return null;
}

function findLobby(user){
    for (let l of lobbies) {
        for (let u of l.users) {
            if (u === user) {
                return l;
            }
        }
    }
    return null;
}

function deleteWSFromLobby(ws){
    let user = findUser(ws);
    let lobby = findLobby(user);
    let idx = lobby.users.indexOf(user);
    lobby.users.splice(idx,1);
}

function joinLobby(ws, playerNumber, userName){
    let user = findUser(ws);
    console.log(user);
    user.player = new Player(100,100,6.5,20,0,userName,null);

    for (let i = 0; i < lobbies.length; i++) {
        if(playerNumber * 2 !== lobbies[i].maxPlayers || lobbies[i].users.length === lobbies[i].maxPlayers || i === 0)
            continue;
        deleteWSFromLobby(ws);
        lobbies[i].users.push(user);
        return;
    }

    deleteWSFromLobby(ws);
    let lobby = new Lobby(false, playerNumber * 2);
    lobby.users.push(user);
    lobbies.push(lobby);
}

function startLobby(lobby){
    lobby.users.forEach((u, idx) => {
        u.player.team = idx % 2;
        u.player.xPos = Map.xMin + (Map.xMax - Map.xMin) * (idx % 2 === 0? 0.1 : 0.9);
        u.player.yPos = Map.yMin + (Map.yMax - Map.yMin) / (Math.floor(lobby.users.length/2)+1) * (Math.floor(idx/2)+1);
    });
    lobby.map = MapFactory.map1();
    lobby.status = lobbyStates.RUNNING;
    lobby.users.forEach(u => {
       sendStartGame(u.websocket);
    });
}

function closeLobby(idx){
    lobbies[idx].users.forEach(u => {
       u.player = null;
    });
    lobbies[0].users.concat(lobbies[idx].users);
    lobbies.splice(idx, 1);
}

function update(){
    lobbies.forEach((l, idx) => {
        if(idx === 0)return;
        if(l.users.length === 0)lobbies.splice(idx, 1);
        if(l.maxPlayers === l.users.length && l.status !== lobbyStates.RUNNING)startLobby(l);
        if(l.status !== lobbyStates.RUNNING)return;
        l.users.forEach(u => {
            u.player.updateLocation(l.map);
            u.player.checkLaserCollision(l.map);
            u.player.checkLaserActivation(l.map);
        });
        l.map.lasers.forEach(la => {
            la.update();
        });

    });
}

function sendData(){
    lobbies.forEach((l, idx) => {
       if(idx === 0 || l.status !== lobbyStates.RUNNING)return;
       l.users.forEach(u => {
           console.log("sended");
           const p = l.users.map(user => user.player);
           const allP = [].concat(...p);
           sendPlayers(u.websocket, allP);
           sendMap(u.websocket, l.map);
       });

    });
}

function sendMap(ws, map){
    const payload = {
        type: 'mapUpdate',
        message: map
    };
    ws.send(JSON.stringify(payload));
}

function sendPlayers(ws, players){
    const payload = {
        type: 'playersUpdate',
        message: players
    };
    ws.send(JSON.stringify(payload));
}

function sendStartGame(ws){
    const payload = {
        type: 'startGame'
    };
    ws.send(JSON.stringify(payload));
}








