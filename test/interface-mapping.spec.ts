import { MapperConfiguration, MappingPair } from '../src';

describe('Interface mapping', () => {

    interface Model {
        property: string;
    }

    interface IModelDto {
        propertyDto: string;
    }

    const pair = new MappingPair<Model, IModelDto>();

    const mapper = new MapperConfiguration(cfg => {
        cfg.createMap(pair, {
            propertyDto: opt => opt.mapFrom(src => src.property)
        });
    }).createMapper();

    it('should map correctly', () => {
        const source: Model = {
            property: 'foo'
        };

        const destination = mapper.map(pair, source);
        expect(destination).toEqual({
            propertyDto: 'foo'
        });
    });
});
