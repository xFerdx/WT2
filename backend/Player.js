import {Map} from "./Map.js";


export class Player{
    xPos;
    yPos;
    playerSpeed;
    radius;
    team;
    name;
    status;
    ability;
    left;
    right;
    up;
    down;
    stunnedTime = 0;


    constructor(xPos, yPos, playerSpeed, radius, team, name, ability) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.playerSpeed = playerSpeed;
        this.radius = radius;
        this.team = team;
        this.name = name;
        this.ability = ability;
        this.status = playerStates.ALIVE;
        this.left = this.right = this.up = this.down = false;
    }

    keyPressed(key){
        switch (key){
            case 'A':
                this.left = true;
                break;
            case 'D':
                this.right = true;
                break;
            case 'S':
                this.down = true;
                break;
            case 'W':
                this.up = true;
                break;
            case 'SPACE':
                this.ability.pressed = true;
                break;
            default:
                console.log("unknown key");
        }
    }

    keyReleased(key){
        switch (key){
            case 'A':
                this.left = false;
                break;
            case 'D':
                this.right = false;
                break;
            case 'S':
                this.down = false;
                break;
            case 'W':
                this.up = false;
                break;
            case 'SPACE':
                break;
            default:
                console.log("unknown key");
        }
    }

    updateLocation(){
        if(this.status === playerStates.DEAD || this.status === playerStates.STUNNED)return;
        let upOrDown = this.up || this.down;
        let leftOrRight = this.left || this.right;

        if(this.right)this.xPos += this.playerSpeed / (upOrDown?Math.sqrt(2):1);
        if(this.left)this.xPos -= this.playerSpeed / (upOrDown?Math.sqrt(2):1);
        if(this.down)this.yPos += this.playerSpeed / (leftOrRight?Math.sqrt(2):1);
        if(this.up)this.yPos -= this.playerSpeed / (leftOrRight?Math.sqrt(2):1);

        if(this.xPos > Map.xMax)this.xPos = 0;
        if(this.xPos < 0)this.xPos = Map.xMax;
        if(this.yPos > Map.yMax)this.yPos = 0;
        if(this.yPos < 0)this.yPos = Map.yMax;
    }


    checkLaserActivation(map){
        if(this.status === playerStates.DEAD || this.status === playerStates.STUNNED) return;
        map.lasers.forEach(l =>{
            if(l.team !== -1 || l.startTime > 0)return;
            if((this.radius + 10)**2 >= (this.xPos - l.location[0])**2 +  (this.yPos - l.location[1])**2)
                l.team = this.team;
        });
    }

    checkLaserCollision(map){
        if(this.status === playerStates.IMMORTAL || this.status === playerStates.DEAD)return;
        map.lasers.forEach(l => {
            if(l.team === -1 || l.team === this.team) return;
            for (let i = 0; i < l.sides; i++) {
                let x1 = l.location[0] + Math.cos(l.angle + i * (Math.PI * 2 / l.sides)) * l.radius;
                let y1 = l.location[1] + Math.sin(l.angle + i * (Math.PI * 2 / l.sides)) * l.radius;

                let vx = l.location[0] - x1;
                let vy = l.location[1] - y1;

                let x2 = this.xPos;
                let y2 = this.yPos;

                let q = ((x2-x1)**2 + (y2-y1)**2 - this.radius**2) / (vx**2 + vy**2);
                let p = (2*(x2-x1)*vx + 2*(y2-y1)*vy) / (vx**2 + vy**2);

                let k1 = -(-p/2 + Math.sqrt((p/2)**2-q));
                let k2 = -(-p/2 - Math.sqrt((p/2)**2-q));

                if (isNaN(k1) || isNaN(k2)) continue;
                let minK = Math.max(k1,k2);

                if(minK >= 0 && minK <= 1) {
                    this.status = playerStates.DEAD;
                }
            } 
        });
        
    }

    updateEffects(){
        if(this.status !== playerStates.STUNNED)return;
        if(this.stunnedTime > 0){
            this.stunnedTime--;
        }else{
            this.status = playerStates.ALIVE;
        }
    }

    checkRevive(players){
       players.forEach(p => {
          if(p === this || p.team !== this.team || p.status !== playerStates.DEAD)return;
          if((p.radius + this.radius)**2 >= (p.xPos - this.xPos)**2 + (p.yPos - this.yPos)**2)
              p.status = playerStates.ALIVE;
       });
    }

    checkPowerUpActivation(map) {
        map.powerUps.forEach(p => {
            if(!p.enabled)return;
            if(this.checkPowerUpCollision(p))  //check if they touch
                if(p.type === "reset") {
                    p.activateReset(map);
                }
                else if(p.type==="reverse") {
                    p.activateReverse(map);
                }
        });

    }

    checkPowerUpCollision (powerUp) {
        let dx = powerUp.x - this.xPos;
        let dy = powerUp.y - this.yPos;
        let distance = Math.sqrt(dx * dx + dy * dy);
        return distance < powerUp.radius + this.radius;
    }


}

export const playerStates = {
    ALIVE: 'ALIVE',
    DEAD: 'DEAD',
    STUNNED: 'STUNNED',
    IMMORTAL: 'IMMORTAL'
};
