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

    mapFrom(mappingFunction: (source: TSource) => TMember): void {
        this.sourceMember = mappingFunction;
        this.propertyMapActions.push(pm => pm.mapFrom(mappingFunction));
    }

    mapFromUsing<TSourceMember>(
        mappingFunction: (source: TSource) => TSourceMember,
        pair: MappingPair<
            TSourceMember extends Array<any> ? TSourceMember[0] : TSourceMember,
            TMember extends Array<any> ? TMember[0] : TMember
        >): void {
        this.propertyMapActions.push(pm => pm.mapFromUsing(mappingFunction, pair));
    }

    addTransform(transformer: ValueTransformer<TMember>): void {
        this.propertyMapActions.push(pm => pm.addValueTransformation(transformer));
    }

    condition(condition: ConditionExpression<TSource, TDestination>): void {
        this.propertyMapActions.push(pm => pm.condition = condition);
    }

    preCondition(condition: ConditionExpression<TSource, TDestination>): void {
        this.propertyMapActions.push(pm => pm.precondition = condition);
    }

    nullSubstitute(nullSubstitute: TMember | null): void {
        this.propertyMapActions.push(pm => pm.nullSubstitute = nullSubstitute);
    }

    ignore(): void {
        this.propertyMapActions.push(pm => pm.ignored = true);
    }

    auto(): void {
        this.propertyMapActions.push(pm => pm.chainMembers([this.destinationMember]));
    }

    private apply(propertyMap: PropertyMap): void {
        for (const action of this.propertyMapActions) {
            action(propertyMap);
        }

        // TODO: check mapped readonly
    }
}
