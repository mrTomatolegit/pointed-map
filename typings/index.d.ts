export = PointedMap;
/**
 *
 * @class
 * @type {PointedMap}
 * @extends {Map}
 */
declare class PointedMap {
    /**
     *
     * @type {new<K, V>(entries: Array<Array<K, V>>)}
     * @param {Array<Array<K, V>>}
     * @param {Array<string>} pointTo
     */
    constructor(entries?: any[], pointTo?: Array<string>);
    /**
     *
     * @param {string} property
     * @param {any} value
     * @return {any}
     */
    getOneBy(property: string, value: any): any;
    /**
     *
     * @param {string} property
     * @param {any} value
     * @return {PointedMap<any, object>}
     */
    filterBy(property: string, value: any): PointedMap;
    /**
     *
     * @param {string} property
     * @param {any} value
     * @return {Array<any>}
     */
    getBy(property: string, value: any): Array<any>;
    /**
     *
     * @param {any} key
     * @param {object} value Must be an object
     * @return {this}
     */
    set(key: any, value: object): this;
    /**
     *
     * @param {any} key
     * @return {boolean}
     */
    delete(key: any): boolean;
    /**
     *
     * @param {string} property The property pointed to (pointer name)
     * @return {this}
     */
    addPointerFor(property: string): this;
    /**
     *
     * @param {string} property The property pointed to (pointer name)
     * @return {this}
     */
    deletePointerFor(property: string): this;
    /**
     *
     * @param {(value: object, key, pointedmap: PointedMap) => boolean} fn
     * @param {any?} thisArg
     * @returns {any|undefined}
     */
    find(
        fn: (value: object, key: any, pointedmap: PointedMap) => boolean,
        thisArg: any | null
    ): any | undefined;
    /**
     *
     * @param {(value: object, key, pointedmap: PointedMap) => boolean} fn
     * @param {any?} thisArg
     * @returns {any|undefined}
     */
    findKey(
        fn: (value: object, key: any, pointedmap: PointedMap) => boolean,
        thisArg: any | null
    ): any | undefined;
    /**
     *
     * @param {(value: object, key, pointedmap: PointedMap) => boolean} fn
     * @param {any?} thisArg
     * @returns {PointedMap}
     */
    filter(
        fn: (value: object, key: any, pointedmap: PointedMap) => boolean,
        thisArg: any | null
    ): PointedMap;
    /**
     *
     * @param {number?} amount
     * @returns {object|Array<object>}
     */
    first(amount: number | null): object | Array<object>;
    /**
     *
     * @param {number?} amount
     * @returns {object|Array<object>}
     */
    firstKey(amount: number | null): object | Array<object>;
    /**
     *
     * @param {number?} amount
     * @returns {object|Array<object>}
     */
    last(amount: number | null): object | Array<object>;
    /**
     *
     * @param {number?} amount
     * @returns {object|Array<object>}
     */
    lastKey(amount: number | null): object | Array<object>;
}
