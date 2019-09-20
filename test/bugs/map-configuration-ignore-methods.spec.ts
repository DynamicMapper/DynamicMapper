import { MapperConfiguration, MappingPair } from '../../src';

describe('Ignore methods on member configuration', () => {
    class Source {
        property: string;
        other: string;
    }

    class Destination {
        property: string;
        another: string;

        method() {}
    }

    const pair = new MappingPair(Source, Destination);

    it('should not require method member configuration', () => {
        const mapper = new MapperConfiguration(cfg => {
            cfg.createAutoMap(pair, {
                another: opt => opt.ignore()
            });
        }).createMapper();
    });
});
