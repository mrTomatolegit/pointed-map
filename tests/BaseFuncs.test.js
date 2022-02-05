const PointedMap = require('../src/PointedMap');
const { test, expect } = require('@jest/globals');

const foo = 'foo';

let map;

beforeEach(() => {
    // Reset the pointed map
    map = new PointedMap(null, [
        'indexed',
        'object.indexed',
        'object.subobject.indexed',
        'object.subarray.indexed',
        'array.indexed',
        'array.object.indexed',
        'array.object.subobject.indexed',
        'array.subarray.indexed'
    ]);
    map.set(1, {
        id: foo,
        indexed: foo,
        object: {
            subobject: { indexed: foo },
            subarray: [{ indexed: foo }],
            indexed: foo
        },
        array: [
            {
                id: foo,
                indexed: foo,
                object: { subobject: { indexed: foo }, indexed: foo },
                subarray: [{ indexed: foo }]
            }
        ],
        notIndexed: foo
    });
});

test('Basic', () => {
    expect(map.getBy('indexed', 'fee')).toBeUndefined();
    expect(map.getBy('indexed', foo)).toBeDefined();

    map.delete(1);

    expect(map.getBy('indexed', foo)).toBeUndefined();
});

test('Add New Pointer', () => {
    expect(map.getBy('indexed', 'fee')).toBeUndefined();
    expect(map.getBy('indexed', foo)).toBeDefined();

    map.addPointerFor('notIndexed');

    expect(map.getBy('notIndexed', foo)).toBeDefined();
});

test('Array indexing', () => {
    const oldValue = foo;
    const newValue = 'fee';

    const get = x => map.getBy('array.indexed', x);

    expect(get(newValue)).toBeUndefined();
    expect(get(oldValue)).toBeDefined();

    map.get(1).array.indexed = newValue;

    expect(get(oldValue)).toBeDefined();
    expect(get(newValue)).toBeUndefined();
});

test('Blocks non objects', () => {
    try {
        map.set(1, 'test');
        expect(false).toBe(true);
    } catch {}
});

test('Delete inexistant does nothing', () => {
    map.delete(55);
});

test('Get By object', () => {
    map.addPointerFor('object');
    expect(map.getBy('object', map.get(1).object)).toBeDefined();
});

test('Add object with missing props', () => {
    map.set(2, {});
});

test('Map by undefined', () => {
    map.set(undefined, {});
});

test('Modify after delete', () => {
    const gotten = map.get(1);

    map.delete(1);

    gotten.indexed = 'fee';

    expect(map.getOneBy('indexed', 'fee')).toBeUndefined();
    expect(map.getOneBy('indexed', foo)).toBeUndefined();
});

test('Delete existing keys', () => {
    map.set(1, { indexed: 'foo' });

    expect(map.getBy('indexed', 'foo').length).toBe(1);
});
