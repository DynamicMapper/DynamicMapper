import { Type } from './interface';

export function isType(v: any): v is Type<any> {
    return typeof v === 'function';
}

export function isSymbol(v: any): v is symbol {
    return typeof v === 'symbol' || typeof v === 'object' && Object.prototype.toString.call(v) === '[object Symbol]';
}

export class MappingPair<S, D> {
    constructor(
        public readonly source: Type<S> | symbol = Symbol(),
        public readonly destination: Type<D> | symbol = Symbol()
    ) {}

    toString() {
        return `[MappingPair<${this.source.toString()}, ${this.destination.toString()}>]`;
    }
}

export class ArrayToObjectMappingPair<S extends Array<unknown>, D> extends MappingPair<S, D> {}
