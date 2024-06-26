import {Map, MapFactory} from "./Map.js";
import {playerStates} from "./Player.js";

export class Lobby{
    creationTime;
    scoreTeam1;
    scoreTeam2;
    maxPlayers;
    status;
    map;
    users;
    maxScore;


    constructor(isPreLobby, maxPlayers) {
        this.creationTime = Date.now().toString();
        this.scoreTeam1 = 0;
        this.scoreTeam2 = 0;
        this.maxPlayers = maxPlayers;
        this.status = lobbyStates.WAITING;
        this.users = [];
        this.maxScore = 3;
    }

    closeLobby(lobbies, idx){
        this.users.forEach(u => {
            u.player = null;
        });
        lobbies[0].users = lobbies[0].users.concat(this.users);
        lobbies.splice(idx, 1);
        for (let i = 0; i < lobbies.length; i++)
            console.log("lobby "+i+" : "+lobbies[i].users.length);
    }


    checkIfTeamWon(){
        return this.scoreTeam1 === this.maxScore || this.scoreTeam2 === this.maxScore;
    }

    checkAllPlayerDead(){
        let dead = [0,0]
        this.users.forEach(u => {
            if(u.player.status === playerStates.DEAD){
                dead[u.player.team]++;
            }
        })
        if(dead[0] === this.maxPlayers/2){
            this.scoreTeam2++;
            this.nextGameRound();
        }
        else if(dead[1] === this.maxPlayers/2){
            this.scoreTeam1++;
            this.nextGameRound();
        }
    }

    startGame(){
        this.users.forEach((u, idx) => {
            u.player.team = idx % 2;
            u.player.xPos = Map.xMax * (idx % 2 === 0? 0.1 : 0.9);
            u.player.yPos = Map.yMax / (Math.floor(this.users.length/2)+1) * (Math.floor(idx/2)+1);
        });
        this.map = MapFactory.map1();
        this.status = lobbyStates.RUNNING;
        this.users.forEach(u => {
            this.sendStartGame(u.websocket);
        });
    }

    nextGameRound(){
        this.users.forEach((u, idx) => {
            u.player.status = playerStates.ALIVE;
            u.player.team = idx % 2;
            u.player.xPos = Map.xMax * (idx % 2 === 0? 0.1 : 0.9);
            u.player.yPos = Map.yMax / (Math.floor(this.users.length/2)+1) * (Math.floor(idx/2)+1);
        });
        this.map = MapFactory.map1();
    }

    sendStartGame(ws){
        const payload = {
            type: 'startGame'
        };
        ws.send(JSON.stringify(payload));
    }

}

export const lobbyStates = {
    WAITING: 'WAITING',
    STARTING: 'STARTING',
    RUNNING: 'RUNNING'
}