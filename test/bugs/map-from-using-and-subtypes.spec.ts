import { MapperConfiguration, MappingPair } from '../../src';

describe('Sub types should correctly inherit map from using', () => {

    interface Entity {
        type: string;
    }

    interface FooEntity extends Entity {
        foo: string;
    }

    interface BarEntity extends Entity {
        bar: string;
    }

    class Source<T extends Entity = Entity> {
        entity: T;
    }

    class Destination {
        type: string;
        entity: Entity;
        entityValue: string;
    }

    const SourceToDestination = new MappingPair(Source, Destination);
    const FooSourceToDestination = new MappingPair<Source<FooEntity>, Destination>(Source, Destination);
    const BarSourceToDestination = new MappingPair<Source<BarEntity>, Destination>(Source, Destination);
    const EntityToName = new MappingPair<Entity, string>();

    const mapper = new MapperConfiguration(cfg => {
        cfg.createMap(EntityToName)
            .constructUsing(src => {
                if (src.type === 'Foo') {
                    return 'type:Foo';
                }

                return 'type:Bar';
            });

        cfg.createMap(FooSourceToDestination, {
            entityValue: opt => opt.mapFrom(src => src.entity.foo)
        });

        cfg.createMap(BarSourceToDestination, {
            entityValue: opt => opt.mapFrom(src => src.entity.bar)
        });

        cfg.createMap(SourceToDestination, {
            type: opt => opt.mapFromUsing(src => src.entity, EntityToName),
            entity: opt => opt.mapFrom(src => src.entity)
        })
            .mapSubtype(FooSourceToDestination, src => src.entity.type === 'Foo')
            .mapSubtype(BarSourceToDestination, src => src.entity.type === 'Bar');
    }).createMapper();

    it('should not throw an error when source is null', () => {
        const source = new Source();
        source.entity = {
            type: 'Bar',
            bar: 'value'
        } as BarEntity;
        const destination = mapper.map(SourceToDestination, source);

        expect(destination).toEqual({
            type: 'type:Bar',
            entity: source.entity,
            entityValue: 'value'
        });
    });
});
