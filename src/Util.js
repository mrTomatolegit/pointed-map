let INCREMENT = 0;

class Util {
    constructor() {}

    /**
     *
     * @param {object} obj
     * @param {string} string
     * @param {number?} beforeLast
     * @returns {any}
     */
    static recursiveProp(obj, string, beforeLast = 0) {
        const subprops = string.split('.');
        let val = obj;
        for (let i = 0; i < subprops.length - beforeLast; i++) {
            if (!val) return;

            if (val instanceof Map) {
                val = Array.from(val.values());
            }

            if (Array.isArray(val)) {
                val = val.map(x => x[subprops[i]]);
            } else {
                val = val[subprops[i]];
            }
        }
        return val;
    }

    /**
     *
     * @param {string?} timestamp
     * @returns {string}
     */
    static generateUniqueKey(timestamp = Date.now()) {
        if (timestamp instanceof Date) timestamp = timestamp.getTime();

        if (INCREMENT >= 4095) INCREMENT = 0;
        const concatenated = timestamp.toString(2).concat(INCREMENT++);
        return parseInt(concatenated, 2).toString(36);
    }

    /**
     *
     * @param {Map} map
     * @param {(value: string, key: any, map: Map) => boolean} fn
     * @returns
     */
    static mapFilter(map, fn) {
        let arr = [];
        map.forEach((v, k, map) => {
            if (fn(v, k, map)) arr.push();
        });
        return arr;
    }

    /**
     *
     * @param {"undefined"|"bigint"|"boolean"|"function"|"number"|"string"|"symbol"|"object"|"null"|"array"} type
     * @param {any} value
     */
    static isSameType(type, value) {
        let isSame = typeof value === type;
        if (Array.isArray(value)) isSame = type === 'array';
        if (value === null) isSame = type === 'null';
        return isSame;
    }

    /**
     *
     * @param {string} valueName
     * @param {"undefined"|"bigint"|"boolean"|"function"|"number"|"string"|"symbol"|"object"|"null"|"array"} expectedType
     * @param {any} received
     */
    static createInvalidTypeError(valueName, expectedType, received, deleteStack=3) {
        let passedIn = typeof received;
        if (Array.isArray(received)) passedIn = 'array';
        if (received === null) passedIn = null;
        return Util.createTypeError(
            `${valueName} must be type of ${expectedType}, passed in ${passedIn}`,
            deleteStack
        );
    }

    /**
     *
     * @param {string} valueName
     * @param {"undefined"|"bigint"|"boolean"|"function"|"number"|"string"|"symbol"|"object"|"null"|"array"} expectedType
     * @param {any} received
     */
    static createTypeError(message, deleteStack = 3) {
        const typeError = new TypeError(message);
        if (typeError.stack) {
            const lines = typeError.stack.split('\n');
            lines.splice(1, deleteStack);
            typeError.stack = lines.join('\n');
        }
        return typeError;
    }
}

module.exports = Util;
