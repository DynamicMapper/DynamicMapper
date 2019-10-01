import { MapperConfiguration, MappingPair } from '../src';


describe('Before After Mapping', () => {
    class Source {
        constructor(public value?: number) {}
    }

    class Destination {
        value: number;
    }

    const pair = new MappingPair(Source, Destination);

    it('should call before and after', () => {
        const after = jest.fn();
        const before = jest.fn();

        const mapper = new MapperConfiguration(cfg => {
            cfg.createMap(pair)
                .beforeMap(before)
                .afterMap(after);
        }).createMapper();

        mapper.map(pair, new Source());

        expect(after).toHaveBeenCalledTimes(1);
        expect(before).toHaveBeenCalledTimes(1);
    });

    it('should call before and after multiple times', () => {
        const after = jest.fn();
        const after2 = jest.fn();
        const before = jest.fn();
        const before2 = jest.fn();

        const mapper = new MapperConfiguration(cfg => {
            cfg.createMap(pair)
                .beforeMap(before)
                .beforeMap(before)
                .beforeMap(before2)
                .afterMap(after)
                .afterMap(after)
                .afterMap(after2);
        }).createMapper();

        mapper.map(pair, new Source());

        expect(after).toHaveBeenCalledTimes(1);
        expect(after2).toHaveBeenCalledTimes(1);
        expect(before).toHaveBeenCalledTimes(1);
        expect(before2).toHaveBeenCalledTimes(1);
    });

    it('should perform before mapping', () => {
        const mapper = new MapperConfiguration(cfg => {
            cfg.createAutoMap(pair, {})
                .beforeMap(src => src.value! += 10);
        }).createMapper();

        const result = mapper.map(pair, new Source(5));

        expect(result.value).toBe(15);
    });

    it('should perform after mapping', () => {
        const mapper = new MapperConfiguration(cfg => {
            cfg.createAutoMap(pair, {})
                .afterMap((src, dest) => dest.value += 10);
        }).createMapper();

        const result = mapper.map(pair, new Source(5));

        expect(result.value).toBe(15);
    });
});
