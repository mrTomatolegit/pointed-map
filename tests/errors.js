const PointedMap = require('../src/PointedMap');

const fail = () => {
    process.env.executedFromAll ? (module.exports = false) : console.log('FAIL');
};

try {
    new PointedMap('string');
    fail();
} catch (e) {
    console.log(e.message);
}

try {
    new PointedMap([1, 1]);
    fail();
} catch (e) {
    console.log(e.message);
}

try {
    new PointedMap([['key', 'value']]);
    fail();
} catch (e) {
    console.log(e.message);
}

try {
    new PointedMap(null, 'string');
    fail();
} catch (e) {
    console.log(e.message);
}

try {
    const map = new PointedMap();
    map.getOneBy();
    fail();
} catch (e) {
    console.log(e.message);
}

try {
    const map = new PointedMap();
    map.getBy();
    fail();
} catch (e) {
    console.log(e.message);
}

try {
    const map = new PointedMap();
    map.filterBy();
    fail();
} catch (e) {
    console.log(e.message);
}

try {
    const map = new PointedMap();
    map.set();
    fail();
} catch (e) {
    console.log(e.message);
}

try {
    const map = new PointedMap();
    map.addPointerFor();
    fail();
} catch (e) {
    console.log(e.message);
}

try {
    const map = new PointedMap();
    map.deletePointerFor();
    fail();
} catch (e) {
    console.log(e);
}
