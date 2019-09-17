import { IRuntimeMapper } from './interface';
import { MappingPair } from './mapping-pair';

export class ResolutionContext implements IRuntimeMapper {
    constructor(public readonly defaultContext: IRuntimeMapper) {}

    map<TSource, TDestination>(pair: MappingPair<TSource, TDestination>, source: TSource,
                               destination?: TDestination): TDestination;
    map<TSource, TDestination>(pair: MappingPair<TSource, TDestination>, sources: TSource[],
                               destination?: TDestination): TDestination[];
    map<TSource, TDestination>(pair: MappingPair<TSource, TDestination>, source: TSource[] | TSource,
                               destination?: TDestination): TDestination[] | TDestination {
        return this.defaultContext.map(pair, source, destination);
    }
}
