import {
    getModelConfig,
    ModelConfiguration,
    ModelConfigurationRef
} from '../base/model/ModelConfiguration';
import { FieldError } from './errors/FieldError';

export interface FieldConfig {
    name?: string;
    type?: any;
}

export interface FieldDecorator {
    field(config?: FieldConfig): PropertyDecorator;
}

const fieldDecorators: FieldDecorator = {
    field: config => (target, propertyKey) => {
        const modelConfig = getModelConfig(target as any);
        let processedConfig = config || {};

        // tslint:disable no-string-literal
        if (global['Reflect'] && !processedConfig.type) {
            const designType = Reflect.getMetadata('design:type', target, propertyKey);
            if (designType) {
                if (designType === Array) {
                    throw new FieldError(
                        'Array types must be provided in the field config',
                        target as any,
                        propertyKey as string
                    );
                }
                processedConfig = { ...processedConfig, type: designType };
            }
        }

        modelConfig.addField(propertyKey as string, processedConfig);
    }
};

export const Field = fieldDecorators.field;
