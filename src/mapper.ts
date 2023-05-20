import { IRuntimeMapper } from './interface';
import { ResolutionContext } from './resolution-context';
import { MapperConfiguration } from './mapper-configuration';
import { ArrayToObjectMappingPair, MappingPair } from './mapping-pair';

export class Mapper implements IRuntimeMapper {
    readonly defaultContext: ResolutionContext;

    constructor(private readonly configuration: MapperConfiguration) {
        this.defaultContext = new ResolutionContext(this);
    }

    map<TSource, TDestination>(pair: MappingPair<TSource, TDestination>, source: TSource,
                               destination?: Partial<TDestination>): TDestination;
    map<TSource, TDestination>(pair: MappingPair<TSource, TDestination>, sources: TSource[],
                               destination?: TDestination): TDestination[];
    map<TSource, TDestination>(pair: MappingPair<TSource, TDestination>, source: TSource | TSource[],
                               destination?: TDestination): TDestination[] | TDestination {
        const func = this.configuration.getMapperFunction(pair);

        if (pair instanceof ArrayToObjectMappingPair) {
            return this.mapArrayToObject(
                pair as ArrayToObjectMappingPair<TSource[], TDestination>,
                source as TSource[],
                destination
            );
        }

        return Array.isArray(source) ? source.map(s => func(s, destination!, this.defaultContext)) :
            func(source, destination!, this.defaultContext);
    }

    private mapArrayToObject<TSource, TDestination>(pair: MappingPair<TSource[], TDestination>, sources: TSource[],
                                                    destination?: TDestination): TDestination {
        const func = this.configuration.getMapperFunction(pair);

        return func(sources, destination!, this.defaultContext);
    }
}
