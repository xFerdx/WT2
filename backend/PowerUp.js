export class PowerUp{


   
   

    x;
    y;
    lifeDuration;
    speed;
    startTime;
    location;
    type;
    radius;
    direction;
    initial_starttime = this.startTime;


    constructor(lifeDuration, startTime,x,y,location,type,radius,speed) {
        this.lifeDuration = lifeDuration;
        this.startTime = startTime;   
        this.radius = radius;
        this.speed = speed;
        this.x =x;
        this.y = y;
        this.location = location;
        this.type = type;
        this.direction = Math.random() * Math.PI * 2;
    }

    draw(ctx) {
        if(this.lifeDuration===0) {return;}
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.closePath();
    }

    update() {
        
        if(this.startTime>0) {
            this.startTime--;
            return;
        }
        

        if(this.lifeDuration > 0) {

        // Move the power-up
        this.x += this.speed * Math.cos(this.direction);
        this.y += this.speed * Math.sin(this.direction);
    
        // wall bouncing 1920 x 969 
        if (this.x < 0 || this.x > 1920) this.direction = Math.PI - this.direction;
        if (this.y < 0 || this.y > 969) this.direction = -this.direction;

        this.lifeDuration--;
        return;
        }
        this.lifeDuration=50;
        this.startTime = this.initial_starttime + 15;
        this.initial_starttime += 15;


      }
    

      checkCollision(player) {
        let dx = this.x - player.x;
        let dy = this.y - player.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius + player.radius;
      }

     activateReset(map) {
        map.lasers.forEach(l => {
            l.team = -1;
          }) 
     }
     activateReverse(map) {
        map.lasers.forEach(l => {
            if (l.team === 1) {
                l.team = 0;
                
            }
            else if (l.team === 0) {
                l.team = 1;
            }
          })
     }

    activate(){
        throw new Error("Must override method");
    }

    deactivate(){
        throw new Error("Must override method");
    }

}



class PowerUpResetAll extends PowerUp{

    constructor(lifeDuration, startTime) {
        super(lifeDuration, startTime);
    }

    activate(map){
        map.lasers.forEach(l => {
            l.team = -1;
          }) 
    }

    deactivate(){
        //TODO
    }
}

class PowerUpChangeAll extends PowerUp{

    constructor(lifeDuration, startTime) {
        super(lifeDuration, startTime);
    }

    activate(){
        map.lasers.forEach(l => {
            if (l.team === 1) {
                l.team = 0;
                
            }
            else if (l.team === 0) {
                l.team = 1;
            }
          })
    }

    deactivate(){
        //TODO
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