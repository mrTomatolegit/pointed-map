const { Observable } = require('object-observer');
const Util = require('./Util');

const registeredKeys = Symbol.for('pointed-map-pair-key-meta-0');

const mix = Base =>
    class PointedMap extends Base {
        constructor(entries = [], pointers = []) {
            super(entries);

            /**
             * @private
             */
            this.pointers = {};

            if (!Util.isSameType('array', pointers)) pointers = [];

            pointers.forEach(p => this._addPointer(p));
        }

        /**
         * Adds a key-value pair to the map and pointers
         * @param {any} key
         * @param {object} value
         * @returns {PointedMap}
         */
        set(key, value) {
            if (!Util.isSameType('object', value))
                throw new Error(`Expected object, received ${typeof value}: ${value}`);
            this.delete(key);

            const obsValue = Observable.from(value);
            if (obsValue[registeredKeys]) obsValue[registeredKeys].push(key);
            else PointedMap._addRegisteredKeysProp(obsValue, [key]);

            for (let pointerName in this.pointers) {
                if (Util.recursiveExistsIn(obsValue, pointerName)) {
                    let y = Util.recursiveProp(obsValue, pointerName);
                    this._handleInsertChange(this.pointers[pointerName], obsValue, y);
                }
            }

            Observable.observe(obsValue, cs => this._handleChange(key, cs));
            return super.set(key, obsValue);
        }

        /**
         * Removes all key-value pairs from the map and pointers
         * @returns {void}
         */
        clear() {
            for (let pointerName in this.pointers) this.pointers[pointerName].clear();
            return super.clear();
        }

        /**
         * Removes a key-value pair from the map and pointers
         * @param {any} key
         * @returns {boolean}
         */
        delete(key) {
            const obsValue = this.get(key);
            if (obsValue) {
                Observable.unobserve(obsValue);
                obsValue[registeredKeys].splice(
                    obsValue[registeredKeys].findIndex(k => k === key),
                    1
                );
                for (let pointerName in this.pointers) {
                    let y = Util.recursiveProp(obsValue, pointerName);
                    this._handleDeleteChange(key, this.pointers[pointerName], y);
                }
            }

            return super.delete(key);
        }

        /**
         * Searches the pointers for objects that match the provided value.
         * If the pointer does not exist it will use the default `Array#filter()` method
         * @param {string} pointerName The name of the pointer to look into
         * @param {any} value The value to look up in the pointer
         * @returns {any[]} The values that corresponds to the provided value
         */
        getBy(pointerName, value) {
            const pointer = this.pointers[pointerName];
            if (pointer) {
                return pointer.get(value) || [];
            } else {
                console.warn(new Error(`Pointer not found: ${pointerName}`));
                return [...this.values()].filter(x => {
                    const found = Util.recursiveProp(x, pointerName);
                    if (Array.isArray(found)) return found.includes(value);
                    return found === value;
                });
            }
        }

        /**
         * Searches the pointers for an object that matches the provided value.
         * If the pointer does not exist it will use the default `Array#find()` method
         * @param {string} pointerName The name of the pointer to look into
         * @param {any} value The value to look up in the pointer
         * @returns {any | undefined} The value that corresponds to the provided value
         */
        getOneBy(pointerName, value) {
            const pointer = this.pointers[pointerName];
            if (pointer) {
                return pointer.has(value) ? pointer.get(value)[0] : undefined;
            } else {
                console.warn(new Error(`Pointer not found: ${pointerName}`));
                return [...this.values()].find(x => {
                    const found = Util.recursiveProp(x, pointerName);
                    if (Array.isArray(found)) return found.includes(value);
                    return found === value;
                });
            }
        }

        /**
         * Adds a property to an object that will be used to keep track of the keys
         * @private
         * @param {object} obj The object to add the property to
         * @param {[]?} value The optional value to set the property to (Defaults to an empty array)
         */
        static _addRegisteredKeysProp(obj, value = []) {
            Object.defineProperty(obj, registeredKeys, {
                enumerable: false,
                value
            });
        }

        /**
         * Handles a change in an observed object
         * @private
         * @param {any} key The key the observed object is registered under
         * @param {import('object-observer').Change[]} cs The change reported by object-observer module
         */
        _handleChange(key, cs) {
            cs.forEach(change => {
                const obsValue = this.get(key);

                let p = '';
                change.path.forEach(a => {
                    if (typeof a === 'number') return '';
                    if (p) p += '.';
                    return (p = p + a);
                });
                const pointer = this.pointers[p];
                if (pointer) {
                    if (change.type === 'update') {
                        this._handleUpdateChange(
                            key,
                            pointer,
                            obsValue,
                            change.oldValue,
                            change.value
                        );
                    } else if (change.type === 'insert') {
                        this._handleInsertChange(pointer, obsValue, change.value);
                    } else if (change.type === 'delete') {
                        this._handleDeleteChange(key, pointer, change.oldValue);
                    }
                }
            });
        }

        /**
         * Handles an `insert` change in an observed object
         * @private
         * @param {Map} pointer A pointer from `this.pointers`
         * @param {object} obsValue The observed object
         * @param {any} value
         */
        _handleInsertChange(pointer, obsValue, value) {
            if (Array.isArray(value))
                return value.forEach(v => this._handleInsertChange(pointer, obsValue, v));

            if (!pointer.has(value)) pointer.set(value, []);

            const newPointerArr = pointer.get(value);
            newPointerArr.push(obsValue);
        }

        /**
         * Handles a `delete` change in an observed object
         * @private
         * @param {any} key The key the observed object is registered under
         * @param {Map} pointer A pointer from `this.pointers`
         * @param {any} oldValue The old value of the property
         */
        _handleDeleteChange(key, pointer, oldValue) {
            if (Array.isArray(oldValue))
                return oldValue.forEach(v => this._handleDeleteChange(key, pointer, v));
            const oldPointerArr = pointer.get(oldValue);
            if (oldPointerArr) {
                oldPointerArr.splice(
                    oldPointerArr.findIndex(v => v[registeredKeys].includes(key)),
                    1
                );
                if (oldPointerArr.length === 0) pointer.delete(oldValue);
            }
        }

        /**
         * Handles an `update` change in an observed object
         * @private
         * @param {any} key The key the observed object is registered under
         * @param {Map} pointer A pointer from `this.pointers`
         * @param {object} obsValue The observed object
         * @param {any} oldValue The old value of the property
         * @param {any} value The new value of the property
         */
        _handleUpdateChange(key, pointer, obsValue, oldValue, value) {
            this._handleDeleteChange(key, pointer, oldValue);
            this._handleInsertChange(pointer, obsValue, value);
        }

        /**
         * Adds a pointer to the pointed-to object
         * @private
         * @param {string} pointTo
         */
        _addPointer(pointTo) {
            this.pointers[pointTo] = new Map();
            this._reset();
        }

        /**
         * Sets the all the entries again (for example after a change in the pointed-to object)
         * @private
         */
        _reset() {
            [...this.entries()].forEach(e => {
                const key = e[0];
                const value = e[1];
                this.set(key, value);
            });
        }
    };

const PointedMap = mix(Map);

module.exports = PointedMap;
module.exports.mix = mix;
