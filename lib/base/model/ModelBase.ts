import intersection = require('lodash.intersection');
import groupBy = require('lodash.groupby');

import { ModelConstructor, NonFunctionProperties } from './Model';
import { Document, SaveOptions } from '../document/Document';
import { ValidationError } from '../validation/ValidationError';
import { ModelConfiguration, ModelConfigurationRef, ModelFieldConfig } from './ModelConfiguration';
import { validateClassValidator } from '../validation/validateClassValidator';
import { FirestoreConnection, FirestoreConnectionRef } from '../FirestoreConnection';
import { Omit } from '../../@types/Omit';

const IS_NEW_FLAG = Symbol.for('isNew');
const DOC_REF = Symbol.for('docRef');

interface InternalSaveOptions extends SaveOptions {}

async function validateRefFields(instance: ModelBase<any>, valid: any[]) {
    const validationErrors = (await Promise.all(valid.map(f => instance.validate()))).filter(
        err => err != null
    );
    if (validationErrors.length > 0) {
        throw new ValidationError('');
    }
}

@ModelConstructor
export class ModelBase<T extends ModelBase<T>> implements Document<T> {
    protected get _collection() {
        const connection: FirestoreConnection = this[FirestoreConnectionRef];
        const store = connection.store;
        const modelConfiguration: ModelConfiguration<T> = this[ModelConfigurationRef];
        const collection = store.collection(modelConfiguration.getCollectionName());
        return collection;
    }

    private get _doc() {
        if (!this[DOC_REF]) {
            this[DOC_REF] = this._collection.doc();
        }
        return this[DOC_REF];
    }

    public get id() {
        return this._doc.id;
    }

    public static async get(id: string) {
        return null;
    }

    private [IS_NEW_FLAG]: boolean = true;
    private [DOC_REF];

    constructor(doc: Omit<NonFunctionProperties<T>, 'id'>) {
        const keys = Object.keys(doc);
        keys.forEach(k => (this[k] = doc[k]));
    }

    public clone(): Promise<T> {
        return undefined;
    }

    public delete(): Promise<void> {
        return undefined;
    }

    public async save(opts?: SaveOptions): Promise<T> {
        const { skipValidation = false } = (opts || {}) as InternalSaveOptions;
        if (!skipValidation) {
            const validationError = await this.validate();
            if (validationError) {
                throw validationError;
            }
        }

        const modelConfiguration: ModelConfiguration<T> = this[ModelConfigurationRef];
        const fields = modelConfiguration.getFields();

        if (this[IS_NEW_FLAG]) {
            let saveObj = {};
            const { refFields, regularFields } = groupBy(fields, (e: ModelFieldConfig<T>) => {
                if (e.refConfig) {
                    return 'refFields';
                } else {
                    return 'regularFields';
                }
            });

            // Type validation
            const { valid = [], invalid = [] } = groupBy(refFields, f =>
                this[f.name] && this[f.name] instanceof f.refConfig.type ? 'valid' : 'invalid'
            );

            // Error validation
            await validateRefFields(this, valid);

            // Save nested objects
            await Promise.all(
                valid.map(async f => {
                    try {
                        saveObj[f.name] = (await this[f.name].save({
                            ...opts,
                            skipValidation: true
                        })).id;
                    } catch (err) {
                        throw err;
                    }
                })
            );

            const keysToCopy = intersection(Object.keys(this), regularFields.map(f => f.name));
            const availableFields = regularFields.filter(f => keysToCopy.indexOf(f.name) >= 0);

            saveObj = availableFields.reduce((prev, { name, serialize }) => {
                prev[name] = serialize ? serialize(this[name]) : this[name];
                return prev;
            }, saveObj);

            await this._doc.create(saveObj);
        } else {
            // Compute differences
        }

        this[IS_NEW_FLAG] = false;
        // @ts-ignore
        return this;
    }

    public async validate(): Promise<ValidationError | null> {
        const classValidatorErrors = await validateClassValidator(this);
        if (classValidatorErrors.length > 0) {
            return new ValidationError('');
        }
        return null;
    }
}
