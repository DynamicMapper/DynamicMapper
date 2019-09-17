import { MapperConfiguration, MappingPair } from '../src';

describe('Map from', () => {

    class Source {
        value: number;
    }

    class Destination {
        valueName: number;
        explicitValue: number;
    }

    const pair = new MappingPair(Source, Destination);

    const mapper = new MapperConfiguration(cfg => {
        cfg.createMap(pair, {
            valueName: opt => opt.mapFrom(src => src.value),
            explicitValue: opt => opt.mapFrom(() => 5)
        });
    }).createMapper();

    it('should map value from Source.value', () => {
        const source = new Source();
        source.value = 123;
        const destination = mapper.map(pair, source);
        expect(destination.valueName).toBe(123);
        expect(destination.explicitValue).toBe(5);
    });
});
