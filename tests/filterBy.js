const PointedMap = require('../src/PointedMap');

const map = new PointedMap([ ['a', { id: 1, val: true }] ], ['id', 'val']);

const filtered = map.filterBy('val', true)

if (!filtered["[[Pointers]]"].get("val") && filtered["[[Pointers]]"].get("id")) {
    process.env.executedFromAll ? (module.exports = true) : console.log('SUCCESS');
} else {
    console.log(filtered["[[Pointers]]"])
    process.env.executedFromAll ? (module.exports = false) : console.log('FAIL');
}