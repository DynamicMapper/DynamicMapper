import { PropertyMap } from '../property-map';
import {
    ConditionExpression,
    IAutoMemberConfigurationExpression,
    IPropertyMapConfiguration,
    MemberInfo,
    ValueTransformer
} from '../interface';
import { TypeMap } from '../type-map';
import { MappingPair } from '../mapping-pair';

export class MemberConfigurationExpression<TSource, TDestination, TMember>
    implements IAutoMemberConfigurationExpression<TSource, TDestination, TMember>, IPropertyMapConfiguration {
    private sourceMember: (...args: any[]) => any;

    private readonly propertyMapActions: ((pm: PropertyMap) => void)[] = [];

    constructor(public readonly destinationMember: MemberInfo) {}

    configure(typeMap: TypeMap): void {
        const propertyMap = typeMap.findOrCreatePropertyMapFor(this.destinationMember);

        this.apply(propertyMap);
    }

    mapFrom(mappingFunction: (source: TSource) => TMember): this {
        this.sourceMember = mappingFunction;
        this.propertyMapActions.push(pm => pm.mapFrom(mappingFunction));
        return this;
    }

    mapFromUsing<TSourceMember>(
        mappingFunction: (source: TSource) => TSourceMember,
        pair: MappingPair<
            TSourceMember extends Array<any> ? TSourceMember[0] : TSourceMember,
            TMember extends Array<any> ? TMember[0] : TMember
        >): this {
        this.propertyMapActions.push(pm => pm.mapFromUsing(mappingFunction, pair));
        return this;
    }

    addTransform(transformer: ValueTransformer<TMember>): this {
        this.propertyMapActions.push(pm => pm.addValueTransformation(transformer));
        return this;
    }

    condition(condition: ConditionExpression<TSource, TDestination>): this {
        this.propertyMapActions.push(pm => pm.condition = condition);
        return this;
    }

    preCondition(condition: ConditionExpression<TSource, TDestination>): this {
        this.propertyMapActions.push(pm => pm.precondition = condition);
        return this;
    }

    nullSubstitute(nullSubstitute: ((src: TSource) => TMember) | TMember): this {
        this.propertyMapActions.push(pm => pm.nullSubstitute = nullSubstitute);
        return this;
    }

    ignore(): void {
        this.propertyMapActions.push(pm => pm.ignored = true);
    }

    auto(): this {
        this.propertyMapActions.push(pm => pm.chainMembers([this.destinationMember]));
        return this;
    }

    private apply(propertyMap: PropertyMap): void {
        for (const action of this.propertyMapActions) {
            action(propertyMap);
        }

        // TODO: check mapped readonly
    }
}
