const PointedMap = require('../src/PointedMap');

const map = new PointedMap();

try {
    map.set(undefined, {});
    process.env.executedFromAll ? (module.exports = true) : console.log('SUCCESS');
} catch {
    process.env.executedFromAll ? (module.exports = false) : console.log('FAIL');
}
