export class PowerUp{

    lifeDuration;
    currentLifeDuration;
    startTime;
    location;

    static xMax = 1920;
    static yMax = 969;

    constructor(lifeDuration, startTime) {
        this.lifeDuration = lifeDuration;
        this.startTime = startTime;
        this.currentLifeDuration = lifeDuration;
        this.location = [Math.random() * (1600 - 200) + 200,Math.random(930-100)+100]   
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

