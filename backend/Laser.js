export class Laser{
    location;
    sides;
    lifeDuration;
    currentLifeDuration;
    angle;
    speed;
    radius;
    direction;
    team;
    startTime;
    movement;

    constructor(location, sides, lifeDuration, speed, radius, direction, startTime, movement) {
        this.location = location;
        this.sides = sides;
        this.lifeDuration = lifeDuration;
        this.angle = 0;
        this.currentLifeDuration = lifeDuration;
        this.speed = speed;
        this.radius = radius;
        this.direction = direction;
        this.team = -1;
        this.startTime = startTime;
        this.movement = movement;
    }

    calcNewAngle(){
        this.angle += this.speed * (this.direction?1:-1);
    }

    update(){
        if(this.startTime > 0){
            this.startTime--;
            return;
        }


        this.calcNewAngle();
        if(this.movement !== null){
            let movement = this.movement.getNormalVec();
            this.location[0] += movement[0];
            this.location[1] += movement[1];
            let k = ((this.movement.direction?this.movement.xPos1:this.movement.xPos2) - this.location[0]) / (this.movement.xPos1 - this.movement.xPos2);
            if(isNaN(k)) k = ((this.movement.direction?this.movement.yPos1:this.movement.yPos2) - this.location[1]) / (this.movement.yPos1 - this.movement.yPos2);
            if(isNaN(k)) k = 0;
            if(Math.abs(k)>=1)this.movement.direction = !this.movement.direction;
        }
        if(this.team === -1){
            return;
        }
        this.currentLifeDuration--;
        if(this.currentLifeDuration <= 0){
            this.team = -1;
            this.currentLifeDuration = this.lifeDuration;
        }
    }
}

export class Movement{
    xPos1;
    yPos1;
    xPos2;
    yPos2;
    direction;
    speed;


    constructor(xPos1, yPos1, xPos2, yPos2, speed) {
        this.xPos1 = xPos1;
        this.yPos1 = yPos1;
        this.xPos2 = xPos2;
        this.yPos2 = yPos2;
        this.speed = speed;
        this.direction = true;
    }

    getNormalVec(){
        let dx = this.xPos2 - this.xPos1;
        let dy = this.yPos2 - this.yPos1;
        let length = Math.sqrt(dx * dx + dy * dy);

        let nx = (dx / length) * (this.direction?1:-1) * this.speed;
        let ny = (dy / length) * (this.direction?1:-1) * this.speed;

        return [nx,ny];
    }

}

