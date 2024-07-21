import { WebSocketServer } from 'ws';
import {lobbyStates, Lobby} from './Lobby.js';
import {User} from './User.js';
import {Player} from "./Player.js";
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

lobbies.push(new Lobby());

let t = Date.now();

function mainLoop() {
    //console.log(Date.now()-t);
    t = Date.now();
    update();
    sendData();

}

setInterval(mainLoop, 10);

wss.on('connection', function connection(ws) {
    console.log('A client connected.');
    lobbies[0].users.push(new User(ws));
    for (let i = 0; i < lobbies.length; i++)
        console.log("lobby "+i+" : "+lobbies[i].users.length);

    ws.on('message', function incoming(message) {
        const data = JSON.parse(message);
        console.log('Received: %s', data);

        switch (data.type) {
            case 'pressedKey': {
                let user = findUserOfWS(ws);
                if(!user.player)return;
                user.player.keyPressed(data.message);
                break;
            }
            case 'releasedKey': {
                let user = findUserOfWS(ws);
                if(!user.player)return;
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
        for (let i = 0; i < lobbies.length; i++)
            console.log("lobby "+i+" : "+lobbies[i].users.length);
    });

});

function findUserOfWS(webSocket){
    for (let l of lobbies) {
        for (let u of l.users) {
            if (u.websocket === webSocket) {
                return u;
            }
        }
    }
    return null;
}

function findLobbyOfUser(user){
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
    let user = findUserOfWS(ws);
    let lobby = findLobbyOfUser(user);
    let idx = lobby.users.indexOf(user);
    lobby.users.splice(idx,1);
}

function joinLobby(ws, playerNumber, userName, ability){
    let user = findUserOfWS(ws);
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
        for (let i = 0; i < lobbies.length; i++)
            console.log("lobby "+i+" : "+lobbies[i].users.length);
        return;
    }

    deleteWSFromLobby(ws);
    let lobby = new Lobby(playerNumber * 2);
    lobby.users.push(user);
    lobbies.push(lobby);
    for (let i = 0; i < lobbies.length; i++)
        console.log("lobby "+i+" : "+lobbies[i].users.length);
}



function update(){
    lobbies.forEach((l, idx) => {
        if(idx === 0)return;
        if(l.users.length === 0)lobbies.splice(idx, 1);

        if(l.status === lobbyStates.WAITING) {
            l.users.forEach(u => {
                sendPlayerNumberUpdate(u.websocket, l.users.length, l.maxPlayers)
            });
            if(l.maxPlayers === l.users.length && l.status){
                l.users.forEach(u => {
                    sendStartGame(u.websocket);
                });
                l.startGame();
            }
        }
        if(l.status === lobbyStates.RUNNING) {
            if (l.checkIfTeamWon()) {
                l.status = lobbyStates.ENDING;
                l.users.forEach(u => {
                   sendShowWinner(u.websocket);
                });
                return;
            }
            //l.checkAllPlayerDead();

            l.users.forEach(u => {
                u.player.updateLocation(l.map);
                u.player.checkLaserCollision(l.map);
                u.player.checkLaserActivation(l.map);
                u.player.ability.update(l.map, l.users.map(user => user.player), u.player);
                u.player.updateEffects();
                u.player.checkRevive(l.users.map(user => user.player), u.player);
            });

            l.map.lasers.forEach(lasers => {
                lasers.update();
            });
        }
        if(l.status === lobbyStates.ENDING){
            if(l.endingTime === 0) {
                l.closeLobby(lobbies, idx)
                l.users.forEach(u => {
                    sendEndGame(u.websocket);
                });
            }else{
                l.endingTime--;
            }
        }

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
           sendScores(u.websocket, [l.scoreTeam1, l.scoreTeam2]);
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

function sendScores(ws, score){
    const payload = {
        type: 'scoreUpdate',
        message: score
    };
    ws.send(JSON.stringify(payload));
}

function sendEndGame(ws){
    const payload = {
        type: 'endGame'
    };
    ws.send(JSON.stringify(payload));
}

function sendStartGame(ws){
    const payload = {
        type: 'startGame'
    };
    ws.send(JSON.stringify(payload));
}

function sendShowWinner(ws){
    const payload = {
        type: 'showWinner'
    };
    ws.send(JSON.stringify(payload));
}

function sendPlayerNumberUpdate(ws, playerNumber, maxPlayer){
    const payload = {
        type: 'playerNumberUpdate',
        message: {
            playerNumber: playerNumber,
            maxPlayer: maxPlayer
        }
    };
    ws.send(JSON.stringify(payload));
}


