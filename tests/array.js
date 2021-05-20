const PointedMap = require('../src/PointedMap');

const pointerName = 'obj.values.value';

const oldValue = 'old';

const newValue = 'new';

const map = new PointedMap([pointerName]);

map.set(1, {
    id: 1,
    obj: {
        values: [
            {
                value: oldValue
            },
            {
                value: 'bar'
            },
            {
                value: 'baz'
            }
        ]
    }
});

const getOldValue = () => {
    return map.getOneBy(pointerName, oldValue);
};

const getNewValue = () => {
    return map.getOneBy(pointerName, newValue);
};

const shouldBeNull1 = getNewValue();
const shouldNotBeNull1 = getOldValue();

map.get(1).obj.values[0].value = newValue;

const shouldBeNull2 = getOldValue();
const shouldNotBeNull2 = getNewValue();

if (!shouldBeNull1 && !shouldBeNull2 && shouldNotBeNull1 && shouldNotBeNull2) {
    process.env.executedFromAll
        ? (module.exports = true)
        : console.log('SUCCESS');
} else {
    process.env.executedFromAll
        ? (module.exports = false)
        : console.log('FAIL');
}
