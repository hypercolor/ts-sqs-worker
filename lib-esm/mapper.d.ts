declare type IMappedClass<T> = new (...args: Array<any>) => T;
export declare class Mapper {
    static map<T>(json: any, clazz: IMappedClass<T>): Promise<T>;
}
export {};
