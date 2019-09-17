import { MapperConfiguration, MappingPair } from '../../src';

describe('Apply include base recursively', () => {
    class BaseEntity {
        property1: string;
    }

    class SubBaseEntity extends BaseEntity {}

    class SpecificEntity extends SubBaseEntity {
        map: boolean;
    }

    class ViewModel {
        property2: string;
    }

    const BaseEntityToViewModel = new MappingPair(BaseEntity, ViewModel);
    const SubBaseEntityToViewModel = new MappingPair(SubBaseEntity, ViewModel);
    const SpecificEntityToViewModel = new MappingPair(SpecificEntity, ViewModel);

    const mapper = new MapperConfiguration(cfg => {
        cfg.createMap(BaseEntityToViewModel, {
            property2: opt => opt.mapFrom(src => src.property1)
        });

        cfg.createMap(SubBaseEntityToViewModel)
            .includeBase(BaseEntityToViewModel);

        cfg.createMap(SpecificEntityToViewModel, {
            property2: opt => opt.condition(e => e.map)
        }).includeBase(SubBaseEntityToViewModel);
    }).createMapper();

    it('should not map because of condition', () => {
        const source = new SpecificEntity();
        source.map = false;
        source.property1 = 'Test';
        const destination = mapper.map(SpecificEntityToViewModel, source);
        expect(destination.property2).toBeUndefined();
    });

    it('should apply all included base maps', () => {
        const source = new SpecificEntity();
        source.map = true;
        source.property1 = 'Test';
        const destination = mapper.map(SpecificEntityToViewModel, source);
        expect(destination.property2).toBe('Test');
    });
});
