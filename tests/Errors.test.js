/* eslint-disable no-empty */
const PointedMap = require('../src/PointedMap');
const { test, expect } = require('@jest/globals');

const fail = function () {
    expect(true).toBe(false);
};

test('String as entries', () => {
    try {
        new PointedMap('string');
        fail();
    } catch {}
});

test('Non-keyarray array entry', () => {
    try {
        new PointedMap([1, 1]);
        fail();
    } catch {}
});

test('Non-object value entry', () => {
    try {
        new PointedMap([['key', 'value']]);
        fail();
    } catch {}
});

test('Non-array pointTo', () => {
    try {
        new PointedMap(null, 'string');
        fail();
    } catch {}
});

test('getOneBy no args', () => {
    try {
        const map = new PointedMap();
        map.getOneBy();
        fail();
    } catch {}
});

test('getBy no args', () => {
    try {
        const map = new PointedMap();
        map.get();
        fail();
    } catch {}
});

test('filterBy no args', () => {
    try {
        const map = new PointedMap();
        map.filterBy();
        fail();
    } catch {}
});

test('set no args', () => {
    try {
        const map = new PointedMap();
        map.set;
        fail();
    } catch {}
});

test('addPointerFor no args', () => {
    try {
        const map = new PointedMap();
        map.addPointerFor();
        fail();
    } catch {}
});

test('deletePointerFor no args', () => {
    try {
        const map = new PointedMap();
        map.deletePointerFor();
        fail();
    } catch {}
});
