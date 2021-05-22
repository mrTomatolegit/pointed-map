const Util = require('./Util');

const pointedIdProp = '[[PointedObjectID]]';
const keysProp = '[[Keys]]';
const sourceObjectProp = '[[ParentObject]]';
const pointersProp = '[[Pointers]]';
const dontUpdateProp = '[[Gone]]';
const proxyTarget = '[[Target]]';

/**
 *
 * @class
 * @type {PointedMap}
 * @extends {Map}
 */
class PointedMap extends Map {
    /**
     *
     * @type {new<K, V>(entries: Array<Array<K, V>>)}
     * @param {Array<Array<K, V>>}
     * @param {Array<string>} pointTo
     */
    constructor(entries = [], pointTo = []) {
        super(entries);

        Object.defineProperty(this, pointersProp, {
            enumerable: false,
            configurable: true,
            writable: false,
            value: new Map()
        });

        pointTo.forEach(prop => {
            this.addPointerFor(prop);
        });
    }

    /**
     *
     * @param {string} property
     * @param {any} value
     * @return {any}
     */
    getOneBy(property, value) {
        property = PointedMap._fixPointerName(property);
        const pointer = this[pointersProp].get(property);
        if (pointer) {
            const pointed = pointer.get(value);
            return pointed ? pointed[0] : null;
        }
        console.warn(`Property "${property}" is not pointed to`);

        return this.find(this._filterFunction(property, value));
    }

    /**
     *
     * @param {string} property
     * @param {any} value
     * @return {PointedMap<any, object>}
     */
    filterBy(property, value) {
        property = PointedMap._fixPointerName(property);
        const pointer = this[pointersProp].get(property);
        if (pointer) {
            const found = pointer.get(value);
            if (found) {
                const newMap = new PointedMap(null, Array.from(this[pointersProp].keys()));
                found.forEach(find => {
                    find[keysProp].forEach(key => {
                        newMap.set(key, find);
                    });
                });
                return newMap;
            }
            return undefined;
        }
        console.warn(`Property "${property}" is not pointed to`);

        const filtered = this.filter(this._filterFunction(property, value));
        return filtered.size > 0 ? filtered : undefined;
    }

    /**
     *
     * @param {string} property
     * @param {any} value
     * @return {Array<any>}
     */
    getBy(property, value) {
        property = PointedMap._fixPointerName(property);
        const pointer = this[pointersProp].get(property);
        if (pointer) {
            return pointer.get(value) || undefined;
        }
        console.warn(`Property "${property}" is not pointed to`);

        const filtered = Util.mapFilter(this, this._filterFunction(property, value));
        return filtered.length > 0 ? filtered : undefined;
    }

    /**
     *
     * @param {any} key
     * @param {object} value Must be an object
     * @return {this}
     */
    set(key, value) {
        if (typeof value !== 'object') throw new TypeError('value parameter must be an object');
        if (!value[keysProp]) {
            Object.defineProperty(value, keysProp, {
                enumerable: false,
                configurable: true,
                writable: false,
                value: []
            });
        }
        delete value[dontUpdateProp];
        super.set(key, value);
        value[keysProp].push(key);
        this._addToPointers(value);
        return this;
    }

    /**
     *
     * @param {any} key
     * @return {boolean}
     */
    delete(key) {
        const x = this.get(key);
        if (x) {
            if (!x[dontUpdateProp]) {
                Object.defineProperty(x, dontUpdateProp, {
                    enumerable: false,
                    configurable: true,
                    writable: false,
                    value: true
                });
            }
            x[keysProp].splice(
                x[keysProp].findIndex(k => k === key),
                1
            );
        }
        this._removeFromPointers(x);
        return super.delete(key);
    }

    /**
     *
     * @param {string} property The property pointed to (pointer name)
     * @return {this}
     */
    addPointerFor(property) {
        if (!property) throw new TypeError('property parameter is required');
        property = PointedMap._fixPointerName(property);

        this[pointersProp].delete(property);
        this[pointersProp].set(property, PointedMap._createPointer());
        this.forEach(x => {
            this._addToPointers(x, [property]);
        });
        return this;
    }

    /**
     *
     * @param {string} property The property pointed to (pointer name)
     * @return {this}
     */
    deletePointerFor(property) {
        if (!property) throw new TypeError('property parameter is required');
        property = PointedMap._fixPointerName(property);

        return this[pointersProp].delete(property);
    }

    //#region Utils
    /**
     *
     * @param {(value: object, key, pointedmap: PointedMap) => boolean} fn
     * @param {any?} thisArg
     * @returns {any|undefined}
     */
    find(fn, thisArg) {
        if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
        for (const [key, val] of this) {
            if (fn(val, key, this)) return val;
        }
        return undefined;
    }

    /**
     *
     * @param {(value: object, key, pointedmap: PointedMap) => boolean} fn
     * @param {any?} thisArg
     * @returns {any|undefined}
     */
    findKey(fn, thisArg) {
        if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
        for (const [key, val] of this) {
            if (fn(val, key, this)) return key;
        }
        return undefined;
    }

    /**
     *
     * @param {(value: object, key, pointedmap: PointedMap) => boolean} fn
     * @param {any?} thisArg
     * @returns {PointedMap}
     */
    filter(fn, thisArg) {
        if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
        const results = new PointedMap(null, Array.from(this[pointersProp].keys()));
        for (const [key, val] of this) {
            if (fn(val, key, this)) results.set(key, val);
        }
        return results;
    }

    /**
     *
     * @param {number?} amount
     * @returns {object|Array<object>}
     */
    first(amount) {
        if (typeof amount === 'undefined') return this.values().next().value;
        if (amount < 0) return this.last(amount * -1);
        amount = Math.min(this.size, amount);
        const iter = this.values();
        return Array.from({ length: amount }, () => iter.next().value);
    }

    /**
     *
     * @param {number?} amount
     * @returns {object|Array<object>}
     */
    firstKey(amount) {
        if (typeof amount === 'undefined') return this.keys().next().value;
        if (amount < 0) return this.lastKey(amount * -1);
        amount = Math.min(this.size, amount);
        const iter = this.keys();
        return Array.from({ length: amount }, () => iter.next().value);
    }

    /**
     *
     * @param {number?} amount
     * @returns {object|Array<object>}
     */
    last(amount) {
        const arr = Array.from(this.values());
        if (typeof amount === 'undefined') return arr[arr.length - 1];
        if (amount < 0) return this.first(amount * -1);
        if (!amount) return [];
        return arr.slice(-amount);
    }

    /**
     *
     * @param {number?} amount
     * @returns {object|Array<object>}
     */
    lastKey(amount) {
        const arr = Array.from(this.keys());
        if (typeof amount === 'undefined') return arr[arr.length - 1];
        if (amount < 0) return this.firstKey(amount * -1);
        if (!amount) return [];
        return arr.slice(-amount);
    }
    //#endregion

    //#region Private
    /**
     *
     * @private
     * @param {string} property
     * @param {any} value
     * @return {Function}
     */
    _filterFunction(property, value) {
        return x => {
            const found = Util.recursiveProp(x, property);
            if (Array.isArray(found)) return found.includes(value);
            return found === value;
        };
    }

    /**
     *
     * @private
     * @param {object} x
     * @param {Array<string>} pointers
     */
    _addToPointers(x, pointers = Array.from(this[pointersProp].keys())) {
        if (!x[pointedIdProp]) {
            Object.defineProperty(x, pointedIdProp, {
                enumerable: false,
                configurable: true,
                writable: false,
                value: Util.generateUniqueKey()
            });
        }
        this._proxifyProps(x, pointers);
        x = this.get(x[keysProp][x[keysProp].length - 1]);
        this[pointersProp].forEach((pointer, pointerName) => {
            if (!pointers.includes(pointerName)) return;

            let values = Util.recursiveProp(x, pointerName);
            values = Array.isArray(values) ? values : [values];

            if (!pointer.reference.get(x[pointedIdProp])) {
                pointer.reference.set(x[pointedIdProp], []);
            }

            values.forEach(val => {
                if (!pointer.get(val)) {
                    pointer.set(val, []);
                }

                pointer.reference.get(x[pointedIdProp]).push(val);

                pointer.get(val).push(x);
            });
        });
    }

    /**
     *
     * @private
     * @param {object} x
     * @param {Array<string>} pointers
     */
    _removeFromPointers(x, pointers = Array.from(this[pointersProp].keys())) {
        this[pointersProp].forEach((pointer, pointerName) => {
            if (!pointers.includes(pointerName)) return;

            let values = pointer.reference.get(x[pointedIdProp]);
            values = Array.isArray(values) ? values : [values];

            pointer.reference.delete(x[pointedIdProp]);

            values.forEach(val => {
                const prev = pointer.get(val);
                const i = prev.findIndex(a => a[pointedIdProp] === x[pointedIdProp]);

                if (i !== -1) prev.splice(i, 1);

                if (prev.length === 0) pointer.delete(val);
            });
        });
    }

    /**
     *
     * @private
     * @param {object} x
     * @param {string} propName
     */
    _update(x, propName = '') {
        const pointers = Array.from(this[pointersProp].keys()).filter(pointerName =>
            pointerName.endsWith(propName)
        );
        x = this._getSourceObject(x);

        this._removeFromPointers(x, pointers);
        this._addToPointers(x, pointers);
    }

    /**
     *
     * @private
     * @param {object} obj
     * @param {Array<string>} watchProps
     * @param {object} parent
     * @returns {object}
     */
    _proxify(obj, watchProps, parent) {
        if (obj[proxyTarget]) {
            obj = obj[proxyTarget];
        }
        return new Proxy(obj, {
            set: (target, p, value) => {
                target[p] = value;
                if (!this._getSourceObject(target) && obj !== parent) {
                    Object.defineProperty(target, sourceObjectProp, {
                        enumerable: false,
                        configurable: true,
                        writable: false,
                        value: parent
                    });
                }
                if (watchProps.includes(p)) this._update(parent, p);
                return true;
            },
            get: (target, p) => {
                if (p === proxyTarget) return target;
                else return target[p];
            }
        });
    }

    /**
     *
     * @private
     * @param {object} obj
     * @param {Array<string>} props
     */
    _proxifyProps(obj, props) {
        const parents = PointedMap._resolveSameParents(props);
        for (let parent in parents) {
            if (parent === '') {
                const proxified = this._proxify(obj, parents[parent], obj);
                obj[keysProp].forEach(key => {
                    super.set(key, proxified);
                });
            } else {
                const subProps = parent.split('.');
                const toProx = Util.recursiveProp(obj, parent);
                if (Array.isArray(toProx)) {
                    toProx.forEach((x, index, array) => {
                        array[index] = this._proxify(x, parents[parent], obj);
                    });
                } else {
                    const proxified = this._proxify(
                        Util.recursiveProp(obj, parent),
                        parents[parent],
                        obj
                    );
                    Util.recursiveProp(obj, parent, 1)[subProps[subProps.length - 1]] = proxified;
                }
            }
        }
    }

    /**
     *
     * @private
     * @param {object} obj
     * @returns {object}
     */
    _getSourceObject(obj) {
        let a = obj;
        while (a[sourceObjectProp]) {
            a = a[sourceObjectProp];
        }
        return a;
    }

    //#endregion

    //#region Private Static
    /**
     *
     * @private
     * @return {Map}
     */
    static _createPointer() {
        const pointer = new Map();
        pointer.reference = new Map();
        return pointer;
    }

    /**
     *
     * @private
     * @param {Array<string>} pointerNames
     * @returns {{string: Array<string>}}
     */
    static _resolveSameParents(pointerNames) {
        let parents = {};
        pointerNames.forEach(name => {
            const subProps = name.split('.');
            if (subProps.length === 1) {
                if (!parents['']) {
                    parents[''] = [];
                }
                parents[''].push(subProps[0]);
            } else {
                let subProp = subProps.pop();
                let parentName = subProps.join('.');
                if (!parents[parentName]) {
                    parents[parentName] = [];
                }
                parents[parentName].push(subProp);
            }
        });
        return parents;
    }

    /**
     *
     * @private
     * @param {string} string
     * @returns {string}
     */
    static _fixPointerName(string) {
        return string
            .split('.')
            .map(x => x)
            .join('.');
    }
    //#endregion
}

module.exports = PointedMap;
