import { MapperConfiguration, MappingPair } from '../../src';

describe('Ignore should be inherited regardless of map order', () => {
    class BaseDomain {}

    class SpecificDomain extends BaseDomain {
        specificProperty: string;
    }

    class Dto {
        specificProperty: string;
    }

    const SpecificDomainToDto = new MappingPair(SpecificDomain, Dto);
    const BaseDomainToDto = new MappingPair(BaseDomain, Dto);

    it('should map correctly', () => {
        const mapper = new MapperConfiguration(cfg => {
            cfg.createMap(SpecificDomainToDto, {
                specificProperty: opt => opt.auto()
            });

            cfg.createMap(BaseDomainToDto, {
                specificProperty: opt => opt.ignore()
            }).include(SpecificDomainToDto);
        }).createMapper();

        const source = new SpecificDomain();
        source.specificProperty = 'Test';
        const destination = mapper.map(SpecificDomainToDto, source);
        expect(destination.specificProperty).toBeUndefined();
    });

    it('should map correctly', () => {
        const mapper = new MapperConfiguration(cfg => {
            cfg.createMap(BaseDomainToDto, {
                specificProperty: opt => opt.ignore()
            }).include(SpecificDomainToDto);

            cfg.createMap(SpecificDomainToDto, {
                specificProperty: opt => opt.auto()
            });
        }).createMapper();

        const source = new SpecificDomain();
        source.specificProperty = 'Test';
        const destination = mapper.map(SpecificDomainToDto, source);
        expect(destination.specificProperty).toBeUndefined();
    });
});
