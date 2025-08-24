export declare const toReferencePath: unique symbol;
export declare function setReferencePath<T>(obj: T, value: string): void;
export declare function extractReferencePath(reference: any): string | null;
export declare function isFunctionHandle(s: string): boolean;
export declare function getFunctionAddress(functionReference: any): {
    functionHandle: string;
    name?: undefined;
    reference?: undefined;
} | {
    name: any;
    functionHandle?: undefined;
    reference?: undefined;
} | {
    reference: string;
    functionHandle?: undefined;
    name?: undefined;
};
//# sourceMappingURL=paths.d.ts.map