let INCREMENT = 0;

class Util {
    constructor() {}

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

    static generateUniqueKey(timestamp = Date.now()) {
        if (timestamp instanceof Date) timestamp = timestamp.getTime();

        if (INCREMENT >= 4095) INCREMENT = 0;
        const concatenated = timestamp.toString(2).concat(INCREMENT++);
        return parseInt(concatenated, 2).toString(36);
    }

    static mapFind(map, fn) {
        for (const i of map) {
            const key = i[0];
            const value = i[1];
            const result = fn(value, key, map);
            if (result) {
                return result;
            }
        }
        return null;
    }

    static mapFilter(map, fn) {
        const array = [];
        for (const i of map) {
            const key = i[0];
            const value = i[1];
            const result = fn(value, key, map);
            if (result) {
                array.push(value);
            }
        }
        return array;
    }
}

module.exports = Util;
