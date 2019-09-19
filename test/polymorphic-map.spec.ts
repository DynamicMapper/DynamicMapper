import { MapperConfiguration, MappingPair } from '../src';

describe('Polymorphic mapping', () => {
    class Entity {
        type: string;
        property1: string;
        createdAt: string;
    }

    class FooEntity extends Entity {
        readonly type = 'Foo';
    }

    class BarEntity extends Entity {
        readonly type = 'Bar';
    }

    class Dto {
        property1: string;
        createdAt: string;
    }

    class FooDto extends Dto {
        fooProperty: number;
    }

    class BarDto extends Dto {
        barProperty: number;
    }

    const EntityToDto = new MappingPair(Entity, Dto);
    const FooEntityToDto = new MappingPair(FooEntity, FooDto);
    const BarEntityToDto = new MappingPair(BarEntity, BarDto);

    const mapper = new MapperConfiguration(cfg => {
        cfg.createAutoMap(EntityToDto, {
            createdAt: opt => opt.mapFrom(src => 'unknown'),
        })
            .forSourceMember('type', opt => opt.ignore())
            .mapSubtype(FooEntityToDto, src => src.type === 'Foo')
            .mapSubtype(BarEntityToDto, src => src.type === 'Bar');

        cfg.createAutoMap(FooEntityToDto, {
            fooProperty: opt => opt.mapFrom(src => parseInt(src.property1))
        }).includeBase(EntityToDto);

        cfg.createAutoMap(BarEntityToDto, {
            barProperty: opt => opt.mapFrom(src => parseInt(src.property1))
        }).includeBase(EntityToDto);
    }).createMapper();

    it('should map FooDto from base mapping pair', () => {
        const source = new FooEntity();
        source.property1 = '123';
        source.createdAt = '2000-01-01';

        const destination = mapper.map(EntityToDto, source) as FooDto;
        expect(destination instanceof FooDto).toBe(true);
        expect({ ...destination }).toEqual({
            property1: '123',
            fooProperty: 123,
            createdAt: 'unknown'
        });
    });

    it('should map BarDto from base mapping pair', () => {
        const source = new BarEntity();
        source.createdAt = '2000-01-01';
        source.property1 = '123';

        const destination = mapper.map(EntityToDto, source) as BarDto;
        expect(destination instanceof BarDto).toBe(true);
        expect({ ...destination }).toEqual({
            property1: '123',
            barProperty: 123,
            createdAt: 'unknown'
        });
    });
});
