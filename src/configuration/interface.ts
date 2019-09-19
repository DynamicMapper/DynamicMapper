import {
    IProfileExpression, ISourceMemberConfigurationExpression,
    ITypeMapConfiguration,
    MappingFunction,
    ValueTransformer
} from '../interface';
import { MappingPair } from '../mapping-pair';
import { TypeMap } from '../type-map';
import { MemberConfigurationExpression } from './member-configuration-expression';
import { Profile } from '../profile';

export interface IProfileConfiguration {
    typeMapConfigs: ITypeMapConfiguration[];
    valueTransformers: ValueTransformer[];
}

export interface IConfiguration extends IProfileConfiguration {
    profiles: ReadonlyArray<IProfileConfiguration>;
}

export interface IMappingExpressionBase<TSource, TDestination> {
    /**
     * Value transformers.
     */
    valueTransformers: ValueTransformer[];

    /**
     * Skips normal member mapping and performs conversion by provided mapping function.
     */
    convertUsing(mappingFunction: MappingFunction<TSource, TDestination>): void;

    /**
     * Instantiate destination from provided function.
     */
    constructUsing(mappingFunction: MappingFunction<TSource, Partial<TDestination>>): this;

    /**
     * Adds a subtype mapping that handles mapping if provided discriminator condition matches.
     */
    mapSubtype(pair: MappingPair<TSource, TDestination>, discriminatorCondition: (source: TSource) => boolean): this;
}

export interface IMappingExpression<TSource, TDestination> extends IMappingExpressionBase<TSource, TDestination> {
    /**
     * Apply a transformation function on resolved destination value.
     */
    addTransform(transformer: ValueTransformer): this;

    /**
     * Customize destination member.
     */
    forMember<Member extends keyof TDestination>(
        destinationMember: Member,
        memberOptions: (expression: MemberConfigurationExpression<TSource, TDestination, TDestination[Member]>) => void
    ): this;

    /**
     * Include the base mapping pair configuration into this map.
     */
    includeBase(pair: MappingPair<any, any>): this;

    /**
     * Include this configuration in derived mapping pair.
     */
    include<TDerivedSource extends TSource, TDerivedDestination extends TDestination>(
        pair: MappingPair<TDerivedSource, TDerivedDestination>): this;
}

export interface IAutoMappingExpression<TSource, TDestination> extends IMappingExpression<TSource, TDestination> {

    /**
     * Customize source member.
     */
    forSourceMember<Member extends keyof TSource>(
        sourceMember: Member, memberOptions: (expression: ISourceMemberConfigurationExpression) => void): this;
}

export interface IMapperConfigurationExpression {
    /**
     * Adds an existing mapping profile.
     */
    addProfile(profile: Profile): void;

    /**
     * Creates a name profile with provided configuration.
     */
    createProfile(profileName: string, config: (config: IProfileExpression) => void): void;
}

export interface ISourceMemberConfiguration {
    configure(typeMap: TypeMap): void;
}
