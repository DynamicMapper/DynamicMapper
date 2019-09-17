import { MapperConfiguration, MappingPair } from '../src';

describe('Auto mapping with transform', () => {

    class Source {
        value: string;
    }

    class Destination {
        value: string;
    }

    const SourceToDestination = new MappingPair(Source, Destination);

    const mapper = new MapperConfiguration(cfg => {
        cfg.createAutoMap(SourceToDestination, {}).addTransform(d => d + ', transformed!');
    }).createMapper();

    it('should evaluate transform', () => {
        const source = new Source();
        source.value = 'Foo';

        const destination = mapper.map(SourceToDestination, source);

        expect(destination.value).toBe('Foo, transformed!');
    });
});
