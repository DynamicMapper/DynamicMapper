import { Profile } from '../profile';
import { IMapperConfigurationExpression } from './interface';
import { IProfileExpression } from '../interface';

export class MapperConfigurationExpression extends Profile implements IMapperConfigurationExpression {
    private readonly _profiles: Profile[] = [];

    get profiles(): ReadonlyArray<Profile> { return this._profiles; }

    createProfile(profileName: string, configure: (config: IProfileExpression) => void): void {
        const profile = new NamedProfile(profileName);
        configure(profile);
        this.addProfile(profile);
    }

    addProfile(profile: Profile): void {
        this._profiles.push(profile);
    }
}

class NamedProfile extends Profile {
    constructor(name: string) {
        super();
        this.profileName = name;
    }
}
