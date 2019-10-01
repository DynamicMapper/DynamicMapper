import { MapperConfiguration, MappingPair } from '../../src';

describe('Auto map unwanted destination merging', () => {
    interface Foo {
        name: string;
    }

    interface Bar {
        name: string;
    }

    interface NestedFoo {
        foo: Foo;
    }

    interface NestedBar {
        bar: Bar;
    }

    interface Source {
        id: number;
        value: string;
        nested: NestedFoo;
    }

    interface Destination {
        id: number;
        value: string;
        nested: NestedBar;
    }

    const SourceToDestination = new MappingPair<Source, Destination>();
    const NestedFooToNestedBar = new MappingPair<NestedFoo, NestedBar>();

    const mapper = new MapperConfiguration(cfg => {
        cfg.createAutoMap(SourceToDestination, {
            id: opt => opt.auto(),
            value: opt => opt.auto(),
            nested: opt => opt.mapFromUsing(src => src.nested, NestedFooToNestedBar)
        });

        cfg.createStrictMap(NestedFooToNestedBar, {
            bar: opt => opt.mapFrom(src => src.foo)
        });
    }).createMapper();

    it('should map FooDto from base mapping pair', () => {
        const source: Source = {
            id: 1,
            value: 'Test',
            nested: {
                foo: {
                    name: 'Foo'
                }
            }
        };

        const destination = mapper.map(SourceToDestination, source);
        expect(destination).toEqual({
            id: 1,
            value: 'Test',
            nested: {
                // "source.foo" should not be present here
                bar: {
                    name: 'Foo'
                }
            }
        });
    });
});
