import { MapperConfiguration, MappingPair } from '../../src';

describe('Customer', () => {
    class Customer {
        firstName: string;
        lastName: string;
        address: Address;
    }

    class Address {
        street: string;
        city: string;
        state: string;
    }

    describe('flatten', () => {
        class CustomerViewModel {
            firstName: string;
            lastName: string;
            fullAddress: string;
        }

        const pair = new MappingPair(Customer, CustomerViewModel);

        const mapper = new MapperConfiguration(cfg => {
            cfg.createMap(pair, {
                firstName: opt => opt.auto(),
                lastName: opt => opt.auto(),
                fullAddress: opt => opt.mapFrom(src => `${src.address.street}, ${src.address.city} ${src.address.state}`)
            });
        }).createMapper();

        it('should map correctly', () => {
            const source = new Customer();
            source.firstName = 'John';
            source.lastName = 'Doe';
            source.address = new Address();
            source.address.street = '221b Baker St';
            source.address.city = 'London';
            source.address.state = 'UK';

            const destination = mapper.map(pair, source);

            expect(destination).toEqual({
                firstName: 'John',
                lastName: 'Doe',
                fullAddress: '221b Baker St, London UK'
            });
        });
    });

    describe('different objects', () => {
        class CustomerDto {
            firstName: string;
            lastName: string;
            address: AddressDto;
        }

        class AddressDto {
            fullAddress: string;
        }

        const CustomerToDto = new MappingPair(Customer, CustomerDto);
        const AddressToDto = new MappingPair(Address, AddressDto);

        const mapper = new MapperConfiguration(cfg => {
            cfg.createMap(CustomerToDto, {
                firstName: opt => opt.auto(),
                lastName: opt => opt.auto(),
                address: opt => opt.mapFromUsing(src => src.address, AddressToDto)
            });

            cfg.createMap(AddressToDto, {
                fullAddress: opt => opt.mapFrom(src => `${src.street}, ${src.city} ${src.state}`)
            });
        }).createMapper();

        it('should map correctly', () => {
            const source = new Customer();
            source.firstName = 'John';
            source.lastName = 'Doe';
            source.address = new Address();
            source.address.street = '221b Baker St';
            source.address.city = 'London';
            source.address.state = 'UK';

            const destination = mapper.map(CustomerToDto, source);
            expect(destination).toBeInstanceOf(CustomerDto);
            expect(destination.firstName).toBe('John');
            expect(destination.lastName).toBe('Doe');
            expect(destination.address).toBeInstanceOf(AddressDto);
            expect(destination.address.fullAddress).toBe('221b Baker St, London UK')
        });
    });
});
