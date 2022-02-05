const PointedMap = require('../src/PointedMap');
const { test, expect } = require('@jest/globals');

const map = new PointedMap(null, ['id', 'value']);

map.set(1, { id: 1, value: 'orange' })
    .set(2, { id: 2, value: 'green' })
    .set(3, { id: 3, value: 'TAP' })
    .set(4, { id: 4, value: 'woah' })
    .set(5, { id: 5, value: 'yellow' })
    .set(6, { id: 6, value: 'gg' })
    .set(7, { id: 7, value: 'orange' });

test('find', () => {
    expect(map.find(x => x.value === 'orange')).toBeDefined();
});
test('findKey', () => {
    expect(map.findKey(x => x === 4)).toBeDefined();
});
test('filter', () => {
    expect(map.filter(x => x.value === 'orange').size).toBe(2);
});
test('filterBy', () => {
    const filtered = map.filterBy('value', 'orange');

    expect(filtered['[[Pointers]]'].get('id')).toBeDefined();
    expect(filtered['[[Pointers]]'].get('val')).toBeUndefined();
});
test('first', () => {
    expect(map.first()).toEqual(map.get(1));
});
test('firstKey', () => {
    expect(map.firstKey()).toEqual(1);
});
test('last', () => {
    expect(map.last()).toEqual(map.get(7));
});
test('lastKey', () => {
    expect(map.lastKey()).toEqual(7);
});
