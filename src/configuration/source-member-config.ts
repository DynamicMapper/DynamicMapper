import { MemberInfo } from '../interface';

export class SourceMemberConfig {
    private _ignored: boolean;

    constructor(public readonly sourceMember: MemberInfo) {}

    ignore() {
        this._ignored = true;
    }

    isIgnored(): boolean {
        return this._ignored;
    }
}
