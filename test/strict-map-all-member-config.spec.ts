import { MapperConfiguration, MappingPair } from '../src';

describe('Strict map with all member config', () => {

    class Source {
        other: number;
        another: string;
    }

    class Destination {
        other: number;
        another: string;
    }

    const pair = new MappingPair(Source, Destination);

    const mapper = new MapperConfiguration(cfg => {
        cfg.createStrictMap(pair, {
            another: opt => opt.auto(),
            other: opt => {
                opt.auto();
                opt.nullSubstitute(123);
            }
        }, opt => opt.nullSubstitute('empty'));
    }).createMapper();

    it('should substitute all nil members to custom value', () => {
        const destination = mapper.map(pair, new Source());

        expect(destination).toEqual({
            another: 'empty',
            other: 123
        });
    });
});
