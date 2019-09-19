import { MappingExpressionBase } from './mapping-expression-base';
import { IMappingExpressionBase } from './interface';
import { MemberInfo } from '../interface';
import { MemberConfigurationExpression } from './member-configuration-expression';

export class MappingExpression<TSource, TDestination> extends MappingExpressionBase<TSource, TDestination>
    implements IMappingExpressionBase<TSource, TDestination>, IMappingExpressionBase<TSource, TDestination> {

    forMember<Member extends keyof TDestination>(
        destinationMember: Member,
        memberOptions: (expression: MemberConfigurationExpression<TSource, TDestination, TDestination[Member]>) => void
    ) {
        return this.forDestinationMember(destinationMember, memberOptions);
    }

    protected forDestinationMember<TMember>(
        destinationMember: MemberInfo,
        memberOptions: (expression: MemberConfigurationExpression<TSource, TDestination, TMember>) => void,
        auto: boolean = false): this {
        const expression = new MemberConfigurationExpression<TSource, TDestination, TMember>(destinationMember);

        if (auto) {
            expression.auto();
        }

        this.memberConfigurations.push(expression);

        memberOptions(expression);

        return this;
    }
}
