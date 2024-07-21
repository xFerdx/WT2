import {Map} from "./Map.js";

export class PowerUp{
    x;
    y;
    speed;
    startTime;
    type;
    radius;
    direction;
    initialStartTime;
    enabled;


    constructor(startTime,x,y,type,radius,speed) {
        this.startTime = startTime;
        this.initialStartTime = startTime;
        this.radius = radius;
        this.speed = speed;
        this.x = x;
        this.y = y;
        this.type = type;
        this.direction = Math.random() * Math.PI * 2;
        this.enabled = false;
    }


    update() {
        this.x += this.speed * Math.cos(this.direction);
        this.y += this.speed * Math.sin(this.direction);
        if (this.x < 0 || this.x > Map.xMax) this.direction = Math.PI - this.direction;
        if (this.y < 0 || this.y > Map.yMax) this.direction = -this.direction;


        if(this.startTime > 0) {
            this.startTime--;
        }else{
            this.enabled = true;
        }
    }

    activateReset(map) {
        this.collectPowerUp();
        map.lasers.forEach(l => {
            l.team = -1;
        });
    }
    activateReverse(map) {
        this.collectPowerUp();
        map.lasers.forEach(l => {
            if (l.team === 1) {
                l.team = 0;
            }
            else if (l.team === 0) {
                l.team = 1;
            }
        });
    }

    collectPowerUp(){
        this.startTime = this.initialStartTime;
        this.enabled = false;
        this.direction = Math.random() * Math.PI * 2;
    }

}