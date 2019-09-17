import {
    IProfileExpression,
    ITypeMapConfiguration,
    MappingFunction,
    ValueTransformer
} from '../interface';
import { MappingPair } from '../mapping-pair';
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
        memberOptions: (expression: MemberConfigurationExpression<TSource, TDestination, TDestination[Member]>) => void,
        auto?: boolean
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

    /**
     * Enables auto mapping of source members directly to destination.
     */
    withAutoMapping(): this;
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
