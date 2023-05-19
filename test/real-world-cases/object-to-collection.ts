import { MapperConfiguration, MappingPair } from '../../src';

describe('Object to Collection', () => {
    interface IApiContact {
        firstName: string;
        lastName: string;
        phone: string;
        phoneCountryCode: string;
        fax: string;
        faxCountryCode: string;
    }

    interface IApiContactCollection {
        adminContact: IApiContact;
        techContact: IApiContact;
        registrantContact: IApiContact;
    }

    interface IContact {
        contactType: ContactType;
        firstName: string;
        lastName: string;
        phone: string;
        phoneCode: string;
        fax: string;
        faxCode: string;
    }

    enum ContactType {
        Admin,
        Tech,
        Registrant,
    }

    const SourceToDestination = new MappingPair<IApiContactCollection, IContact[]>();
    const ApiContactToContact = new MappingPair<IApiContact, IContact>();

    const mapper = new MapperConfiguration(cfg => {
        cfg.createStrictMap(ApiContactToContact, {
            contactType: opts => opts.ignore(),
            firstName: opts => opts.mapFrom(x => x.firstName),
            lastName: opts => opts.mapFrom(x => x.lastName),
            phone: opts => opts.mapFrom(x => x.phone),
            phoneCode: opts => opts.mapFrom(x => x.phoneCountryCode),
            fax: opts => opts.mapFrom(x => x.fax),
            faxCode: opts => opts.mapFrom(x => x.faxCountryCode)
        });

        cfg.createMap(SourceToDestination).convertUsing((x, _, ctx) => {
            const contacts: IContact[] = [];

            if (x.adminContact) {
                contacts.push(ctx.map(ApiContactToContact, x.adminContact, { contactType: ContactType.Admin }));
            }

            if (x.techContact) {
                contacts.push(ctx.map(ApiContactToContact, x.techContact, { contactType: ContactType.Tech }));
            }

            if (x.registrantContact) {
                contacts.push(ctx.map(ApiContactToContact, x.registrantContact, { contactType: ContactType.Registrant }));
            }

            return contacts;
        });
    }).createMapper();

    it('should map object to collection', () => {
        const source: IApiContactCollection = {
            adminContact: {
                firstName: 'John',
                lastName: 'Doe',
                phone: '1234567890',
                phoneCountryCode: '1',
                fax: '1234567890',
                faxCountryCode: '2'
            },
            techContact: {
                firstName: 'Jane',
                lastName: 'Doe',
                phone: '098654321',
                phoneCountryCode: '6',
                fax: '1234567890',
                faxCountryCode: '5'
            },
            registrantContact: {
                firstName: 'John',
                lastName: 'Foo',
                phone: '11122233',
                phoneCountryCode: '4',
                fax: '000-000-000',
                faxCountryCode: '2'
            },
        };

        const destination = mapper.map(SourceToDestination, source);

        expect(destination).toEqual([
            {
                contactType: ContactType.Admin,
                fax: '1234567890',
                faxCode: '2',
                firstName: 'John',
                lastName: 'Doe',
                phone: '1234567890',
                phoneCode: '1'
            },
            {
                contactType: ContactType.Tech,
                fax: '1234567890',
                faxCode: '5',
                firstName: 'Jane',
                lastName: 'Doe',
                phone: '098654321',
                phoneCode: '6'
            },
            {
                contactType: ContactType.Registrant,
                fax: '000-000-000',
                faxCode: '2',
                firstName: 'John',
                lastName: 'Foo',
                phone: '11122233',
                phoneCode: '4'
            }
        ]);
    });
});
