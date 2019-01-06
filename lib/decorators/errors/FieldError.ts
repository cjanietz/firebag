import { Constructor } from '../../@types/Constructor';

export class FieldError extends Error {
    protected _target: Constructor<any>;
    protected _propertyKey: string;

    constructor(msg: string, target: Constructor<any>, propertyKey: string) {
        super(msg);
        this._target = target;
        this._propertyKey = propertyKey;
        this.message = `Error in field ${propertyKey} of ${target.constructor.name}`;
    }
}
