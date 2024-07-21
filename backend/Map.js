import {Laser, Movement} from './Laser.js';
import {PowerUp} from './PowerUp.js';

export class Map{
    lasers = [];
    powerUps = [];

    static xMax = 1920;
    static yMax = 969;

}

export class MapFactory{
    static map1(){
        let m = new Map();
        m.lasers.push(new Laser([0.2 * Map.xMax, 0.3 * Map.yMax],1,1000,0.007, 300, false, 0, null))
        m.lasers.push(new Laser([0.2 * Map.xMax, 0.7 * Map.yMax],2,1000,0.007, 300, false, 0, null))
        m.lasers.push(new Laser([0.4 * Map.xMax, 0.3 * Map.yMax],3,1000,0.007, 300, false, 0, null))
        m.lasers.push(new Laser([0.4 * Map.xMax, 0.7 * Map.yMax],4,1000,0.00007, 300, false, 500, null))
        m.lasers.push(new Laser([0.6 * Map.xMax, 0.3 * Map.yMax],5,1000,0.007, 300, false, 500, null))
        m.lasers.push(new Laser([0.6 * Map.xMax, 0.7 * Map.yMax],6,1000,0.007, 300, false, 500, null))
        m.lasers.push(new Laser([0.8 * Map.xMax, 0.3 * Map.yMax],3,1000,0.007, 300, false, 500, null))
        m.lasers.push(new Laser([0.8 * Map.xMax, 0.7 * Map.yMax],10,1000,0.005, 300, false, 500, null))
        

        m.powerUps.push(new PowerUp(25,200,50,100,[50,100],"reset",15,3.0));
        m.powerUps.push(new PowerUp(15,40,100,200,[100,200],"reverse",15,3.0));
       

        let m1 = new Movement(0.1 * Map.xMax, 0.5 * Map.yMax, 0.9 * Map.xMax,  0.5 * Map.yMax,1)
        m.lasers.push(new Laser([0.1 * Map.xMax, 0.5 * Map.yMax],3,1000,0.007, 200, false, 10, m1))
        let m2 = new Movement(0.9 * (Map.xMax ), 0.5 * Map.yMax, 0.1 * Map.xMax,  0.5 * Map.yMax,1)
        m.lasers.push(new Laser([0.9 * Map.xMax, 0.5 * Map.yMax],3,1000,0.007, 200, false, 10, m2))

        return m;
    }
}
