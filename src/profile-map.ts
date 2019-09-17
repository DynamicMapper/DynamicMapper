import { IConfigurationProvider, ITypeMapConfiguration, ValueTransformer } from './interface';
import { IConfiguration, IProfileConfiguration } from './configuration/interface';
import { TypeMap } from './type-map';

export class ProfileMap {
    readonly typeMapConfigs: ITypeMapConfiguration[];
    readonly valueTransformers: ValueTransformer[];

    constructor(profile: IProfileConfiguration, configuration?: IConfiguration) {
        this.typeMapConfigs = profile.typeMapConfigs;
        this.valueTransformers = profile.valueTransformers.concat(configuration ? configuration.valueTransformers : []);
    }

    register(configurationProvider: IConfigurationProvider): void {
        for (const config of this.typeMapConfigs) {
            this.buildTypeMap(configurationProvider, config);
        }
    }

    configure(configurationProvider: IConfigurationProvider): void {
        for (const typeMapConfig of this.typeMapConfigs) {
            const typeMap = configurationProvider.findTypeMapFor(typeMapConfig.types)!;
            this.configureTypeMap(typeMap, configurationProvider);
        }
    }

    private configureTypeMap(typeMap: TypeMap, configurationProvider: IConfigurationProvider): void {
        this.applyBaseMaps(typeMap, typeMap, configurationProvider);
        this.applyDerivedMaps(typeMap, typeMap, configurationProvider);
    }

    private buildTypeMap(configurationProvider: IConfigurationProvider, config: ITypeMapConfiguration): void {
        // TODO: factory
        const typeMap = new TypeMap(config.types, this);
        // config.types.members.forEach(member => typeMap.addPropertyMap(member));

        config.configure(typeMap);

        configurationProvider.registerTypeMap(typeMap);
    }

    private applyBaseMaps(derivedMap: TypeMap, currentMap: TypeMap, configurationProvider: IConfigurationProvider):
        void {
        for (const baseMap of configurationProvider.getIncludedTypeMaps(currentMap.includedBaseTypes)) {
            baseMap.includeDerivedPair(currentMap.types);
            derivedMap.addInheritedMap(baseMap);
            this.applyBaseMaps(derivedMap, baseMap, configurationProvider);
        }
    }

    private applyDerivedMaps(baseMap: TypeMap, typeMap: TypeMap, configurationProvider: IConfigurationProvider): void {
        for (const derivedMap of configurationProvider.getIncludedTypeMaps(typeMap.includedDerivedTypes)) {
            derivedMap.includeBasePair(typeMap.types);
            derivedMap.addInheritedMap(baseMap);
            this.applyDerivedMaps(baseMap, derivedMap, configurationProvider);
        }
    }
}
