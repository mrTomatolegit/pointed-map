class Util extends null {
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
                val = val.map(x => (x ? x[subprops[i]] : undefined));
            } else if (this.isSameType('object', val)) {
                val = val[subprops[i]];
            }
        }
        return val;
    }

    /**
     *
     * @param {object} obj
     * @param {string} string
     * @returns {any}
     */
    static recursiveExistsIn(obj, string) {
        const subkeys = string.split('.');
        for (let i = 0; i < subkeys.length; i++) {
            const key = subkeys[i];
            const subval = obj[key];

            if (this.isSameType('array', subval)) {
                return subval.map(x => this.recursiveExistsIn(x, subkeys.slice(i + 1).join('.')));
            } else if (this.isSameType('object', subval)) {
                return this.recursiveExistsIn(subval, subkeys.slice(i + 1).join('.'));
            } else if (subkeys.length === 1) {
                if (subkeys[0].length == 0) return true;

                if (this.isSameType('object', obj)) return subkeys[0] in obj;

                if (this.isSameType('array', obj))
                    return obj.map(x => this.recursiveExistsIn(x, subkeys.slice(i + 1).join('.')));

                return false;
            } else return false;
        }
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
}

module.exports = Util;
