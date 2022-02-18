import { Change } from 'object-observer';

export = PointedMap;

type Pointer = Map<any, any[]>;

interface PointedMapConstructor {
    new(): PointedMap;
    readonly prototype: PointedMap;
}

declare class PointedMap extends Map<any, object> {
    constructor(entries?: any[], pointTo?: Array<string>);
    public set(key: any, value: object): this;
    public clear(): void;
    public delete(key: any): boolean;
    public getBy(pointerName: string, value: any): any[];
    public getOneBy(pointerName: string, value: any): any;
    public static mix<TBase>(extend: TBase): PointedMapConstructor & TBase;
    private pointers: { [index: string]: Pointer };
    private _handleChange(key: any, cs: Change[]): void;
    private _handleInsertChange(pointer: Pointer, obsValue: object, value: any): void;
    private _handleDeleteChange(key: any, pointer: Pointer, oldValue: any): void;
    private _handleUpdateChange(
        key: any,
        pointer: Pointer,
        obsValue: object,
        oldValue: any,
        value: any
    ): void;
    private _addPointer(pointTo: string): void;
    private _reset(): void;
    private static _addRegisteredKeyProp(obj: object, value: [] | null): void;
}
