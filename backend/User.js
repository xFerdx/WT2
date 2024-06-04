export class User{
    websocket;
    player;

    constructor(websocket) {
        this.websocket = websocket;
        this.player = null;
    }
}
