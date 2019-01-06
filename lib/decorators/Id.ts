export enum IdGenerator {}

export interface IdConfig<T> {
    generator?: IdGenerator | ((doc: T) => string);
}

export const Id = <T>(config?: IdConfig<T>) => () => null;
