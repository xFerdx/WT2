import {playerStates} from "./Player.js";

class Ability{
    pressed = false;
    abilityName;
    coolDownTime;
    currentCoolDownTime;
    duration;
    currentDuration;
    activated = false;

    update(map, players, p){
        if(this.pressed) {
            if (this.activated) {
                this.endOfAbility(map, players, p);
            }else {
                if(this.currentCoolDownTime === 0)
                    this.activate(map, players, p);
            }
            this.pressed = false;
        }

        if (this.activated) {
            if (this.currentDuration > 0) {
                this.currentDuration--;
            } else {
                this.endOfAbility(map, players, p);
            }
        } else {
            if (this.currentCoolDownTime > 0)
                this.currentCoolDownTime--;
        }

    }

    activate(map, players, p){
        this.activated = true;
    }

    endOfAbility(map, players, p){
        this.activated = false;
        this.currentCoolDownTime = this.coolDownTime;
        this.currentDuration = this.duration;
    }
}

export class AbilityStunner extends Ability{
    abilityName = "stunner";
    coolDownTime = 100;
    duration = 18;
    currentCoolDownTime;
    currentDuration;
    range = 50;
    stunnedTime = 200;

    constructor() {
        super();
        this.currentDuration = this.duration;
        this.currentCoolDownTime = this.coolDownTime;
    }

    activate(map, players, p){
        super.activate(map, players, p);
        players.forEach(pl => {
           if(pl === p || pl.status === playerStates.DEAD || pl.status === playerStates.STUNNED )return;
           if((pl.radius + this.range) ** 2 >= (pl.xPos - p.xPos)**2+(pl.yPos - p.yPos)**2){
               pl.status = playerStates.STUNNED;
               pl.stunnedTime = this.stunnedTime;
           }
        });
    }
}


export class AbilityHunter extends Ability{
    abilityName = "hunter";
    coolDownTime = 1000;
    duration = 250;
    currentCoolDownTime;
    currentDuration;
    setPointX;
    setPointY;


    constructor() {
        super();
        this.currentDuration = this.duration;
        this.currentCoolDownTime = this.coolDownTime;
    }

    activate(map, players, p){
        super.activate(map, players, p);
        this.setPointX = p.xPos;
        this.setPointY = p.yPos;
    }

    endOfAbility(map, players, p){
        super.endOfAbility(map, players, p);
        console.log(p.xPos);
        players.forEach(pl => {
            if(pl === p) return;
            let x1 = p.xPos;
            let y1 = p.yPos;

            let vx = this.setPointX - x1;
            let vy = this.setPointY - y1;

            let x2 = pl.xPos;
            let y2 = pl.yPos;

            let qs = ((x2-x1)**2 + (y2-y1)**2 - pl.radius**2) / (vx**2 + vy**2);
            let ps = (2*(x2-x1)*vx + 2*(y2-y1)*vy) / (vx**2 + vy**2);

            let k1 = -(-ps/2 + Math.sqrt((ps/2)**2-qs));
            let k2 = -(-ps/2 - Math.sqrt((ps/2)**2-qs));

            if (isNaN(k1) || isNaN(k2)) return;
            let minK = (k1+k2)/2;

            if(minK >= 0 && minK <= 1) {
                pl.status = playerStates.DEAD;
            }

        });

        p.xPos = this.setPointX;
        p.yPos = this.setPointY;



    }
}


export class AbilityThief extends Ability{
    abilityName = "thief";
    coolDownTime = 300;
    duration = 0;
    currentCoolDownTime;
    currentDuration;
    range = 80;

    constructor() {
        super();
        this.currentDuration = this.duration;
        this.currentCoolDownTime = this.coolDownTime;
    }

    activate(map, players, p){
        super.activate(map, players, p);
        map.lasers.forEach(l =>{
            if((this.range) ** 2 >= (l.location[0] - p.xPos)**2+(l.location[1] - p.yPos)**2){
                l.team = p.team;
            }
        });
    }
}


export class AbilityImmortal extends Ability{
    abilityName = "immortal";
    coolDownTime = 1000;
    duration = 500;
    currentCoolDownTime;
    currentDuration;

    constructor() {
        super();
        this.currentDuration = this.duration;
        this.currentCoolDownTime = this.coolDownTime;
    }

    activate(map, players, p){
        super.activate(map, players, p);
        p.status = playerStates.IMMORTAL;
    }

    endOfAbility(map, players, p){
        super.endOfAbility(map, players, p);
        if(p.status === playerStates.IMMORTAL)
            p.status = playerStates.ALIVE;
    }
}
