import { Omit } from '../../@types/Omit';

// tslint:disable ban-types
type NonFunctionPropertyNames<T> = { [K in keyof T]: T[K] extends Function ? never : K }[keyof T];
export type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

export interface Model<T> {
    new (doc: Omit<NonFunctionProperties<T>, 'id'>);
    get(id: string): Promise<T>;
}

export const ModelConstructor = <T>(constructor: Model<T>) => null;
