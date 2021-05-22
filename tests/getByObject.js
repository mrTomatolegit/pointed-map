const PointedMap = require('../src/PointedMap');

const map = new PointedMap(null, ['obj']);

map.set(1, { obj: { nice: 'nice' } });

const shouldNotBeNull = map.getBy('obj', map.get(1).obj);

if (shouldNotBeNull) {
    process.env.executedFromAll ? (module.exports = true) : console.log('SUCCESS');
} else {
    process.env.executedFromAll ? (module.exports = false) : console.log('FAIL');
}
