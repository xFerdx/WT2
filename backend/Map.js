import {Laser, Movement} from './Laser.js';
import {PowerUp} from './PowerUp.js';

export class Map{
    lasers = [];
    powerUps = [];

    static xMin = 0;
    static yMin = 0;
    static xMax = 1920;
    static yMax = 1080;

}

export class MapFactory{
    static map1(){
        let m = new Map();
        m.lasers.push(new Laser([Map.xMin + 0.2 * (Map.xMax - Map.xMin), Map.yMin + 0.3 * (Map.yMax - Map.yMin)],1,1000,0.007, 300, false, 500, null))
        m.lasers.push(new Laser([Map.xMin + 0.2 * (Map.xMax - Map.xMin), Map.yMin + 0.7 * (Map.yMax - Map.yMin)],2,1000,0.007, 300, false, 500, null))
        m.lasers.push(new Laser([Map.xMin + 0.4 * (Map.xMax - Map.xMin), Map.yMin + 0.3 * (Map.yMax - Map.yMin)],3,1000,0.007, 300, false, 500, null))
        m.lasers.push(new Laser([Map.xMin + 0.4 * (Map.xMax - Map.xMin), Map.yMin + 0.7 * (Map.yMax - Map.yMin)],4,1000,0.00007, 300, false, 500, null))
        m.lasers.push(new Laser([Map.xMin + 0.6 * (Map.xMax - Map.xMin), Map.yMin + 0.3 * (Map.yMax - Map.yMin)],5,1000,0.007, 300, false, 500, null))
        m.lasers.push(new Laser([Map.xMin + 0.6 * (Map.xMax - Map.xMin), Map.yMin + 0.7 * (Map.yMax - Map.yMin)],6,1000,0.007, 300, false, 500, null))
        m.lasers.push(new Laser([Map.xMin + 0.8 * (Map.xMax - Map.xMin), Map.yMin + 0.3 * (Map.yMax - Map.yMin)],3,1000,0.007, 300, false, 500, null))
        m.lasers.push(new Laser([Map.xMin + 0.8 * (Map.xMax - Map.xMin), Map.yMin + 0.7 * (Map.yMax - Map.yMin)],10,1000,0.005, 300, false, 500, null))

        let m1 = new Movement(Map.xMin + 0.1 * (Map.xMax - Map.xMin), Map.yMin + 0.5 * (Map.yMax - Map.yMin), Map.xMin + 0.9 * (Map.xMax - Map.xMin),  Map.yMin + 0.5 * (Map.yMax - Map.yMin),1)
        m.lasers.push(new Laser([Map.xMin + 0.1 * (Map.xMax - Map.xMin), Map.yMin + 0.5 * (Map.yMax - Map.yMin)],3,1000,0.007, 200, false, 10, m1))
        let m2 = new Movement(Map.xMin + 0.9 * (Map.xMax - Map.xMin), Map.yMin + 0.5 * (Map.yMax - Map.yMin), Map.xMin + 0.1 * (Map.xMax - Map.xMin),  Map.yMin + 0.5 * (Map.yMax - Map.yMin),1)
        m.lasers.push(new Laser([Map.xMin + 0.9 * (Map.xMax - Map.xMin), Map.yMin + 0.5 * (Map.yMax - Map.yMin)],3,1000,0.007, 200, false, 10, m2))

        return m;
    }
}
