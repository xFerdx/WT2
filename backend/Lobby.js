export class Lobby{

    isPreLobby;
    creationTime;
    scoreTeam1;
    scoreTeam2;
    maxPlayers;
    status;
    map;
    users;


    constructor(isPreLobby, maxPlayers) {
        this.creationTime = Date.now().toString();
        this.scoreTeam1 = 0;
        this.scoreTeam2 = 0;
        this.isPreLobby = isPreLobby;
        this.maxPlayers = maxPlayers;
        this.status = lobbyStates.WAITING;
        this.users = [];
    }
}

export const lobbyStates = {
    WAITING: 'WAITING',
    STARTING: 'STARTING',
    RUNNING: 'RUNNING'
}