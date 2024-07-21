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
    endingTime;

    constructor(maxPlayers = 0) {
        this.creationTime = Date.now().toString();
        this.scoreTeam1 = 0;
        this.scoreTeam2 = 0;
        this.maxPlayers = maxPlayers;
        this.status = lobbyStates.WAITING;
        this.users = [];
        this.maxScore = 3;
        this.endingTime = 200;
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
            this.initPlayerPos(u,idx);
        });
        this.map = MapFactory.map1();
        this.status = lobbyStates.RUNNING;
    }

    nextGameRound(){
        this.users.forEach((u, idx) => {
            u.player.status = playerStates.ALIVE;
            this.initPlayerPos(u,idx);
            u.player.ability.currentCoolDownTime = u.player.ability.coolDownTime;
            u.player.ability.currentDuration = u.player.ability.duration;
            u.player.ability.pressed = false;
            u.player.ability.activated = false;
        });
        this.map = MapFactory.map1();
    }

    initPlayerPos(u,idx){
        u.player.team = idx % 2;
        u.player.xPos = Map.xMax * (idx % 2 === 0? 0.1 : 0.9);
        u.player.yPos = Map.yMax / (Math.floor(this.users.length/2)+1) * (Math.floor(idx/2)+1);
    }

}

export const lobbyStates = {
    WAITING: 'WAITING',
    STARTING: 'STARTING',
    RUNNING: 'RUNNING',
    ENDING: 'ENDING'
}