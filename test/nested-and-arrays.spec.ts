import { MapperConfiguration, MappingPair } from '../src';

describe('Nested and arrays', () => {

    class Entity {
        id: number;
        title: string;
        subEntities: SubEntity[] = [];
    }

    class SubEntity {
        constructor(
            public name: string,
            public description: string
        ) {}
    }

    class EntityViewModel {
        id: number;
        subEntityNames: string[];
    }

    class EntityDetailedViewModel {
        id: number;
        subEntities: SubEntityViewModel[];
    }

    class SubEntityViewModel {
        description: string;
    }

    const EntityToViewModel = new MappingPair(Entity, EntityViewModel);
    const SubEntityToSubEntityViewModel = new MappingPair(SubEntity, SubEntityViewModel);
    const EntityToEntityDetailedViewModel = new MappingPair(Entity, EntityDetailedViewModel);

    it('should map correctly', () => {
        const mapper = new MapperConfiguration(cfg => {
            cfg.createMap(EntityToViewModel, {
                id: opt => opt.auto(),
                subEntityNames: opt => opt.mapFrom(src => src.subEntities.map(x => x.name))
            });
        }).createMapper();

        const source = new Entity();
        source.id = 1;
        source.subEntities = [
            new SubEntity('first', 'first description'),
            new SubEntity('second', 'second description'),
        ];

        const destination = mapper.map(EntityToViewModel, source);
        expect(destination.id).toBe(source.id);
        expect(destination.subEntityNames).toEqual(['first', 'second']);
    });

    it('should map correctly with sub map', () => {
        const mapper = new MapperConfiguration(cfg => {
            cfg.createMap(SubEntityToSubEntityViewModel, {
                description: opt => opt.mapFrom(src => src.description)
            });

            cfg.createMap(EntityToEntityDetailedViewModel, {
                subEntities: opt => opt.mapFromUsing(src => src.subEntities, SubEntityToSubEntityViewModel)
            }).includeBase(SubEntityToSubEntityViewModel);
        }).createMapper();

        const source = new Entity();
        source.id = 1;
        source.subEntities = [
            new SubEntity('first', 'first description'),
            new SubEntity('second', 'second description'),
        ];

        const destination = mapper.map(EntityToEntityDetailedViewModel, source);
        expect(destination.subEntities.map(x => x.description)).toEqual(['first description', 'second description']);
    });

});
