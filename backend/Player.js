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
                this.ability.active();
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

    updateLocation(map){
        let upOrDown = this.up || this.down;
        let leftOrRight = this.left || this.right;

        if(this.right)this.xPos += this.playerSpeed / (upOrDown?Math.sqrt(2):1);
        if(this.left)this.xPos -= this.playerSpeed / (upOrDown?Math.sqrt(2):1);
        if(this.down)this.yPos += this.playerSpeed / (leftOrRight?Math.sqrt(2):1);
        if(this.up)this.yPos -= this.playerSpeed / (leftOrRight?Math.sqrt(2):1);

        if(this.xPos > map.xMax)this.xPos = map.xMin;
        if(this.xPos < map.xMin)this.xPos = map.xMax;
        if(this.yPos > map.yMax)this.yPos = map.yMin;
        if(this.yPos < map.yMin)this.yPos = map.yMax;
    }


    checkLaserActivation(map){
        map.lasers.forEach(l =>{
            if(l.team !== -1)return;
            if(Math.pow(this.radius + 10,2) >= Math.pow(this.xPos - l.location[0],2) +  Math.pow(this.yPos - l.location[1],2))
                l.team = this.team;
        });
    }

    checkLaserCollision(map){
        map.lasers.forEach(l => {
            if(l.team === -1 || l.team === this.team) return;
            for (let i = 0; i < l.sides; i++) {
                let x1 = l.location[0] + Math.cos(l.angle + i*(Math.PI * 2/l.sides)) * l.radius;
                let y1 = l.location[1] + Math.sin(l.angle + i*(Math.PI * 2/l.sides)) * l.radius;

                let vx = l.location[0] - x1;
                let vy = l.location[1] - y1;

                let x2 = this.xPos;
                let y2 = this.yPos;

                let q = ((Math.pow(x2-x1,2)+Math.pow(y2-y1,2)-(Math.pow(this.radius,2)))/(Math.pow(vx,2)+Math.pow(vy,2)));
                let p = (2*(x2-x1)*vx+2*(y2-y1)*vy)/(Math.pow(vx,2)+Math.pow(vy,2));

                let k1 = -(-p/2 + Math.sqrt(Math.pow(p/2,2)-q));
                let k2 = -(-p/2 - Math.sqrt(Math.pow(p/2,2)-q));

                if (isNaN(k1) || isNaN(k2)) continue;
                let minK = Math.max(k1,k2);

                if(minK >= 0 && minK <= 1) {
                    this.status = playerStates.DEAD;
                }
            } 
        });
        
    }


}

export const playerStates = {
    ALIVE: 'ALIVE',
    DEAD: 'DEAD',
    STUNNED: 'STUNNED'
};
