import { ModelBase } from '../../base/model/ModelBase';

export enum PreEventType {
    SAVE = 'SAVE'
}

export interface PreDecorators {
    pre: <K>(
        type: PreEventType,
        func: (doc: K) => Promise<K>
    ) => <T extends ModelBase<T>>(clazz: ModelBase<T>) => void;
}

const preDecorators: PreDecorators = {
    pre: () => clazz => null
};

export const Pre = preDecorators.pre;
