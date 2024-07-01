import {Laser, Movement} from './Laser.js';
import {PowerUp} from './PowerUp.js';

export class Map{
    lasers = [];
    powerUps = [];

    static xMax = 1920;
    static yMax = 1080;

}

export class MapFactory{
    static map1(){
        let m = new Map();
        m.lasers.push(new Laser([0.2 * Map.xMax, 0.3 * Map.yMax],3,1000,0.003, 300, false, 200, null))
        m.lasers.push(new Laser([0.2 * Map.xMax, 0.7 * Map.yMax],3,1000,0.003, 300, false, 200, null))
        m.lasers.push(new Laser([0.4 * Map.xMax, 0.3 * Map.yMax],3,1000,0.003, 300, false, 200, null))
        m.lasers.push(new Laser([0.4 * Map.xMax, 0.7 * Map.yMax],3,1000,0.003, 300, false, 200, null))
        m.lasers.push(new Laser([0.6 * Map.xMax, 0.3 * Map.yMax],3,1000,0.003, 300, false, 200, null))
        m.lasers.push(new Laser([0.6 * Map.xMax, 0.7 * Map.yMax],3,1000,0.003, 300, false, 200, null))
        m.lasers.push(new Laser([0.8 * Map.xMax, 0.3 * Map.yMax],3,1000,0.003, 300, false, 200, null))
        m.lasers.push(new Laser([0.8 * Map.xMax, 0.7 * Map.yMax],3,1000,0.003, 300, false, 200, null))

        let m1 = new Movement(0.1 * Map.xMax, 0.5 * Map.yMax, 0.9 * Map.xMax,  0.5 * Map.yMax,1)
        m.lasers.push(new Laser([0.1 * Map.xMax, 0.5 * Map.yMax],3,1000,0.003, 200, false, 700, m1))
        let m2 = new Movement(0.9 * (Map.xMax ), 0.5 * Map.yMax, 0.1 * Map.xMax,  0.5 * Map.yMax,1)
        m.lasers.push(new Laser([0.9 * Map.xMax, 0.5 * Map.yMax],3,1000,0.003, 200, false, 700, m2))

        return m;
    }
}
