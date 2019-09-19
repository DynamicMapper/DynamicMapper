import { ISourceMemberConfigurationExpression, MemberInfo } from '../interface';
import { TypeMap } from '../type-map';
import { ISourceMemberConfiguration } from './interface';
import { SourceMemberConfig } from './source-member-config';

export class SourceMappingExpression implements ISourceMemberConfigurationExpression, ISourceMemberConfiguration {
    private readonly sourceMemberActions: ((config: SourceMemberConfig) => void)[] = [];

    constructor(private readonly sourceMember: MemberInfo) {}

    ignore(): void {
        this.sourceMemberActions.push(smc => smc.ignore());
    }

    configure(typeMap: TypeMap): void {
        const sourceMemberConfig = typeMap.findOrCreateSourceMemberConfigFor(this.sourceMember);

        for (const action of this.sourceMemberActions) {
            action(sourceMemberConfig);
        }
    }
}
