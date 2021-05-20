let INCREMENT = 0;

class Util {
    constructor() {}

    static recursiveProp(obj, string) {
        const fnReg = new RegExp(/\((.+)?\)$/);
        const subprops = string.split('.');
        let val = obj[subprops[0]];
        for (let i = 1; i < subprops.length; i++) {
            if (!val) return;
            let isFn = false;
            if (fnReg.test(subprops[i])) {
                isFn = true;
                subprops[i] = subprops[i].replace(fnReg, '');
            }

            if (val instanceof Map) {
                val = Array.from(val.values());
            }

            if (Array.isArray(val)) {
                val = val.map(x => (isFn ? x[subprops[i]]() : x[subprops[i]]));
            } else {
                val = isFn ? val[subprops[i]]() : val[subprops[i]];
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
        const newMap = new Map();
        for (const i of map) {
            const key = i[0];
            const value = i[1];
            const result = fn(value, key, map);
            if (result) {
                newMap.set(key, value);
            }
        }
        return newMap;
    }
}

module.exports = Util;
