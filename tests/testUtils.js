const PointedMap = require('../src/PointedMap');

const a = new PointedMap(['value']);

const fail = () => {
    process.env.executedFromAll
        ? (module.exports = false)
        : console.log('FAIL');
};

a.set(1, { value: 'orange' })
    .set(2, { value: 'green' })
    .set(3, { value: 'TAP' })
    .set(4, { value: 'woah' })
    .set(5, { value: 'yellow' })
    .set(6, { value: 'gg' })
    .set(7, { value: 'orange' });

a.find(x => x.value === 'orange');
if (!a.find(x => x.value === 'orange')) fail();
if (!a.findKey(x => x === 4)) fail();
if (a.filter(x => x.value === 'orange').size !== 2) fail();
if (a.first() !== a.get(1)) fail();
if (a.firstKey() !== 1) fail();
if (a.last() !== a.get(7)) fail();
if (a.lastKey() !== 7) fail();

process.env.executedFromAll ? (module.exports = true) : console.log('SUCCESS');
