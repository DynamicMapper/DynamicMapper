import { MapperConfiguration, MappingPair } from '../src';

describe('Convert using', () => {

    class Source {
        value: number;
    }

    class Destination {
        constructor(public readonly other: number) {}
    }

    const pair = new MappingPair(Source, Destination);

    const mapper = new MapperConfiguration(cfg => {
        cfg.createMap(pair)
            .convertUsing(src => new Destination(src.value));
    }).createMapper();

    it('should perform mapping by explicit converter', () => {
        const source = new Source();
        source.value = 123;
        const destination = mapper.map(pair, source);
        expect(destination.other).toBe(123);
    });
});
