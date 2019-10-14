import { MapperConfiguration, MappingPair } from '../src';

describe('Null substitution', () => {

    class Source {
        another: string;
        constructor(public value?: number | null) {}
    }

    class Destination {
        value: number;
        another: string;
    }

    const substitution = jest.fn();

    const pair = new MappingPair(Source, Destination);

    const mapper = new MapperConfiguration(cfg => {
        cfg.createMap(pair, {
            value: opt => {
                opt.auto();
                opt.nullSubstitute(1);
            },
            another: opt => {
                opt.auto();
                opt.nullSubstitute(substitution);
            }
        });
    }).createMapper();

    afterEach(() => {
        substitution.mockClear();
    });

    it('should substitute nil values', () => {
        substitution.mockImplementation(src => '123');

        const source = new Source();
        const destination = mapper.map(pair, source);
        expect(destination.value).toBe(1);
        expect(destination.another).toBe('123');
        expect(substitution).toHaveBeenCalledWith(source);

        const destination2 = mapper.map(pair, new Source(null));
        expect(destination2.value).toBe(1);
        expect(destination2.another).toBe('123');
    });
});
