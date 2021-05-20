class Parent {
    constructor() {
        this.children = new Map();
    }
}

class Child {
    constructor(parent) {
        this.parent = parent;
    }
}

const parent = new Parent();

parent.children.set(1, new Child(parent));

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
