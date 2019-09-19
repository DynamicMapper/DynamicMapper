import { ConditionExpression, IMemberMap, MappingFunction, MemberInfo, ValueTransformer } from './interface';
import { MappingPair } from './mapping-pair';
import { TypeMap } from './type-map';

export class PropertyMap implements IMemberMap {
    private _memberChain: MemberInfo[] = [];

    public condition: ConditionExpression;
    public precondition: ConditionExpression;

    public customMappingFunction: MappingFunction;

    public nullSubstitute: any | null;

    public ignored: boolean;

    public pair: MappingPair<any, any> | undefined;

    get sourceMembers(): ReadonlyArray<MemberInfo> { return this._memberChain; }

    get valueTransformers(): ReadonlyArray<ValueTransformer<any>> { return this._valueTransformers; }

    get isMapped(): boolean { return this.ignored || this.canResolveValue; }
    get canResolveValue(): boolean { return !this.ignored; }
    get isResolveConfigured(): boolean { return this.customMappingFunction != null; }

    private readonly _valueTransformers: ValueTransformer<any>[] = [];

    constructor(
        public readonly destinationMember: MemberInfo,
        public readonly typeMap?: TypeMap,
        inheritedMappedProperty?: PropertyMap
    ) {
        if (inheritedMappedProperty) {
            this.applyInheritedPropertyMap(inheritedMappedProperty);
        }
    }

    chainMembers(members: MemberInfo[]) {
        members.forEach(x => this._memberChain.push(x));
    }

    mapFrom(mappingFunction: MappingFunction) {
        this.customMappingFunction = mappingFunction;
        this.ignored = false;
    }

    mapFromUsing(mappingFunction: MappingFunction, pair: MappingPair<any, any>): void {
        this.mapFrom(mappingFunction);
        this.pair = pair;
    }

    addValueTransformation(transformer: ValueTransformer<any>): void {
        this._valueTransformers.push(transformer);
    }

    applyInheritedPropertyMap(inheritedMappedProperty: PropertyMap): void {
        if (inheritedMappedProperty.ignored && !this.isResolveConfigured) {
            this.ignored = true;
        }

        this.customMappingFunction = this.customMappingFunction || inheritedMappedProperty.customMappingFunction;
        this.condition = this.condition || inheritedMappedProperty.condition;
        this.precondition = this.precondition || inheritedMappedProperty.precondition;
        this.nullSubstitute = this.nullSubstitute || inheritedMappedProperty.nullSubstitute;
        this._valueTransformers.push(...inheritedMappedProperty.valueTransformers);
        this._memberChain = this._memberChain.length === 0 ? inheritedMappedProperty._memberChain : this._memberChain;
    }
}
