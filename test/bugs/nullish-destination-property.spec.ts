import { MapperConfiguration, MappingPair } from '../../src';

describe('Nullish destination property', () => {

    class Source {
        constructor(
            public readonly value: number,
            public readonly optional: number,
        ) {}
    }

    class Destination {
        value: number | null | undefined;
        optional?: number;
    }

    const pair = new MappingPair(Source, Destination);

    const mapper = new MapperConfiguration(cfg => {
        cfg.createMap(pair, {
            value: opt => opt.auto(),
            optional: opt => opt.auto()
        });
    }).createMapper();

    it('should allow auto mapping when destination is optional or can be nullish', () => {
        const destination = mapper.map(pair, new Source(4, 2));
        expect(destination.value).toBe(4);
        expect(destination.optional).toBe(2);
    });
});
