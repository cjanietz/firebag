import { ValidationError } from '../validation/ValidationError';

export interface SaveOptions {
    skipValidation?: boolean;
}

export interface Document<T> {
    clone(): Promise<T>;
    delete(): Promise<void>;
    save(opts?: SaveOptions): Promise<T>;
    validate(): Promise<ValidationError | null>;
}
