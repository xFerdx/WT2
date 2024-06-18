import { WebSocketServer } from 'ws';
import {lobbyStates, Lobby} from './Lobby.js';
import {User} from './User.js';
import {Player} from "./Player.js";
import {MapFactory, Map} from "./Map.js";
import {AbilityStunner, AbilityHunter, AbilityThief, AbilityImmortal} from "./Ability.js";

import http from "http";
import fs from 'fs';
import * as path from "path";

const server = http.createServer((req, res) => {
    const basePath = path.resolve().replace("backend","frontend");
    const filePath = path.join(basePath, req.url === '/' ? 'game.html' : req.url);
    const extname = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.svg': 'application/image/svg+xml'
    };
    console.log(filePath);
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`, 'utf-8');
            }
        } else {
            const contentType = mimeTypes[extname] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(8081, '0.0.0.0', () => {
    console.log(`Server is listening on http://0.0.0.0:8081`);
});




console.log("server started")
const wss = new WebSocketServer({ port: 8080, host: '0.0.0.0' });

let lobbies = [];

lobbies.push(new Lobby(true));

let t = Date.now();

function mainLoop() {
    //console.log(Date.now()-t);
    t = Date.now();
    update();
    sendData();
    //for (let i = 0; i < lobbies.length; i++)
        //console.log("lobby "+i+" : "+lobbies[i].users.length);


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
                joinLobby(ws, data.playerNumber, data.userName, data.ability)
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

function joinLobby(ws, playerNumber, userName, ability){
    let user = findUser(ws);
    let abilityObject;
    switch (ability){
        case "hunter":
            abilityObject = new AbilityHunter();
            break;
        case "stunner":
            abilityObject = new AbilityStunner();
            break;
        case "immortal":
            abilityObject = new AbilityImmortal();
            break;
        case "thief":
            abilityObject = new AbilityThief();
            break;
        default:
            abilityObject = null;
    }

    user.player = new Player(100,100,6.5,20,0,userName,abilityObject);

    for (let i = 0; i < lobbies.length; i++) {
        if(playerNumber * 2 !== lobbies[i].maxPlayers || lobbies[i].users.length === lobbies[i].maxPlayers || lobbies[i].status !== lobbyStates.WAITING|| i === 0)
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
        u.player.xPos = Map.xMax * (idx % 2 === 0? 0.1 : 0.9);
        u.player.yPos = Map.yMax / (Math.floor(lobby.users.length/2)+1) * (Math.floor(idx/2)+1);
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
            u.player.ability.update(l.map, l.users.map(user => user.player), u.player);
            u.player.updateEffects();
        });

        l.map.lasers.forEach(lasers => {
            lasers.update();
        });

    });
}

function sendData(){
    lobbies.forEach((l, idx) => {
       if(idx === 0 || l.status !== lobbyStates.RUNNING)return;
       l.users.forEach(u => {
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








