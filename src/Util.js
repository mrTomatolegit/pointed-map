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
}

module.exports = Util;
