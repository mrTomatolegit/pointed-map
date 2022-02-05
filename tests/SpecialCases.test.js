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

test('Change 2', () => {
    const nonull0 = map.getOneBy('indexed', foo);
    expect(nonull0).toBeDefined();
    const nonull1 = map.getOneBy('object.indexed', foo);
    expect(nonull1).toBeDefined();

    map.get(1).indexed = 'fee';

    const nonull2 = map.getOneBy('indexed', 'fee');
    expect(nonull2).toBeDefined();

    map.get(1).object.indexed = 'fee';

    const nonull3 = map.getOneBy('object.indexed', 'fee');
    expect(nonull3).toBeDefined();
});

test('Circular', () => {
    class Parent {
        constructor() {
            this.children = [];
        }

        addChild(child) {
            this.children.push(child);
        }
    }

    class Child {
        constructor(parent) {
            this.parent = parent;
        }
    }

    const parent = new Parent();
    parent.addChild(new Child(parent));

    const map = new PointedMap(null, ['parent']);

    map.set(1, new Child(parent));

    expect(map.getBy('parent', new Parent())).toBeUndefined();
    expect(map.getBy('parent', parent)).toBeDefined();
});

test('Deep object', () => {
    const pointerName = 'obj.obj2.obj3.obj4.obj5.obj6.obj7.value';

    const oldValue = foo
    const newValue = 'fee';

    const map = new PointedMap(null, [pointerName]);

    map.set(1, {
        id: 1,
        obj: {
            obj2: {
                obj3: {
                    obj4: {
                        obj5: {
                            obj6: {
                                obj7: {
                                    value: oldValue
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    const get = x => map.getOneBy(pointerName, x);

    expect(get(newValue)).toBeUndefined();
    expect(get(oldValue)).toBeDefined();

    map.get(1).obj.obj2.obj3.obj4.obj5.obj6.obj7.value = newValue;

    expect(get(oldValue)).toBeUndefined();
    expect(get(newValue)).toBeDefined();
});
