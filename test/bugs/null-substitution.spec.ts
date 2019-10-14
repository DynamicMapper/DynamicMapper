import { MapperConfiguration, MappingPair } from '../../src';

describe('Null substitution', () => {

    class Source {
        value: number;
    }

    class Destination {
        value: number;
    }

    const pair = new MappingPair(Source, Destination);

    const mapper = new MapperConfiguration(cfg => {
        cfg.createStrictMap(pair, {
            value: opt => {
                opt.auto();
                opt.nullSubstitute(null);
            }
        });
    }).createMapper();

    it('should substitute "value" property to null', () => {
        const destination = mapper.map(pair, new Source());

        expect(destination).toEqual({ value: null });
    });
});
