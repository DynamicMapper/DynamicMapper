import { Type } from './interface';

export function isType(v: any): v is Type<any> {
    return typeof v === 'function';
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
