import { MapperConfiguration, MappingPair } from '../../src';

describe('Transform duplication on inheritance', () => {
    class Entity {
        name: string;
    }

    class FooEntity extends Entity {
    }

    class BarEntity extends Entity {
    }

    class Dto {
        name: string;
    }

    class FooDto extends Dto {}

    class BarDto extends Dto {}

    const EntityToDto = new MappingPair(Entity, Dto);
    const FooEntityToDto = new MappingPair(FooEntity, FooDto);
    const BarEntityToDto = new MappingPair(BarEntity, BarDto);

    const mapper = new MapperConfiguration(cfg => {
        cfg.createAutoMap(EntityToDto, {
            name: opt => opt.addTransform(d => d + ', transformed!'),
        })
            .include(FooEntityToDto)
            .include(BarEntityToDto);

        cfg.createAutoMap(FooEntityToDto, {});

        cfg.createAutoMap(BarEntityToDto, {});
    }).createMapper();

    it('should map FooDto from base mapping pair', () => {
        const source = new FooEntity();
        source.name = 'John';

        const destination = mapper.map(FooEntityToDto, source) as FooDto;
        expect(destination.name).toBe('John, transformed!');
    });
});
