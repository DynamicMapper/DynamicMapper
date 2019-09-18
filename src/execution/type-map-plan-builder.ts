import {
    IConfigurationProvider, IMemberMap,
    MapperFunction,
    MappingFunction,
    MemberInfo,
    Type,
    ValueTransformer
} from '../interface';
import { TypeMap } from '../type-map';
import { isType, MappingPair } from '../mapping-pair';
import { ResolutionContext } from '../resolution-context';

export class TypeMapPlanBuilder {

    constructor(
        private readonly configurationProvider: IConfigurationProvider,
        private readonly typeMap: TypeMap
    ) {}

    createMapper(): MapperFunction<any, any> {
        const customConverter = this.typeMap.customMapFunction;

        if (customConverter) {
            return customConverter;
        }

        const destinationFunc: MappingFunction = this.createDestinationFunc();
        const assignmentFunc = this.createAssignment();
        const transformerFunc = this.createTransformerFn([
            ...this.typeMap.valueTransformers,
            ...this.typeMap.profile.valueTransformers
        ]);

        return (source, destination, context) => {
            const dest = destination ? destination : destinationFunc(source);

            if (this.typeMap.implicitAutoMapping && source) {
                for (const key of Object.keys(source)) {
                    // auto map only those properties that are not ignored
                    if (!this.typeMap.propertyMaps.has(key) || this.typeMap.propertyMaps.get(key)!.canResolveValue) {
                        dest[key] = transformerFunc(source[key]);
                    }
                }
            }

            for (const fn of assignmentFunc) {
                fn(source, dest, context);
            }

            return dest;
        };
    }

    private createDestinationFunc(): MappingFunction {
        if (this.typeMap.customCtorFunction) {
            return this.typeMap.customCtorFunction;
        } else if (isType(this.typeMap.destinationType)) {
            return () => new (this.typeMap.destinationType as Type<any>)();
        } else if (typeof this.typeMap.destinationType === 'symbol') {
            return () => ({});
        }

        throw new Error('Unable to create destination type');
    }

    private createAssignment() {
        const assignmentFns: ((source: any, destination: any, context: ResolutionContext) => void)[] = [];

        this.typeMap.propertyMaps.forEach(propertyMap => {
            if (propertyMap.canResolveValue) {
                const property = this.tryPropertyMap(propertyMap, propertyMap.destinationMember);
                assignmentFns.push(property);
            }
        });

        return assignmentFns;
    }

    private tryPropertyMap(memberMap: IMemberMap, destinationMember: MemberInfo) {
        const setter = (destination: any, value: any) => destination[destinationMember] = value;
        const getter = (destination: any) => destination[destinationMember];

        const resolvers: MapperFunction[] = [this.buildValueResolver(memberMap)];

        if (memberMap.pair) {
            resolvers.push(this.mapFunction(memberMap.pair!, destinationMember));
        }

        const transformer = this.createTransformerFn([
            ...memberMap.valueTransformers,
            ...this.typeMap.valueTransformers,
            ...this.typeMap.profile.valueTransformers
        ]);

        const valueResolver = (source, destination, context) => {
            return [...resolvers, transformer].reduce((prev, curr) => curr(prev, destination, context), source);
        };

        return (source: any, destination: any, context: ResolutionContext) => {
            if (memberMap.precondition && !memberMap.precondition(source, destination)) {
                return;
            }

            const resolvedValue = valueResolver(source, destination, context);

            if (memberMap.condition && !memberMap.condition(source, destination)) {
                return;
            }

            setter(destination, resolvedValue);
        };
    }

    private createTransformerFn(transformers: ValueTransformer[]) {
        return source => transformers.reduce((prev, curr) => curr(prev), source);
    }

    private mapFunction(pair: MappingPair<any, any>, destinationMember: MemberInfo): MapperFunction {
        const typeMap = this.configurationProvider.findTypeMapFor(pair);

        if (typeMap) {
            if (!typeMap.hasDerivedTypesToInclude) {
                typeMap.seal(this.configurationProvider);

                return (source, destination, context: ResolutionContext) =>
                    typeMap.mapFunction(source, destination ? destination[destinationMember] : null, context);
            }

            return (source, destination, context: ResolutionContext) =>
                context.map(pair, source, destination ? destination[destinationMember] : null);
        }

        throw new Error(`Missing map for mapping pair ${pair.toString()}`);
    }

    private buildValueResolver(memberMap: IMemberMap/*, destValueGetter: LambdaExpression*/): MapperFunction {
        let resolver: MapperFunction;

        if (memberMap.customMappingFunction) {
            resolver = source => source == null ? null : memberMap.customMappingFunction(source);
        } else if (memberMap.sourceMembers.length) {
            // TODO: chain
            resolver = source => source == null ? null : source[memberMap.sourceMembers[0]];
        } else {
            throw new Error(`Unable to detect source member for destination member "${memberMap.destinationMember.toString()}"`);
        }

        if (memberMap.nullSubstitute != null) {
            const prevResolver = resolver;
            resolver = (source: any, destination: any, context: ResolutionContext) => {
                const value = prevResolver(source, destination, context);
                return value == null ? memberMap.nullSubstitute : value;
            };
        }

        return resolver;
    }
}
