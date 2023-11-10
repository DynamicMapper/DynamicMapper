import { ArrayToObjectMappingPair, MapperConfiguration, MappingPair } from '../../src';

describe('Array to object with mapFromUsing', () => {
    interface Property {
        name: string;
        value: string;
    }

    interface Source {
        properties: Property[];
    }

    interface Destination {
        properties: Record<string, string>;
    }

    const SourceToDestination = new MappingPair<Source, Destination>();
    const PropertiesToLookup = new ArrayToObjectMappingPair<Property[], Record<string, string>>();

    const mapper = new MapperConfiguration(cfg => {
       cfg.createStrictMap(SourceToDestination, {
           properties: opt => opt.mapFromUsing(x => x.properties, PropertiesToLookup)
       });

       cfg.createMap(PropertiesToLookup).convertUsing(x => x.reduce((acc, cur) => {
           acc[cur.name] = cur.value;
           return acc;
       }, {} as Record<string, string>));
    }).createMapper();

    it('should correctly map', () => {
        const source: Source = {
            properties: [
                {
                    name: 'prop1',
                    value: 'value1'
                },
                {
                    name: 'prop2',
                    value: 'value2'
                }
            ]
        };

        const result = mapper.map(SourceToDestination, source);

        expect(result).toEqual({
            properties: {
                prop1: 'value1',
                prop2: 'value2'
            }
        });
    });
});
