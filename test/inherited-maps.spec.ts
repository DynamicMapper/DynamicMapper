import { MapperConfiguration, MappingPair } from '../src';

describe('Inherited maps', () => {

    class SourceBase {
        otherValue: number;
    }

    class Source extends SourceBase {}

    class Destination {
        value: number;
    }

    const SourceBaseToDestination = new MappingPair(SourceBase, Destination);
    const SourceToDestination = new MappingPair(Source, Destination);

    const mapper = new MapperConfiguration(cfg => {
        cfg.createMap(SourceBaseToDestination, {
            value: opt => opt.mapFrom(src => src.otherValue)
        }).include(SourceToDestination);

        cfg.createMap(SourceToDestination);
    }).createMapper();

    it('should map value from Source.value', () => {
        const source = new Source();
        source.otherValue = 123;
        const destination = mapper.map(SourceToDestination, source);
        expect(destination.value).toBe(123);
    });
});
