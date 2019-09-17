import { MapperConfiguration, MappingPair } from '../src';

describe('Null substitution', () => {

    class Source {
        constructor(public value?: number | null) {}
    }

    class Destination {
        value: number;
    }

    const pair = new MappingPair(Source, Destination);

    const mapper = new MapperConfiguration(cfg => {
        cfg.createMap(pair, {
            value: opt => {
                opt.auto();
                opt.nullSubstitute(1);
            }
        });
    }).createMapper();

    it('should substitute nil for 1', () => {
        const destination = mapper.map(pair, new Source());
        expect(destination.value).toBe(1);

        const destination2 = mapper.map(pair, new Source(null));
        expect(destination2.value).toBe(1);
    });
});
