const Util = require('./Util');

const pointedIdProp = '[[__POINTED_ID__]]';
const keysProp = '[[__KEYS__]]';
const sourceObjectProp = '[[__SOURCE_OBJECT__]]';

class PointedMap extends Map {
    /**
     *
     * @param {Array<string>} pointTo
     */
    constructor(pointTo = []) {
        super();

        /**
         *
         * @private
         * @type {Map<string, Map<any, Array<any>>>}
         */
        this._pointers = new Map();

        pointTo.forEach(prop => {
            this._pointers.set(prop, PointedMap._createPointer());
        });
    }

    /**
     *
     * @param {string} property
     * @param {any} value
     * @return {any}
     */
    getOneBy(property, value) {
        const pointer = this._pointers.get(property);
        if (pointer) {
            const pointed = pointer.get(value);
            return pointed ? pointed[0] : null;
        }
        console.warn(`Property "${property}" is not pointed to`);
        return Util.mapFind(this, this._filterFunction(property, value));
    }

    /**
     *
     * @param {string} property
     * @param {any} value
     * @return {Array<any>}
     */
    getBy(property, value) {
        const poiter = this._pointers.get(property);
        if (poiter) {
            return poiter.get(value);
        }
        console.warn(`Property "${property}" is not pointed to`);
        const filtered = Util.mapFilter(
            this,
            this._filterFunction(property, value)
        );
        return filtered.length > 0 ? filtered : undefined;
    }

    /**
     *
     * @param {(value: object, key, pointedmap: PointedMap) => boolean} fn
     * @param {any} thisArg
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
     * @param {any} thisArg
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
     * @param {any} thisArg
     * @returns {PointedMap}
     */
    filter(fn, thisArg) {
        if (typeof thisArg !== 'undefined') fn = fn.bind(thisArg);
        const results = new PointedMap();
        for (const [key, val] of this) {
            if (fn(val, key, this)) results.set(key, val);
        }
        return results;
    }

    /**
     *
     * @param {number} amount
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
     * @param {number} amount
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
     * @param {number} amount
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
     * @param {number} amount
     * @returns {object|Array<object>}
     */
    lastKey(amount) {
        const arr = Array.from(this.keys());
        if (typeof amount === 'undefined') return arr[arr.length - 1];
        if (amount < 0) return this.firstKey(amount * -1);
        if (!amount) return [];
        return arr.slice(-amount);
    }

    /**
     *
     * @param {any} key
     * @param {object} value Must be an object
     * @return {this}
     */
    set(key, value) {
        if (typeof value !== 'object')
            throw new TypeError('value parameter must be an object');
        if (!value[keysProp]) {
            Object.defineProperty(value, keysProp, {
                enumerable: false,
                configurable: true,
                writable: false,
                value: []
            });
        }
        value[keysProp].push(key);
        this._pointers.forEach((_, pointerName) => {
            this._addToPointer(
                pointerName,
                PointedMap._stringToVal(value, pointerName),
                value
            );
        });
        super.set(key, value);
        return this;
    }

    /**
     *
     * @param {any} key
     * @return {boolean}
     */
    delete(key) {
        const x = this.get(key);
        this._pointers.forEach((_, pointerName) => {
            this._removeFromPointer(
                pointerName,
                PointedMap._stringToVal(x, pointerName),
                x
            );
        });
        return super.delete(key);
    }

    /**
     *
     * @param {string} property The property pointed to
     * @return {this}
     */
    addPointerFor(property) {
        if (!property) throw new TypeError('property parameter is required');
        property = property
            .split('.')
            .filter(a => a)
            .join('.');
        this._pointers.delete(property);
        this.forEach(x => {
            const propVALUE = PointedMap._stringToVal(x, property);
            if (Array.isArray(propVALUE)) {
                propVALUE.forEach(val => {
                    this._addToPointer(property, val, x);
                });
            } else {
                this._addToPointer(property, propVALUE, x);
            }
        });
        return this;
    }

    /**
     *
     * @param {string} property The property pointed to
     * @return {this}
     */
    deletePointerFor(property) {
        if (!property) throw new TypeError('property parameter is required');
        property = property
            .split('.')
            .filter(a => a)
            .join('.');
        return this._pointers.delete(property);
    }

    /**
     *
     * @private
     * @param {string} property
     * @param {any} value
     * @return {Function}
     */
    _filterFunction(property, value) {
        return x => {
            const found = PointedMap._stringToVal(x, property);
            if (Array.isArray(found)) return found.includes(value);
            return found === value;
        };
    }

    /**
     *
     * @private
     * @param {string} name The name of the pointer
     * @param {any} value The pointed value
     * @param {object} x The object that contains the value
     */
    _addToPointer(name, value, x) {
        if (!this._pointers.get(name)) {
            this._pointers.set(name, PointedMap._createPointer());
        }
        value = Array.isArray(value) ? value : [value];
        this._proxifyProp(x, name);

        if (!x[pointedIdProp]) {
            Object.defineProperty(x, pointedIdProp, {
                enumerable: false,
                configurable: true,
                writable: false,
                value: Util.generateUniqueKey()
            });
        }

        if (!this._pointers.get(name).reference.get(x[pointedIdProp])) {
            this._pointers.get(name).reference.set(x[pointedIdProp], []);
        }
        value.forEach(val => {
            if (!this._pointers.get(name).get(val)) {
                this._pointers.get(name).set(val, []);
            }

            this._pointers.get(name).reference.get(x[pointedIdProp]).push(val);

            this._pointers.get(name).get(val).push(x);
        });
    }

    /**
     *
     * @private
     * @param {string} name The name of the pointer
     * @param {any} value The pointed value
     * @param {object} x The object that contains the value
     */
    _removeFromPointer(name, value, x) {
        this._pointers.get(name).reference.delete(x[pointedIdProp]);
        value = Array.isArray(value) ? value : [value];

        value.forEach(val => {
            const prev = this._pointers.get(name).get(val);
            const i = prev.findIndex(
                a => a[pointedIdProp] === x[pointedIdProp]
            );

            if (i !== -1) {
                prev.splice(i, 1);
            }

            if (prev.length === 0) {
                this._pointers.get(name).delete(val);
            }
        });
    }

    /**
     *
     * @private
     * @param {object} x
     */
    _update(x) {
        this._pointers.forEach((_, pointerName) => {
            x = this._getSourceObject(x);
            const POINTEDID = x[pointedIdProp];
            const previousValue = this._pointers
                .get(pointerName)
                .reference.get(POINTEDID);
            const newValue = PointedMap._stringToVal(x, pointerName);

            this._removeFromPointer(pointerName, previousValue, x);
            this._addToPointer(pointerName, newValue, x);
        });
    }

    /**
     *
     * @private
     * @param {object} obj
     * @param {string} string
     * @param {number} beforeLast
     * @return {any|Array<any>}
     */
    static _stringToVal(obj, string, beforeLast) {
        return Util.recursiveProp(obj, string, beforeLast);
    }

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
     * @param {object} obj
     * @return {object}
     */
    _proxify(obj, watchProp, parent) {
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
                if (p === watchProp) this._update(parent);
                return true;
            }
        });
    }

    /**
     *
     * @param {object} obj
     * @param {string} prop
     * @returns {Proxy}
     */
    _proxifyProp(obj, prop) {
        const props = prop.split('.');
        const toProx = PointedMap._stringToVal(obj, prop, 1);
        if (Array.isArray(toProx)) {
            toProx.forEach((x, index, array) => {
                array[index] = this._proxify(x, props[props.length - 1], obj);
            });
            return;
        }

        const proxified = this._proxify(obj, props[props.length - 1], obj);
        if (props[props.length - 2]) {
            PointedMap._stringToVal(obj, prop, 2)[props[props.length - 2]] =
                proxified;
        } else {
            obj[keysProp].forEach(key => {
                super.set(key, proxified);
            });
        }
    }

    /**
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
}

module.exports = PointedMap;
