# [DynamicMapper](https://dynamic-mapper.gitbook.io)
 
[![npm version](https://badge.fury.io/js/%40dynamic-mapper%2Fmapper.svg)](https://badge.fury.io/js/%40dynamic-mapper%2Fmapper)
[![CircleCI](https://circleci.com/gh/DynamicMapper/DynamicMapper/tree/master.svg?style=shield)](https://circleci.com/gh/DynamicMapper/DynamicMapper/tree/master)

DynamicMapper is a dependency free library that provides support for object to object mapping to JavaScript
for both browser and node.js environment. Inspired by [AutoMapper](http://docs.automapper.org/en/stable/index.html).

For best experience, use DynamicMapper together with [TypeScript](https://github.com/microsoft/TypeScript).

## Installation

`npm i @dynamic-mapper/mapper --save`

## Documentation

Complete documentation available [here](https://dynamic-mapper.gitbook.io).

## Motivation

Take a UI application where data are consumed in a form of `DtoOut` interface that needs to be transformed to `Domain` interface that is 
later transformed into a UI view (i.e. Angular Reactive Form value). Modified view then needs to be transformed back to `Domain` and
this updated domain object should be send back to the server in form of `DtoIn`. Pretty tedious to write those mapping in an imperative 
way for each individual domain object.

![Example](https://raw.githubusercontent.com/DynamicMapper/DynamicMapper/master/docs/diagram.png)

## Usage 

```typescript
import { MappingPair, MapperConfiguration } from '@dynamic-mapper/mapper';

interface CustomerDto {
    firstName: string;
    lastName: string;
}

interface Customer {
    firstName: string;
    lastName: string;
    fullName: string;
}

const CustomerDtoToCustomer = new MappingPair<CustomerDto, Customer>();

const configuration = new MapperConfiguration(cfg => {
    cfg.createAutoMap(CustomerDtoToCustomer, {
        fullName: opt => opt.mapFrom(src => `${src.firstName} ${src.lastName}`)
    });
});

const mapper = configuration.createMapper();

const customer: CustomerDto = {
    firstName: 'John',
    lastName: 'Doe'
};

const dto = mapper.map(CustomerDtoToCustomer, customer);
// {
//      firstName: 'John',
//      lastName: 'Doe',
//      fullName: 'John Doe'
// }
```

## Integrations

- [Angular](https://github.com/DynamicMapper/DynamicMapper.Angular)

## License
[MIT](https://choosealicense.com/licenses/mit/)
