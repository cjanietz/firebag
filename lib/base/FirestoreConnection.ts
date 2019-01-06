import { firestore } from 'firebase-admin';
import { Constructor } from '../@types/Constructor';
import { ModelBase } from './model/ModelBase';

export const FirestoreConnectionRef = Symbol.for('connection');

export class FirestoreConnection {
    public static fromFirestore(store: firestore.Firestore) {
        const instance = new FirestoreConnection();
        instance._store = store;
        return instance;
    }

    private _store: firestore.Firestore;

    public get store() {
        return this._store;
    }

    private constructor() {}

    public model<T extends ModelBase<T>, K extends Constructor<ModelBase<T>>>(modelBase: K): K {
        // tslint:disable no-this-assignment
        const self = this;
        // @ts-ignore
        // tslint:disable max-classes-per-file
        const resClazz = class extends modelBase {
            constructor(...args) {
                super(...args);
                this[FirestoreConnectionRef] = self;
            }
        };
        resClazz[FirestoreConnectionRef] = self;

        // We will emulate the original class name here
        const source = resClazz.prototype.constructor;
        resClazz.prototype.constructor = new Proxy(source, {
            get(target, name) {
                if (name === 'name') {
                    return modelBase.prototype.constructor.name;
                }
                return source[name];
            }
        });

        return (resClazz as any) as K;
    }
}
