import { ArrayToObjectMappingPair, MappingPair } from './mapping-pair';
import { TypeMap } from './type-map';
import { ResolutionContext } from './resolution-context';
import { IAutoMappingExpression, IMappingExpression } from './configuration/interface';

export type Type<T> = new (...args: any[]) => T;

export type NormalizeIntersection<T> = {
    [K in keyof T]: T[K];
};

export type MethodKeys<T> = {
    [K in keyof T]: T[K] extends (...arg: any) => any ? K : never;
}[keyof T];

type MappableKeys<T> = Omit<T, Extract<keyof T, MethodKeys<T>>>;

/**
 * Picks keys contained in both A and B and whose values have same type.
 */
export type AutoMappingKeys<A, B> = {
    [K in keyof A & keyof B]: NonNullable<A[K]> extends NonNullable<B[K]> ? K : never;
}[keyof A & keyof B];

/**
 * Base member configuration object.
 */
export type BaseOptionsConfiguration<TSource, TDestination, T> = {
    [K in keyof T]: (opt: IMemberConfigurationExpression<TSource, TDestination, T[K]>) => void;
};

/**
 * Auto mapping member configuration object.
 */
export type AutoMappingOptionsConfiguration<TSource, TDestination, T> = {
    [K in keyof T]: (opt: IAutoMemberConfigurationExpression<TSource, TDestination, T[K]>) => void;
};

/**
 * Picks properties of same key and type from source and destination types.
 */
export type AutoMappableProperties<TSource, TDestination> =
    AutoMappingOptionsConfiguration<
        TSource, TDestination,
        MappableKeys<Pick<TDestination, Extract<keyof TDestination, AutoMappingKeys<TSource, TDestination>>>>>;

/**
 * Picks properties that are not auto mappable.
 */
export type ExplicitProperties<TSource, TDestination> =
    BaseOptionsConfiguration<
        TSource, TDestination,
        MappableKeys<Pick<TDestination, Exclude<keyof TDestination, AutoMappingKeys<TSource, TDestination>>>>>;

/**
 * Destination member mapping configuration.
 */
export type MappingMembers<TSource, TDestination> =
    AutoMappableProperties<TSource, TDestination> & ExplicitProperties<TSource, TDestination>;

/**
 * Object key type.
 */
export type MemberInfo = string | number | symbol;

/**
 * Function that takes source and destination object and returns boolean.
 */
export type ConditionExpression<TSource = any, TDestination = any> = (source: TSource, destination: TDestination)
    => boolean;

export type ValueTransformer<TValue = any> = (value: TValue) => TValue;

export type MappingFunction<TSource = any, TDestination = any> = (source: TSource) => TDestination;

export type MapperFunction<TSource = any, TDestination = any, TResult = TDestination> = (
    source: TSource,
    destination: TDestination,
    context: ResolutionContext) => TResult;

export interface IMemberMap {
    condition: ConditionExpression;
    precondition: ConditionExpression;
    customMappingFunction: MappingFunction;
    valueTransformers: ReadonlyArray<ValueTransformer<any>>;
    sourceMembers: ReadonlyArray<MemberInfo>;
    destinationMember: MemberInfo;
    nullSubstitute: any;
    pair: MappingPair<any, any> | undefined;
}

export interface ITypeMapConfiguration {
    sourceType: any;
    destinationType: any;
    types: MappingPair<any, any>;
    configure(typeMap: TypeMap): void;
}

export interface IPropertyMapConfiguration {
    destinationMember: MemberInfo;
    configure(typeMap: TypeMap): void;
}

export interface IConfigurationProvider {
    /**
     * Gets all configured type maps.
     */
    getAllTypeMaps(): ReadonlyArray<TypeMap>;

    /**
     * Registers new type map.
     */
    registerTypeMap(typeMap: TypeMap): void;

    /**
     * Finds type map for provided mapping pair.
     */
    findTypeMapFor(pair: MappingPair<any, any>): TypeMap | undefined;

    getIncludedTypeMaps(includedTypes: ReadonlySet<MappingPair<any, any>>): ReadonlyArray<TypeMap>;
}

export interface IMemberConfigurationExpression<TSource, TDestination, TMember> {
    /**
     * Maps destination member using a custom value resolver.
     */
    mapFrom(mappingFunction: (source: TSource) => TMember): this;

    /**
     * Maps destination member via explicit mapping pair. Used when mapping nested objects.
     */
    mapFromUsing<TSourceMember extends Array<any>>(
        mappingFunction: (source: TSource) => TSourceMember,
        pair: TMember extends Array<any>
            ? MappingPair<TSourceMember[0], TMember[0]>
            : ArrayToObjectMappingPair<TSourceMember, TMember>
    ): this;
    mapFromUsing<TSourceMember>(
        mappingFunction: (source: TSource) => TSourceMember,
        pair: MappingPair<TSourceMember, TMember>): this;

    /**
     * Apply a transformation function after any resolved destination member.
     */
    addTransform(transformer: ValueTransformer<TMember>): this;

    /**
     * Conditionally map this member.
     */
    condition(condition: ConditionExpression<TSource, TDestination>): this;

    /**
     * Conditionally map this member. Evaluated before value resolver.
     */
    preCondition(condition: ConditionExpression<TSource, TDestination>): this;

    /**
     * Substitute a custom value when the source member resolves as null or undefined.
     */
    nullSubstitute(nullSubstitute: ((src: TSource) => TMember) | TMember): this;

    /**
     * Ignore this member during mapping.
     */
    ignore(): void;
}

export interface IAutoMemberConfigurationExpression<TSource, TDestination, TMember>
    extends IMemberConfigurationExpression<TSource, TDestination, TMember> {
    /**
     * Enables auto mapping for this member.
     */
    auto(): this;
}

export interface ISourceMemberConfigurationExpression {
    /**
     * Ignore this member during auto mapping.
     */
    ignore(): void;
}

export interface IProfileExpression {
    /**
     * Value transformers applied on each mapping member.
     */
    valueTransformers: ValueTransformer[];

    /**
     * Creates an auto mapping configuration for provided mapping pair.
     */
    createAutoMap<TSource, TDestination>(
        pair: MappingPair<TSource, TDestination>,
        members: Partial<AutoMappableProperties<TSource, TDestination>> &
                 Required<ExplicitProperties<TSource, TDestination>>): IAutoMappingExpression<TSource, TDestination>;

    /**
     * Creates a mapping configuration for provided mapping pair.
     */
    createMap<TSource, TDestination>(
        pair: MappingPair<TSource, TDestination>,
        config?: Partial<MappingMembers<TSource, TDestination>>): IMappingExpression<TSource, TDestination>;

    /**
     * Creates a strict mapping configuration for provided mapping pair that requires
     * configuration for each destination member.
     */
    createStrictMap<TSource, TDestination>(
        pair: MappingPair<TSource, TDestination>,
        config: Required<MappingMembers<TSource, TDestination>>,
        allMemberConfig?: (opt: IMemberConfigurationExpression<TSource, TDestination, any>) => void
    ): IMappingExpression<TSource, TDestination>;
}

export interface IMapper {
    /**
     * Executes mapping from the source object to a new or existing destination object.
     */
    map<TSource, TDestination>(pair: MappingPair<TSource, TDestination>, source: TSource,
                               destination?: TDestination): TDestination;

    /**
     * Executes mapping from the array of source objects to a new or existing destination objects.
     */
    map<TSource, TDestination>(pair: MappingPair<TSource, TDestination>, sources: TSource[],
                               destination?: TDestination): TDestination[];

    map<TSource, TDestination>(pair: MappingPair<TSource, TDestination>, source: TSource | TSource[],
                               destination?: TDestination): TDestination[] | TDestination;
}

export interface IRuntimeMapper extends IMapper {
    defaultContext: ResolutionContext;
}
