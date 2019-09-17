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

export class TypeMap {
    get propertyMaps(): ReadonlyMap<MemberInfo, PropertyMap> { return this._propertyMaps; }
    get mapFunction(): MapperFunction<any, any> { return this._mapFunction; }
    get valueTransformers(): ReadonlyArray<ValueTransformer> { return this._valueTransformers; }
    get includedBaseTypes(): ReadonlyArray<MappingPair<any, any>> { return this._includedBaseTypes; }
    get includedDerivedTypes(): ReadonlyArray<MappingPair<any, any>> { return this._includedDerivedTypes; }
    get hasDerivedTypesToInclude(): boolean {
        return this._includedDerivedTypes.length > 0 || this.destinationTypeOverride != null;
    }

    public customMapFunction: MappingFunction<any, any>;
    public customCtorFunction: MappingFunction<any, any>;

    public readonly sourceType: Type<any> | symbol = this.types.source;
    public readonly destinationType: Type<any> | symbol = this.types.destination;

    public destinationTypeOverride: any;
    public implicitAutoMapping: boolean;

    private readonly _propertyMaps = new Map<MemberInfo, PropertyMap>();
    private readonly _valueTransformers: ValueTransformer[] = [];
    private readonly _includedBaseTypes: MappingPair<any, any>[] = [];
    private readonly _includedDerivedTypes: MappingPair<any, any>[] = [];
    private readonly _inheritedTypeMaps: TypeMap[] = [];
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

        this._includedBaseTypes.push(basePair);
    }

    includeDerivedPair(derivedPair: MappingPair<any, any>): void {
        if (this.types === derivedPair) {
            throw new Error('You cannot include a type map into itself.');
        }

        this._includedDerivedTypes.push(derivedPair);
    }

    addInheritedMap(inheritedTypeMap: TypeMap): void {
        this._inheritedTypeMaps.push(inheritedTypeMap);
    }

    seal(configurationProvider: IConfigurationProvider): void {
        if (this.sealed) {
            return;
        }

        this.sealed = true;

        for (const inheritedTypeMap of this._inheritedTypeMaps) {
            this.applyInheritedTypeMap(inheritedTypeMap);
        }

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

        this._valueTransformers.unshift(...inheritedTypeMap.valueTransformers);
    }
}