import { MapperConfiguration, MappingPair } from '../src';

describe('Map from overrides ignore', () => {

    class SourceBase {}
    class DestinationBase {}

    class Source extends SourceBase {
        value: number;
    }

    class Destination extends DestinationBase {
        valueName: number;
    }

    const pair = new MappingPair(Source, Destination);

    const mapper = new MapperConfiguration(cfg => {
        cfg.createMap(pair)
            .forMember('valueName', o => {
                o.ignore();
                o.mapFrom(s => s.value)
            })

    }).createMapper();

    it('should override ignore', () => {
        const source = new Source();
        source.value = 123;
        const destination = mapper.map(pair, source);
        expect(destination.valueName).toBe(123);
    });
});
