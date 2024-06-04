console.log("exec preLobby file");
import {sendRequestJoin} from './socket.js';
console.log("exec preLobby file1");


let joinButton = document.getElementById('joinButton')
if(joinButton == null){
    console.log("not found button");
}else {
    joinButton.addEventListener('click', requestJoin);
}

