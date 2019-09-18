import { MapperConfiguration, MappingPair } from '../../src';

describe('Null source', () => {

    class Source {
        value: number;
        same: number;
    }

    class Destination {
        other: number;
        same: number;
    }

    const pair = new MappingPair(Source, Destination);

    describe('with explicit mapping', () => {
        const mapper = new MapperConfiguration(cfg => {
            cfg.createMap(pair, {
                other: opt => opt.mapFrom(src => src.value)
            });
        }).createMapper();

        it('should not throw an error when source is null', () => {
            const destination = mapper.map(pair, null);
            expect(destination.other).toBeNull();
        });

        it('should not throw an error when source is undefined', () => {
            const destination = mapper.map(pair, undefined);
            expect(destination.other).toBeNull();
        });
    });

    describe('with strict mapping', () => {
        const mapper = new MapperConfiguration(cfg => {
            cfg.createStrictMap(pair, {
                other: opt => opt.mapFrom(src => src.value),
                same: opt => opt.auto()
            });
        }).createMapper();

        it('should not throw an error when source is null', () => {
            const destination = mapper.map(pair, null);
            expect(destination.other).toBeNull();
            expect(destination.same).toBeNull();
        });

        it('should not throw an error when source is undefined', () => {
            const destination = mapper.map(pair, undefined);
            expect(destination.other).toBeNull();
            expect(destination.same).toBeNull();
        });
    });

    describe('with auto mapping', () => {
        const mapper = new MapperConfiguration(cfg => {
            cfg.createAutoMap(pair, {
                other: opt => opt.mapFrom(src => src.value)
            });
        }).createMapper();

        it('should not throw an error when source is null', () => {
            const destination = mapper.map(pair, null);
            expect(destination.other).toBeNull();
            expect(destination.same).toBeUndefined();
        });

        it('should not throw an error when source is undefined', () => {
            const destination = mapper.map(pair, undefined);
            expect(destination.other).toBeNull();
            expect(destination.same).toBeUndefined();
        });
    });
});
