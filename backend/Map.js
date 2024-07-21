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
        m.lasers.push(new Laser([0.2 * Map.xMax, 0.25 * Map.yMax],3,1000,0.003, 330, false, 300, null));
        m.lasers.push(new Laser([0.2 * Map.xMax, 0.75 * Map.yMax],3,1000,0.003, 330, false, 300, null));
        m.lasers.push(new Laser([0.4 * Map.xMax, 0.25 * Map.yMax],3,1000,0.003, 330, false, 300, null));
        m.lasers.push(new Laser([0.4 * Map.xMax, 0.75 * Map.yMax],3,1000,0.003, 330, false, 300, null));
        m.lasers.push(new Laser([0.6 * Map.xMax, 0.25 * Map.yMax],3,1000,0.003, 330, false, 300, null));
        m.lasers.push(new Laser([0.6 * Map.xMax, 0.75 * Map.yMax],3,1000,0.003, 330, false, 300, null));
        m.lasers.push(new Laser([0.8 * Map.xMax, 0.25 * Map.yMax],3,1000,0.003, 330, false, 300, null));
        m.lasers.push(new Laser([0.8 * Map.xMax, 0.75 * Map.yMax],3,1000,0.003, 330, false, 300, null));

        let m1 = new Movement(0.1 * Map.xMax, 0.5 * Map.yMax, 0.9 * Map.xMax,  0.5 * Map.yMax,1);
        m.lasers.push(new Laser([0.2 * Map.xMax, 0.5 * Map.yMax],3,1000,0.003, 200, false, 1000, m1));
        let m2 = new Movement(0.9 * (Map.xMax ), 0.5 * Map.yMax, 0.1 * Map.xMax,  0.5 * Map.yMax,1);
        m.lasers.push(new Laser([0.9 * Map.xMax, 0.5 * Map.yMax],3,1000,0.003, 200, false, 1000, m2));

        let m3 = new Movement(Map.xMax/2, 30, Map.xMax/2, Map.yMax - 30, 1);
        m.lasers.push(new Laser([Map.xMax/2, 30],2,1000,0, 960, false, 2500,m3));

        m.lasers.push(new Laser([0.3 * Map.xMax, 0.375 * Map.yMax],3,1000,0.003, 330, false, 4000, null));
        m.lasers.push(new Laser([0.3 * Map.xMax, 0.625 * Map.yMax],3,1000,0.003, 330, false, 4000, null));
        m.lasers.push(new Laser([0.5 * Map.xMax, 0.375 * Map.yMax],3,1000,0.003, 330, false, 4000, null));
        m.lasers.push(new Laser([0.5 * Map.xMax, 0.625 * Map.yMax],3,1000,0.003, 330, false, 4000, null));
        m.lasers.push(new Laser([0.7 * Map.xMax, 0.375 * Map.yMax],3,1000,0.003, 330, false, 4000, null));
        m.lasers.push(new Laser([0.7 * Map.xMax, 0.625 * Map.yMax],3,1000,0.003, 330, false, 4000, null));

        m.lasers.push(new Laser([Map.xMax/2, Map.yMax/2],3,1000,0.003, 1100, true, 6000,null));

        return m;
    }
}
