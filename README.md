# Pointed Map
The much faster way of filtering and finding objects through Maps

## Implement with your project
```
npm i pointed-map --save
```

## Usage
```js
const PointedMap = require('pointed-map');

// The properties that the pointed map should make pointers to
const map = new PointedMap(['bar']);

// PointedMap extends Map, use anything as a key
// Values MUST be objects

const foo = {
    bar: 'Lorem'
};

map.set('anykey', foo);

// You can now access the value at lightning speed
map.getOneBy('bar', 'Lorem'); // Returns the first matching value
map.getBy('bar', 'Lorem'); // Returns all matching values

// Tip: getOneBy has no speed advantage over getBy
```