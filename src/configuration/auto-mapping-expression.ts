import { ISourceMemberConfigurationExpression } from '../interface';
import { MappingPair } from '../mapping-pair';
import { IAutoMappingExpression } from './interface';
import { MappingExpression } from './mapping-expression';
import { MemberConfigurationExpression } from './member-configuration-expression';
import { SourceMappingExpression } from './source-mapping-expression';

export class AutoMappingExpression<TSource, TDestination> extends MappingExpression<TSource, TDestination>
    implements IAutoMappingExpression<TSource, TDestination> {

    constructor(types: MappingPair<TSource, TDestination>) {
        super(types);

        this.typeMapActions.push(tm => tm.implicitAutoMapping = true);
    }

    forMember<Member extends keyof TDestination>(
        destinationMember: Member,
        memberOptions: (expression: MemberConfigurationExpression<TSource, TDestination, TDestination[Member]>) => void
    ): this {
        return this.forDestinationMember(destinationMember, memberOptions, true);
    }

    forSourceMember<Member extends keyof TSource>(
        sourceMember: Member,
        memberOptions: (expression: ISourceMemberConfigurationExpression) => void
    ): this {
        const config = new SourceMappingExpression(sourceMember);
        memberOptions(config);

        this.sourceMemberConfigurations.push(config);

        return this;
    }
}
