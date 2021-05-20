const PointedMap = require('../src/PointedMap');

const map = new PointedMap();

try {
    map.set(1, 'test');
    process.env.executedFromAll
        ? (module.exports = false)
        : console.log('FAIL');
} catch {
    process.env.executedFromAll
        ? (module.exports = true)
        : console.log('SUCCESS');
}
