import { MapperConfiguration, MappingPair } from '../src';

describe('Value transformers', () => {

    class Source {
        constructor(public value: string) {}
    }

    class Destination {
        constructor(public value: string) {}
    }

    const pair = new MappingPair(Source, Destination);

    describe('Basic transforming', () => {
        const mapper = new MapperConfiguration(cfg => {
            cfg.createMap(pair, { value: opt => opt.auto() });
            cfg.valueTransformers.push(dest => dest + ' is transformed')
        }).createMapper();

        it('should transform values', () => {
            const destination = mapper.map(pair, new Source('Foo'));
            expect(destination.value).toBe('Foo is transformed');
        });
    });

    describe('Stacking transformers', () => {
        const mapper = new MapperConfiguration(cfg => {
            cfg.createMap(pair, { value: opt => opt.auto() });
            cfg.valueTransformers.push(dest => dest + ' is transformed');
            cfg.valueTransformers.push(dest => dest + '! No joke!');
        }).createMapper();

        it('should transform values in order', () => {
            const destination = mapper.map(pair, new Source('Foo'));
            expect(destination.value).toBe('Foo is transformed! No joke!');
        });
    });

    describe('Different profiles', () => {
        const mapper = new MapperConfiguration(cfg => {
            cfg.createMap(pair, { value: opt => opt.auto() });
            cfg.valueTransformers.push(dest => dest + ' is transformed');
            cfg.createProfile('Other', p => p.valueTransformers.push(dest => dest + '! No joke!'))
        }).createMapper();

        it('should not apply other transform', () => {
            const destination = mapper.map(pair, new Source('Foo'));
            expect(destination.value).toBe('Foo is transformed');
        });
    });

    describe('Stacking root config and profile transform', () => {
        const mapper = new MapperConfiguration(cfg => {
            cfg.valueTransformers.push(dest => dest + '! No joke!');
            cfg.createProfile('Other', p => {
                p.createMap(pair, { value: opt => opt.auto() });
                p.valueTransformers.push(dest => dest + ' is transformed');
            });
        }).createMapper();

        it('should apply profile first then root', () => {
            const destination = mapper.map(pair, new Source('Foo'));
            expect(destination.value).toBe('Foo is transformed! No joke!');
        });
    });

    describe('Stacking root and profile and member config', () => {
        const mapper = new MapperConfiguration(cfg => {
            cfg.valueTransformers.push(dest => dest + '! No joke!');
            cfg.createProfile('Other', p => {
                p.createMap(pair, { value: opt => opt.auto() }).valueTransformers.push(dest => dest + ', for real,');
                p.valueTransformers.push(dest => dest + ' is transformed');
            });
        }).createMapper();

        it('should apply profile first then root', () => {
            const destination = mapper.map(pair, new Source('Foo'));
            expect(destination.value).toBe('Foo, for real, is transformed! No joke!');
        });
    });

    describe('Stacking type map and root and profile and member config', () => {
        const mapper = new MapperConfiguration(cfg => {
            cfg.valueTransformers.push(dest => dest + '! No joke!');
            cfg.createProfile('Other', p => {
                p.createMap(pair, {
                    value: opt => {
                        opt.auto();
                        opt.addTransform(d => d + ', seriously')
                    }
                }).addTransform(dest => dest + ', for real,');
                p.valueTransformers.push(dest => dest + ' is transformed');
            });
        }).createMapper();

        it('should apply profile first then root', () => {
            const destination = mapper.map(pair, new Source('Foo'));
            expect(destination.value).toBe('Foo, seriously, for real, is transformed! No joke!');
        });
    });
});
