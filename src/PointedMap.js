const Util = require('./Util');

const pointedIdProp = '[[POINTEDID]]';

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
        return Util.mapFind(this, this._filterFunction);
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
        return Util.mapFilter(this, this._filterFunction);
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
     * @param {any} key
     * @param {object} value Must be an object
     * @return {this}
     */
    set(key, value) {
        if (typeof value !== 'object')
            throw new TypeError('value parameter must be an object');
        const proxied = this._proxify(value);
        this._pointers.forEach((_, pointerName) => {
            this._addToPointer(
                pointerName,
                PointedMap._stringToVal(proxied, pointerName),
                proxied
            );
        });
        super.set(key, proxied);
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
    deletePointFor(property) {
        if (!property) throw new TypeError('property parameter is required');
        return this._pointers.delete(property);
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

        x[pointedIdProp] = x[pointedIdProp] || Util.generateUniqueKey();

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
     * @return {any|Array<any>}
     */
    static _stringToVal(obj, string) {
        return Util.recursiveProp(obj, string);
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
    _proxify(obj) {
        for (let prop in obj) {
            if (typeof obj[prop] === 'object') {
                const newprox = this._proxify(obj[prop]);
                newprox.__sourceObject__ = obj;
                obj[prop] = newprox;
            }
        }
        return new Proxy(obj, {
            set: (target, prop, value, receiver) => {
                target[prop] = value;
                if (
                    Array.from(this._pointers.keys()).find(i =>
                        i.includes(prop)
                    )
                ) {
                    this._update(this._getSourceObject(receiver));
                }
                return true;
            }
        });
    }

    /**
     * @private
     * @param {object} obj
     * @returns {object}
     */
    _getSourceObject(obj) {
        let a = obj;
        while (a.__sourceObject__) {
            a = a.__sourceObject__;
        }
        return a;
    }
}

module.exports = PointedMap;
