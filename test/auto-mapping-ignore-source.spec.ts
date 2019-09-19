import { MapperConfiguration, MappingPair } from '../src';

describe('Auto mapping with ignored source member', () => {

    interface Source {
        value: number;
        spare: string;
    }

    interface Destination {
        value: number;
    }

    const SourceToDestination = new MappingPair<Source, Destination>();

    const mapper = new MapperConfiguration(cfg => {
        cfg.createAutoMap(SourceToDestination, {})
            .forSourceMember('spare', opt => opt.ignore());
    }).createMapper();

    it('should not map "spare" member', () => {
        const source: Source = {
            value: 123,
            spare: 'Foo'
        };

        const destination = mapper.map(SourceToDestination, source);

        expect(destination).toEqual({
            value: 123
        });
    });
});
