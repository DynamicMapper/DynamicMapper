import { SourceMemberConfig } from './configuration/source-member-config';
import {
    IConfigurationProvider,
    MapperFunction,
    MappingFunction,
    MemberInfo,
    Type,
    ValueTransformer
} from './interface';
import { PropertyMap } from './property-map';
import { MappingPair } from './mapping-pair';
import { TypeMapPlanBuilder } from './execution/type-map-plan-builder';
import { ProfileMap } from './profile-map';

interface ISubtypeMap {
    condition: (source: any) => boolean;
    pair: MappingPair<any, any>;
}

export class TypeMap {
    get propertyMaps(): ReadonlyMap<MemberInfo, PropertyMap> { return this._propertyMaps; }
    get subtypeMaps(): ReadonlyArray<ISubtypeMap> { return this._subtypeMaps; }
    get mapFunction(): MapperFunction<any, any> { return this._mapFunction; }
    get valueTransformers(): ReadonlyArray<ValueTransformer> { return this._valueTransformers; }
    get beforeMapFunctions(): ReadonlySet<MapperFunction> { return this._beforeMapFunctions; }
    get afterMapFunctions(): ReadonlySet<MapperFunction> { return this._afterMapFunctions; }
    get includedBaseTypes(): ReadonlySet<MappingPair<any, any>> { return this._includedBaseTypes; }
    get includedDerivedTypes(): ReadonlySet<MappingPair<any, any>> { return this._includedDerivedTypes; }
    get hasDerivedTypesToInclude(): boolean {
        return this._includedDerivedTypes.size > 0 || this.destinationTypeOverride != null;
    }
    get sourceMemberConfigs(): ReadonlyMap<MemberInfo, SourceMemberConfig> { return this._sourceMemberConfigs; }

    public customMapFunction: MappingFunction<any, any>;
    public customCtorFunction: MappingFunction<any, any>;

    public readonly sourceType: Type<any> | symbol = this.types.source;
    public readonly destinationType: Type<any> | symbol = this.types.destination;

    public destinationTypeOverride: any;
    public implicitAutoMapping: boolean;

    private readonly _propertyMaps = new Map<MemberInfo, PropertyMap>();
    private readonly _valueTransformers: ValueTransformer[] = [];
    private readonly _includedBaseTypes = new Set<MappingPair<any, any>>();
    private readonly _includedDerivedTypes = new Set<MappingPair<any, any>>();
    private readonly _inheritedTypeMaps = new Set<TypeMap>();
    private readonly _beforeMapFunctions = new Set<MapperFunction>();
    private readonly _afterMapFunctions = new Set<MapperFunction>();
    private readonly _sourceMemberConfigs = new Map<MemberInfo, SourceMemberConfig>();
    private readonly _subtypeMaps: ISubtypeMap[] = [];
    private _mapFunction: MapperFunction<any, any>;

    private sealed = false;

    constructor(public readonly types: MappingPair<any, any>, public readonly profile: ProfileMap) {}

    addValueTransformation(transformer: ValueTransformer): void {
        this._valueTransformers.push(transformer);
    }

    includeBasePair(basePair: MappingPair<any, any>): void {
        if (this.types === basePair) {
            throw new Error('You cannot include a type map into itself.');
        }

        this._includedBaseTypes.add(basePair);
    }

    includeDerivedPair(derivedPair: MappingPair<any, any>): void {
        if (this.types === derivedPair) {
            throw new Error('You cannot include a type map into itself.');
        }

        this._includedDerivedTypes.add(derivedPair);
    }

    addPolymorphicMap(condition: (source: any) => boolean, pair: MappingPair<any, any>): void {
        this._subtypeMaps.push({ condition, pair });
    }

    addInheritedMap(inheritedTypeMap: TypeMap): void {
        this._inheritedTypeMaps.add(inheritedTypeMap);
    }

    addBeforeMap(mapper: MapperFunction): void {
        this._beforeMapFunctions.add(mapper);
    }

    addAfterMap(mapper: MapperFunction): void {
        this._afterMapFunctions.add(mapper);
    }

    seal(configurationProvider: IConfigurationProvider): void {
        if (this.sealed) {
            return;
        }

        this.sealed = true;

        this._inheritedTypeMaps.forEach(inheritedTypeMap => this.applyInheritedTypeMap(inheritedTypeMap));

        this._mapFunction = new TypeMapPlanBuilder(configurationProvider, this).createMapper();
    }

    findOrCreatePropertyMapFor(destinationProperty: MemberInfo): PropertyMap {
        let propertyMap = this._propertyMaps.get(destinationProperty);

        if (propertyMap) {
            return propertyMap;
        }

        propertyMap = new PropertyMap(destinationProperty);

        this.insertPropertyMap(propertyMap);

        return propertyMap;
    }

    findOrCreateSourceMemberConfigFor(sourceMember: MemberInfo): SourceMemberConfig {
        let config = this._sourceMemberConfigs.get(sourceMember);

        if (config) {
            return config;
        }

        config = new SourceMemberConfig(sourceMember);
        this._sourceMemberConfigs.set(sourceMember, config);
        return config;
    }

    private insertPropertyMap(propertyMap: PropertyMap): void {
        this._propertyMaps.set(propertyMap.destinationMember, propertyMap);
    }

    private applyInheritedTypeMap(inheritedTypeMap: TypeMap): void {
        inheritedTypeMap.propertyMaps.forEach(inheritedMappedProperty => {
            if (inheritedMappedProperty.isMapped) {
                const conventionPropertyMap = this._propertyMaps.get(inheritedMappedProperty.destinationMember);

                if (conventionPropertyMap) {
                    conventionPropertyMap.applyInheritedPropertyMap(inheritedMappedProperty);
                } else {
                    this.insertPropertyMap(new PropertyMap(
                        inheritedMappedProperty.destinationMember, this, inheritedMappedProperty));
                }
            }
        });

        inheritedTypeMap._beforeMapFunctions.forEach(fn => this._beforeMapFunctions.add(fn));
        inheritedTypeMap._afterMapFunctions.forEach(fn => this._afterMapFunctions.add(fn));
        this._valueTransformers.unshift(...inheritedTypeMap.valueTransformers);

        // apply inherited source member configs
        inheritedTypeMap._sourceMemberConfigs.forEach(inheritedSourceMemberConfig => {
            if (inheritedSourceMemberConfig.isIgnored()) {
                const sourceMember = this._sourceMemberConfigs.get(inheritedSourceMemberConfig.sourceMember);

                if (sourceMember) {
                    sourceMember.ignore();
                } else {
                    this._sourceMemberConfigs.set(
                        inheritedSourceMemberConfig.sourceMember, inheritedSourceMemberConfig);
                }
            }
        });
    }
}
