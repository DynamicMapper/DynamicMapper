import { IConfigurationProvider, MapperFunction } from './interface';
import { MappingPair } from './mapping-pair';
import { TypeMap } from './type-map';
import { ProfileMap } from './profile-map';
import { MapperConfigurationExpression } from './configuration/mapper-configuration-expression';
import { Mapper } from './mapper';

export class MapperConfiguration implements IConfigurationProvider {
    private readonly mapConfigs = [];
    private readonly typeMapRegistry = new Map<MappingPair<any, any>, TypeMap>();

    private readonly _profiles: ProfileMap[];

    constructor(configure: (expression: MapperConfigurationExpression) => any) {
        const expression = new MapperConfigurationExpression();
        configure(expression);

        const config = new ProfileMap(expression);
        this._profiles = [config].concat(expression.profiles.map(p => new ProfileMap(p, expression)));

        this.seal();
    }

    createMapper() {
        return new Mapper(this);
    }

    registerTypeMap(typeMap: TypeMap) {
        this.typeMapRegistry.set(typeMap.types, typeMap);
    }

    findTypeMapFor(pair: MappingPair<any, any>): TypeMap | undefined {
        return this.typeMapRegistry.get(pair);
    }

    getIncludedTypeMaps(includedTypes: MappingPair<any, any>[]): ReadonlyArray<TypeMap> {
        return includedTypes.map(pair => {
            const typeMap = this.findTypeMapFor(pair);

            if (typeMap) {
                return typeMap;
            }

            throw new Error('Undefined mapping pair');
        });
    }

    getMapperFunction<TSource, TDestination>(pair: MappingPair<TSource, TDestination>):
        MapperFunction<TSource, TDestination> {
        const mapper = this.typeMapRegistry.get(pair);

        if (!mapper) {
            throw new Error('Unable to locate mapper for provided pair');
        }

        return mapper.mapFunction;
    }

    private seal(): void {
        for (const profile of this._profiles) {
            profile.register(this);
        }

        // TODO: IncludeAllDerivedTypes

        for (const profile of this._profiles) {
            profile.configure(this);
        }

        this.typeMapRegistry.forEach(typeMap => typeMap.seal(this));
    }

    getAllTypeMaps(): ReadonlyArray<TypeMap> {
        return Array.from(this.typeMapRegistry.values());
    }
}
