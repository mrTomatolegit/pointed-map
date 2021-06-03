export = PointedMap;
declare class PointedMap extends Map {
    constructor(entries?: any[], pointTo?: Array<string>);
    getOneBy(property: string, value: any): object;
    filterBy(property: string, value: any): PointedMap<any, object>;
    getBy(property: string, value: any): Array<object>;

    get(key: any): object;
    set(key: any, value: object): this;
    delete(key: any): boolean;

    addPointerFor(property: string): this;
    deletePointerFor(property: string): boolean;

    find(
        fn: (value: object, key: any, pointedmap: PointedMap) => boolean,
        thisArg: any | null
    ): object | undefined;
    findKey(
        fn: (value: object, key: any, pointedmap: PointedMap) => boolean,
        thisArg: any | null
    ): object | undefined;
    filter(
        fn: (value: object, key: any, pointedmap: PointedMap) => boolean,
        thisArg: any | null
    ): PointedMap;
    first(amount: number | null): object | Array<object>;
    firstKey(amount: number | null): object | Array<object>;
    last(amount: number | null): object | Array<object>;
    lastKey(amount: number | null): object | Array<object>;
}
