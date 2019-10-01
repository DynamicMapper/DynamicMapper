import { MapperConfiguration, MappingPair } from '../../src';

describe('Should inherit before and after map once', () => {
    class BaseBaseSource {}
    class BaseSource extends BaseBaseSource {}
    class Source extends BaseSource {}

    class BaseBaseDest {}
    class BaseDest extends BaseBaseSource {}
    class Dest extends BaseDest {}

    const BBSourceToBBDest = new MappingPair<BaseBaseSource, BaseBaseDest>();
    const BSourceToBDest = new MappingPair<BaseSource, BaseDest>();
    const SourceToDest = new MappingPair<Source, Dest>();

    it('should call after and before map once', () => {
        let afterMapCount = 0;
        let beforeMapCount = 0;

        const mapper = new MapperConfiguration(cfg => {
            cfg.createMap(BBSourceToBBDest)
                .afterMap(() => afterMapCount++)
                .beforeMap(() => beforeMapCount++)
                .include(SourceToDest)
                .include(BSourceToBDest);
            cfg.createMap(BSourceToBDest).include(SourceToDest);
            cfg.createMap(SourceToDest);
        }).createMapper();

        mapper.map(SourceToDest, new Source());

        expect(afterMapCount).toBe(1);
        expect(beforeMapCount).toBe(1);
    });

    it('should call after and before map once', () => {
        let afterMapCount = 0;
        let beforeMapCount = 0;

        const mapper = new MapperConfiguration(cfg => {
            cfg.createMap(BBSourceToBBDest)
                .afterMap(() => afterMapCount++)
                .beforeMap(() => beforeMapCount++);
            cfg.createMap(BSourceToBDest).includeBase(BBSourceToBBDest);
            cfg.createMap(SourceToDest).includeBase(BSourceToBDest);
        }).createMapper();

        mapper.map(SourceToDest, new Source());

        expect(afterMapCount).toBe(1);
        expect(beforeMapCount).toBe(1);
    });

    describe('inheritance', () => {
        class BaseClass {
            prop: string;
        }

        class Class extends BaseClass {}

        class BaseDto {
            differentProp: string;
        }

        class Dto extends BaseDto {}

        const BaseClassToBaseDto = new MappingPair(BaseClass, BaseDto);
        const ClassToDto = new MappingPair(Class, Dto);

        it('should inherit before map', () => {
            const mapper = new MapperConfiguration(cfg => {
                cfg.createMap(BaseClassToBaseDto)
                    .beforeMap((src, dest) => dest.differentProp = src.prop)
                    .include(ClassToDto);

                cfg.createMap(ClassToDto);
            }).createMapper();

            const source = new Class();
            source.prop = 'test';
            const dest = mapper.map(ClassToDto, source);
            expect(dest.differentProp).toBe('test');
        });

        it('should inherit after map', () => {
            const mapper = new MapperConfiguration(cfg => {
                cfg.createMap(BaseClassToBaseDto)
                    .afterMap((src, dest) => dest.differentProp = src.prop)
                    .include(ClassToDto);

                cfg.createMap(ClassToDto);
            }).createMapper();

            const source = new Class();
            source.prop = 'test';
            const dest = mapper.map(ClassToDto, source);
            expect(dest.differentProp).toBe('test');
        });
    });
});
