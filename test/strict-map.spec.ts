import { MapperConfiguration, MappingPair } from '../src';

describe('Strict map', () => {

    class Source {
        value: number;

        skip: string;
    }

    class Destination {
        other: number;
        another: string;
    }

    const pair = new MappingPair(Source, Destination);

    const mapper = new MapperConfiguration(cfg => {
        cfg.createStrictMap(pair, {
            other: opt => opt.mapFrom(src => src.value),
            another: opt => opt.mapFrom(src => src.value.toString())
        })
    }).createMapper();

    it('should map all destination members', () => {
        const source = new Source();
        source.value = 123;
        source.skip = '123';

        const destination = mapper.map(pair, source);

        expect(destination).toEqual({
            other: 123,
            another: '123'
        });
    });
});
