const PointedMap = require('../src/PointedMap');

const map = new PointedMap(null, ['prop1', 'prop2']);

map.set(1, {
    id: 1,
    prop1: 'foo',
    prop2: 'bar'
});

const nonull0 = map.getOneBy('prop1', 'foo');
const nonull1 = map.getOneBy('prop2', 'bar');

map.get(1).prop1 = 'no';

const nonull2 = map.getOneBy('prop1', 'no');

map.get(1).prop2 = 'yes';

const nonull3 = map.getOneBy('prop2', 'yes');

if (nonull0 && nonull1 && nonull2 && nonull3) {
    process.env.executedFromAll ? (module.exports = true) : console.log('SUCCESS');
} else {
    console.log(nonull0, nonull1, nonull2, nonull3);
    process.env.executedFromAll ? (module.exports = false) : console.log('FAIL');
}
