const PointedMap = require('../src/PointedMap');

const pointerName = 'value';

const map = new PointedMap(null, [pointerName]);

const a = {
    id: 1,
    value: 'foo'
};

map.set(1, a);

const newa = map.get(1);

map.delete(1);

map.set(1, newa);

console.log(map.get(1));
