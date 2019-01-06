import { Document } from '../base/document/Document';
import { Field } from './Field';
import { getModelConfig } from '../base/model/ModelConfiguration';
import { Model } from '../base/model/Model';
import { RefFieldError } from './errors/RefFieldError';

export interface RefConfig<T> {
    lazy: boolean;
    type?: Model<T>;
}

interface RefDecorator {
    ref(
        config: { lazy: true; lazyPromise: boolean } & RefConfig<any>
    ): <T extends object & { K?: Promise<Document<R>> }, K extends keyof T, R extends object>(
        target: T,
        propertyKey: K
    ) => void;
    ref(
        config: { lazy: false } & RefConfig<any>
    ): <T extends object & { K?: Document<R> }, K extends keyof T, R extends object>(
        target: T,
        propertyKey: K
    ) => void;
}

const refDecorators: RefDecorator = {
    ref: config => (target, propertyKey) => {
        const modelConfig = getModelConfig(target);
        let processedConfig = config;

        // tslint:disable no-string-literal
        if (global['Reflect'] && !processedConfig.type) {
            const designType = Reflect.getMetadata('design:type', target, propertyKey);
            if (designType) {
                processedConfig = { ...processedConfig, type: designType };
            }
        }

        if (!processedConfig.type) {
            throw new RefFieldError('Type for reference field ', target, propertyKey);
        }

        Field({ type: processedConfig.type })(target, propertyKey); // Apply field automatically
        modelConfig.addRef(propertyKey, processedConfig);
    }
};

export const Ref = refDecorators.ref;
