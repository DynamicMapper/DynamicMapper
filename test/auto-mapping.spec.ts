import { MapperConfiguration, MappingPair } from '../src';

describe('Auto mapping', () => {

    class Source {
        value: number;
        skip: string;
        other: string;
        transform: string;
    }

    class Destination {
        value: number;
        skip: string;
        other: number;
        transform: string;
    }

    const SourceToDestination = new MappingPair(Source, Destination);

    const mapper = new MapperConfiguration(cfg => {
        cfg.createAutoMap(SourceToDestination, {
            other: opt => opt.mapFrom(src => parseInt(src.other)),
            skip: opt => opt.ignore(),
            transform: opt => opt.addTransform(d => d + '!')
        });
    }).createMapper();

    it('should map values without explicit configuration', () => {
        const source = new Source();
        source.value = 123;

        const destination = mapper.map(SourceToDestination, source);

        expect(destination.value).toBe(123);
    });

    it('should respect ignored properties', () => {
        const source = new Source();
        source.skip = '123';

        const destination = mapper.map(SourceToDestination, source);

        expect(destination.skip).toBeUndefined();
    });

    it('should respect explicit mapping', () => {
        const source = new Source();
        source.other = '001';

        const destination = mapper.map(SourceToDestination, source);

        expect(destination.other).toBe(1);
    });

    it('should evaluate transform', () => {
        const source = new Source();
        source.transform = '001';

        const destination = mapper.map(SourceToDestination, source);

        expect(destination.transform).toBe('001!');
    });
});
