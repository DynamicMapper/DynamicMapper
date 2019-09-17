import { MapperConfiguration, MappingPair } from '../src';

describe('Map from', () => {

    class Source {
        value: number;
    }

    class Destination {
        constructor(public readonly other: number) {}
    }

    const pair = new MappingPair(Source, Destination);

    const mapper = new MapperConfiguration(cfg => {
        cfg.createMap(pair)
            .constructUsing(src => new Destination(src.value));
    }).createMapper();

    it('should map value from Source.value', () => {
        const source = new Source();
        source.value = 123;
        const destination = mapper.map(pair, source);
        expect(destination.other).toBe(123);
    });
});
