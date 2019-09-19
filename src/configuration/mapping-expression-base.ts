import {
    IPropertyMapConfiguration,
    ITypeMapConfiguration,
    MappingFunction,
    Type,
    ValueTransformer
} from '../interface';
import { IMappingExpression, IMappingExpressionBase, ISourceMemberConfiguration } from './interface';
import { isType, MappingPair } from '../mapping-pair';
import { TypeMap } from '../type-map';
import { MemberConfigurationExpression } from './member-configuration-expression';

export abstract class MappingExpressionBase<TSource, TDestination> implements
        ITypeMapConfiguration, IMappingExpression<TSource, TDestination>,
        IMappingExpressionBase<TSource, TDestination> {
    readonly sourceType: Type<TSource> | null = isType(this.types.source) ? this.types.source : null;
    readonly destinationType: Type<TDestination> | null =
        isType(this.types.destination) ? this.types.destination : null;

    readonly valueTransformers: ValueTransformer[] = [];

    protected readonly memberConfigurations: IPropertyMapConfiguration[] = [];
    protected readonly sourceMemberConfigurations: ISourceMemberConfiguration[] = [];
    protected readonly typeMapActions: ((tm: TypeMap) => void)[] = [];

    constructor(
        public readonly types: MappingPair<TSource, TDestination>
    ) {}

    configure(typeMap: TypeMap): void {
        for (const action of this.typeMapActions) {
            action(typeMap);
        }

        for (const memberConfig of this.memberConfigurations) {
            memberConfig.configure(typeMap);
        }

        for (const memberConfig of this.sourceMemberConfigurations) {
            memberConfig.configure(typeMap);
        }

        for (const valueTransformer of this.valueTransformers) {
            typeMap.addValueTransformation(valueTransformer);
        }
    }

    abstract forMember<Member extends keyof TDestination>(
        destinationMember: Member,
        memberOptions: (expression: MemberConfigurationExpression<TSource, TDestination, TDestination[Member]>) => void,
        auto?: boolean
    ): this;

    addTransform<TValue>(transformer: (value: TValue) => TValue): this {
        this.valueTransformers.push(transformer);
        return this;
    }

    convertUsing(mappingFunction: MappingFunction<TSource, TDestination>): void {
        this.typeMapActions.push(tm => tm.customMapFunction = mappingFunction);
    }

    constructUsing(mappingFunction: MappingFunction<TSource, Partial<TDestination>>): this {
        this.typeMapActions.push(tm => tm.customCtorFunction = mappingFunction);

        return this;
    }

    includeBase(pair: MappingPair<any, any>): this {
        // TODO: check is derived
        this.typeMapActions.push(tm => tm.includeBasePair(pair));
        return this;
    }

    include<TDerivedSource extends TSource, TDerivedDestination extends TDestination>(
        pair: MappingPair<TDerivedSource, TDerivedDestination>): this {
        this.typeMapActions.push(tm => tm.includeDerivedPair(pair));
        return this;
    }

    mapSubtype(pair: MappingPair<TSource, TDestination>, discriminatorCondition: (source: TSource) => boolean): this {
        this.typeMapActions.push(tm => tm.addPolymorphicMap(discriminatorCondition, pair));
        this.include(pair);
        return this;
    }
}
