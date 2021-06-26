const PointedMap = require('../src/PointedMap');

const pointerName = 'value';

const map = new PointedMap(null, [pointerName]);

map.set(1, {
    id: 1,
    value: 'foo'
});

const gotten = map.get(1);

map.delete(1);

gotten.value = 'cool';

const shouldBeNull1 = map.getOneBy(pointerName, 'cool');

if (!shouldBeNull1) {
    process.env.executedFromAll ? (module.exports = true) : console.log('SUCCESS');
} else {
    console.log(shouldBeNull1, shouldNotBeNull1, shouldBeNull2);
    process.env.executedFromAll ? (module.exports = false) : console.log('FAIL');
}
