import { MapperConfiguration, MappingPair } from '../../src';

describe('Auto map with pre condition', () => {
    interface Source {
        id: number;
    }

    interface Destination {
        id: number;
    }

    const SourceToDestination = new MappingPair<Source, Destination>();

    const mapper = new MapperConfiguration(cfg => {
        cfg.createAutoMap(SourceToDestination, {
            id: opt => opt.preCondition(src => src.id > 2)
        });
    }).createMapper();

    it('should not map property when precondition is not met', () => {
        const source: Source = {
            id: 1
        };

        const destination = mapper.map(SourceToDestination, source);
        expect(destination).toEqual({});
    });

    it('should map when precondition is met', () => {
        const source: Source = {
            id: 3
        };

        const destination = mapper.map(SourceToDestination, source);
        expect(destination).toEqual({
            id: 3
        });
    });
});
