import { FieldConfig } from '../../decorators/Field';
import { ModelBase } from './ModelBase';
import { Constructor } from '../../@types/Constructor';
import { RefConfig } from '../../decorators/Ref';
import * as camelcase from 'camelcase';
import { classToPlain, plainToClass } from 'class-transformer';

export const ModelConfigurationRef = Symbol.for('ModelConfigurationRef');

export interface ModelFieldConfig<T> {
    name: string;
    fieldConfig: FieldConfig;
    refConfig?: RefConfig<T>;
    serialize?: (obj: T) => any;
    deserialize?: (obj: T) => any;
}

export interface ModelBaseConfig {
    collectionName?: string;
}

export class ModelConfiguration<T extends ModelBase<T>> {
    private _clazz: Constructor<ModelBase<T>>;
    private _baseConfig: ModelBaseConfig = {};
    private _fields: Array<ModelFieldConfig<T>> = [];

    constructor(clazz: Constructor<ModelBase<T>>) {
        this._clazz = clazz;
    }

    public addField(name: string, fieldConfig: FieldConfig) {
        let modelFieldConfig: ModelFieldConfig<T> = {
            name,
            fieldConfig
        };
        const isBaseValue =
            fieldConfig.type === String ||
            fieldConfig.type === Number ||
            fieldConfig.type === Boolean ||
            fieldConfig.type === Object;
        if (!isBaseValue) {
            modelFieldConfig = {
                ...modelFieldConfig,
                serialize: classToPlain,
                deserialize: plainToClass.bind(null, fieldConfig.type)
            };
        }
        this._fields = [...this._fields, modelFieldConfig];
    }

    public addRef(name: string, refConfig: RefConfig<T>) {
        const field = this._fields.find(f => f.name === name);
        if (field) {
            field.refConfig = refConfig;
        }
    }

    public getCollectionName() {
        return this._baseConfig.collectionName || camelcase(this._clazz.constructor.name);
    }

    public getFields() {
        return this._fields;
    }
}

export function getModelConfig<T extends ModelBase<T>>(target: Constructor<ModelBase<T>>) {
    let modelConfig: ModelConfiguration<T> = target[ModelConfigurationRef];
    if (!modelConfig) {
        modelConfig = new ModelConfiguration(target as any);
        target[ModelConfigurationRef] = modelConfig;
    }
    return modelConfig;
}
