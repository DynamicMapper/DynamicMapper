import { MapperConfiguration, MappingPair } from '../src';


describe('Condition', () => {
    class SubSource {
        constructor(public subValue: string) {}
    }

    class Source {
        values: SubSource[] = [];
    }

    class Destination {
        value: string;
    }

    const pair = new MappingPair(Source, Destination);

    const mapper = new MapperConfiguration(cfg => {
        cfg.createMap(pair, {
            value: opt => {
                opt.preCondition(src => src.values.length > 1);
                opt.mapFrom(src => src.values[1].subValue);
            }
        });
    }).createMapper();

    it('should skip mapping when the condition is false', () => {
        const source = new Source();
        source.values.push(new SubSource('foo'));
        const destination = mapper.map(pair, source);
        expect(destination.value).toBeUndefined();
    });

    it('should execute mapping when the condition is true', () => {
        const source = new Source();
        source.values.push(new SubSource('foo'));
        source.values.push(new SubSource('bar'));
        const destination = mapper.map(pair, source);
        expect(destination.value).toBe('bar');
    });
});

describe('PreCondition', () => {
    class Source {
        constructor(public value: number) {}
    }

    class Destination {
        constructor(public value: number) {}
    }

    const pair = new MappingPair(Source, Destination);

    const mapper = new MapperConfiguration(cfg => {
        cfg.createMap(pair, {
            value: opt => {
                opt.auto();
                opt.condition((src, dest) => dest.value == null)
            }
        });
    }).createMapper();

    it('should map value when null', () => {
        const destination = mapper.map(pair, new Source(5));
        expect(destination.value).toBe(5);
    });

    it('should not map value when null', () => {
        const destination = new Destination(6);
        mapper.map(pair, new Source(5), destination);
        expect(destination.value).toBe(6);
    });
});
