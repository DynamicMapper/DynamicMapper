import { MapperConfiguration, MappingPair } from '../src';

describe('Auto mapping type match', () => {

    class Source {
        value?: number | null | undefined;
    }

    class Destination {
        value: number;
    }

    const SourceToDestination = new MappingPair(Source, Destination);

    const mapper = new MapperConfiguration(cfg => {
        cfg.createStrictMap(SourceToDestination, {
            value: opt => opt.auto()
        });
    }).createMapper();

    it('should allow auto mapping for all members whose non nullable types matches', () => {
        const source = new Source();
        source.value = 123;

        const destination = mapper.map(SourceToDestination, source);

        expect(destination.value).toBe(123);
    });
});
