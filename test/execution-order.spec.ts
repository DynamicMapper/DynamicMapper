import { MapperConfiguration, MappingPair } from '../src';

describe('Execution order', () => {
    class Source {
        constructor(public value: number) {}
    }

    class Destination {
        constructor(public value: number) {}
    }

    const pair = new MappingPair(Source, Destination);

    let commands: string[];

    const mapper = new MapperConfiguration(cfg => {
        cfg.createMap(pair)
            .forMember('value', o => {
                o.mapFrom(src => {
                    commands.push('mapFrom');
                    return src.value;
                });
                o.preCondition(src => {
                    commands.push('precondition');
                    return src.value === 1;
                });
                o.condition((src, dest) => {
                    commands.push('condition');
                    return dest.value == null;
                });
            });
    }).createMapper();

    beforeEach(() => {
        commands = [];
    });

    it('should execute in correct order', () => {
        mapper.map(pair, new Source(1));
        expect(commands).toEqual(['precondition', 'mapFrom', 'condition']);
    });
});
