import { MapperConfiguration, MappingPair } from '../src';

describe('General mapping', () => {

    describe('when mapping a null model', () => {
        class ModelDto {}

        class ModelObject {}

        const pair = new MappingPair(ModelObject, ModelDto);

        const mapper = new MapperConfiguration(cfg => {
            cfg.createMap(pair);
        }).createMapper();

        it('should always provide a dto', () => {
            const destination = mapper.map(pair, null);
            expect(destination).toBeTruthy();
        });
    });

    describe('when mapping an array of objects', () => {
        class ModelObject {
            someValue: string;
        }

        class ModelDto {
            someValue: string;
        }

        const pair = new MappingPair(ModelObject, ModelDto);

        const mapper = new MapperConfiguration(cfg => {
            cfg.createMap(pair, {
                someValue: opt => opt.auto()
            });
        }).createMapper();

        it('should create an array of ModelDto objects', () => {
            const model1 = new ModelObject();
            model1.someValue = 'foo';
            const model2 = new ModelObject();
            model2.someValue = 'bar';
            const models = [model1, model2];

            const destination = mapper.map(pair, models);

            expect(destination.length).toBe(2);
            expect(destination[0].someValue).toBe('foo');
            expect(destination[1].someValue).toBe('bar');
        });
    });
});
