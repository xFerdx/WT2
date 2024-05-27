const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

const clients = [];

class Player{
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

let player = [];

wss.on('connection', function connection(ws) {
    console.log('A client connected.');
    clients.push(ws);
    player.push(new Player(50,50));
    sendPlayers(ws);
    sendPlayerIdx(ws,player.length-1)

    ws.on('message', function incoming(message) {
        const data = JSON.parse(message);
        console.log('Received: %s', data);
        console.log("connected:" + clients.length + " " + player.length)
        let idx = clients.indexOf(ws);
        player[idx] = data;

        clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {

                sendPlayers(client)
            }
        });
    });

    ws.on('close', function close() {
        console.log('A client disconnected.');

        const index = clients.indexOf(ws);
        if (index > -1) {
            clients.splice(index, 1);
            player.splice(index, 1);

            clients.forEach((client, i) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    sendPlayers(client);
                    if(i >= index)sendPlayerIdx(client,i);

                }
            });


        }
    });


});

function sendPlayers(client){
    const payload = {
        type: 'playerUpdate',
        message: player
    };
    client.send(JSON.stringify(payload));
}

function sendPlayerIdx(client, idx){
    const payload = {
        type: 'localPlayerIdx',
        message: idx
    };
    client.send(JSON.stringify(payload));
}