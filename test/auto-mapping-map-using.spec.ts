import { MapperConfiguration, MappingPair } from '../src';

describe('Auto mapping - map using', () => {

    class SourceValue {
        code: number;
    }

    class Source {
        value: SourceValue[];
    }

    class DestinationValue {
        code: string;
    }

    class Destination {
        value: DestinationValue[];
    }

    const SourceToDestination = new MappingPair(Source, Destination);
    const ValueMap = new MappingPair<SourceValue, DestinationValue>();

    const mapper = new MapperConfiguration(cfg => {
        cfg.createAutoMap(SourceToDestination, {
            value: opt => opt.mapFromUsing(src => src.value, ValueMap)
        });

        cfg.createMap(ValueMap, {
            code: opt => opt.mapFrom(x => x.code.toString())
        });
    }).createMapper();

    it('should correctly handle auto map with nested pair', () => {
        const source = new Source();
        source.value = [{ code: 123 }];

        const destination = mapper.map(SourceToDestination, source);

        expect(destination.value).toEqual([{ code: '123' }]);
    });
});
