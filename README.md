# Pointed Map

The much faster way of filtering and finding objects through Maps

## Implement with your project

```
npm i pointed-map --save
```

## Initiation

```js
const PointedMap = require('pointed-map');

// The properties that the pointed map should make pointers to
const map = new PointedMap(null, ['bar']);

// PointedMap extends Map, use anything as a key
// Values MUST be objects

const foo = {
    bar: 'Lorem'
};

map.set('anykey', foo);

// Returns the first matching value
map.getOneBy('bar', 'Lorem');

// Returns all matching values in an array
map.getBy('bar', 'Lorem');

// Returns all matching values in a new PointedMap
// with the same pointed properties
map.filterBy('bar', 'Lorem');
```

## Good to know

-   `getBy` and `getOneBy` have the same speed

## Usage

```js
// Method 1:
const map = new PointedMap(null, ['bar']);

map.set('anykey', { foo: 'ipsum', bar: 'Lorem' });

// Method 2:
const entries = [
    // [ key, value ]
    ['anykey', { foo: 'ipsum', bar: 'Lorem' }]
];

const map = new PointedMap(entries, ['foo', 'bar']);
```

### .getOneBy(property, value)

**Arguments**:

-   property: `string`
-   value: `any`

**Returns**: First matching value

```js
const got = map.getOneBy('bar', 'Lorem');
console.log(got.foo);
```

### .getBy(property, value)

**Arguments**:

-   property: `string`
-   value: `any`

**Returns**: Array of matching values

```js
map.getBy('bar', 'Lorem').forEach(x => {
    console.log(x.foo);
});
```

### .filterBy(property, value)

**Arguments**:

-   property: `string`
-   value: `any`

**Returns**: PointedMap filled with matching values

`getBy()` will **always** be faster than `filterBy()`

```js
const filtered = map.filterBy('bar', 'Lorem');
const got = filtered.getOneBy('foo', 'ipsum');
console.log(got);
```
