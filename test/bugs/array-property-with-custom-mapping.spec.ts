import { MapperConfiguration, MappingPair } from '../../src';

describe('Array property with custom mapping', () => {

    interface Foo {
        value: string;
    }

    interface Bar {
        value: number;
    }

    interface Source {
        items: Foo[];
    }

    interface Destination {
        items: Bar[];
    }

    const pair = new MappingPair<Source, Destination>();
    const BarToFoo = new MappingPair<Foo, Bar>();

    const mapper = new MapperConfiguration(cfg => {
        cfg.createAutoMap(BarToFoo, {
            value: opt => opt.mapFrom(src => parseInt(src.value))
        });

        cfg.createStrictMap(pair, {
            items: opt => opt.mapFromUsing(src => src.items, BarToFoo)
        });
    }).createMapper();

    it('should map correctly', () => {
        const result = mapper.map(pair, {
            items: [{ value: '123' }]
        });

        expect(result).toEqual({
            items: [{ value: 123 }]
        })
    });
});
