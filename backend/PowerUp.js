export class PowerUp{

    lifeDuration;
    currentLifeDuration;
    startTime;

    constructor(lifeDuration, startTime) {
        this.lifeDuration = lifeDuration;
        this.startTime = startTime;
        this.currentLifeDuration = lifeDuration;
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

    activate(){
        //TODO
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
        //TODO
    }

    deactivate(){
        //TODO
    }
}

