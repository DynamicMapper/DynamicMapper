import {
    AutoMappableProperties, ExplicitProperties,
    IProfileExpression,
    ITypeMapConfiguration,
    MappingMembers,
    ValueTransformer
} from './interface';
import { IMappingExpression, IProfileConfiguration } from './configuration/interface';
import { MappingPair } from './mapping-pair';
import { MappingExpression } from './configuration/mapping-expression';

export abstract class Profile implements IProfileExpression, IProfileConfiguration {
    readonly typeMapConfigs: ITypeMapConfiguration[] = [];

    readonly valueTransformers: ValueTransformer[] = [];

    public profileName: string;

    createAutoMap<TSource, TDestination>(
        pair: MappingPair<TSource, TDestination>,
        members: Partial<AutoMappableProperties<TSource, TDestination>> &
                 Required<ExplicitProperties<TSource, TDestination>>
    ): IMappingExpression<TSource, TDestination> {
        return this.createMappingExpresion(pair, members as Partial<MappingMembers<TSource, TDestination>>, true);
    }

    createMap<TSource, TDestination>(
        pair: MappingPair<TSource, TDestination>,
        config: Partial<MappingMembers<TSource, TDestination>> = {}
    ): IMappingExpression<TSource, TDestination> {
        return this.createMappingExpresion(pair, config);
    }

    private createMappingExpresion<TSource, TDestination>(
        pair: MappingPair<TSource, TDestination>,
        config: Partial<MappingMembers<TSource, TDestination>>,
        auto: boolean = false
    ): IMappingExpression<TSource, TDestination> {
        const map = new MappingExpression<TSource, TDestination>(pair);

        for (const member of Object.keys(config)) {
            map.forMember(member as keyof TDestination, config[member], auto);
        }

        if (auto) {
            map.withAutoMapping();
        }

        this.typeMapConfigs.push(map);

        return map;
    }
}
