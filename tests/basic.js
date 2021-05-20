const PointedMap = require('../src/PointedMap');

const pointerName = 'value';

const map = new PointedMap([pointerName]);

map.set(1, {
    id: 1,
    value: 'foo'
});

const shouldBeNull1 = map.getBy('value', 'ass');
const shouldNotBeNull1 = map.getBy('value', 'foo');

if (!shouldBeNull1 && shouldNotBeNull1) {
    process.env.executedFromAll
        ? (module.exports = true)
        : console.log('SUCCESS');
} else {
    console.log(shouldBeNull1, shouldNotBeNull1);
    process.env.executedFromAll
        ? (module.exports = false)
        : console.log('FAIL');
}
