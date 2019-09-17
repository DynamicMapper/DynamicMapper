import { MapperConfiguration, MappingPair } from '../src';

describe('Nested and arrays', () => {

    class ParentDto {
        totalSum: number;
    }

    class Parent {
        constructor(
            public children: Children[],
        ) {}
    }

    class Children {
        constructor(public value: number) {}
    }

    const ParentToParentDto = new MappingPair(Parent, ParentDto);

    const mapper = new MapperConfiguration(cfg => {
        cfg.createMap(ParentToParentDto, {
            totalSum: opt => opt.mapFrom(src => src.children.reduce((prev, curr) => prev + curr.value, 0))
        });
    }).createMapper();

    it('should map correctly', () => {
        const source = new Parent([
            new Children(1),
            new Children(2),
        ]);

        const destination = mapper.map(ParentToParentDto, source);
        expect(destination.totalSum).toBe(3);
    });
});
