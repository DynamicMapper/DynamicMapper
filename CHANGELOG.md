### 1.9.0 (2020-05-06)

##### New Features

*  allow to use pre-condition and condition on auto mapping pairs ([46e9d886](https://github.com/DynamicMapper/DynamicMapper/commit/46e9d886f6692788c05661d0c4800fa8022cbed4))

### 1.8.0 (2020-03-30)

##### New Features

*  allow to use `.auto()` when non nullable types matches (strict null checking) ([8d77c342](https://github.com/DynamicMapper/DynamicMapper/commit/8d77c3428f13386036fc8115eea459b9e3ed5542))

### 1.7.0 (2019-11-14)

##### New Features

*  member configuration chaining (`opt => opt.auto().addTransform(d => d + '!').nullSubstitute(false)`) ([6ee55fdf](https://github.com/DynamicMapper/DynamicMapper/commit/6ee55fdf6a101f42899b13b5410037ce6e90d9e1))

#### 1.6.2 (2019-11-09)

##### Bug Fixes

*  allow auto mapping for optional or nullish destination members rather than optional or nullish source members ([f09ec5c2](https://github.com/DynamicMapper/DynamicMapper/commit/f09ec5c236b09ddc8635a4f8a5fb91842e3f1a9e))

#### 1.6.1 (2019-10-22)

##### Bug Fixes

*  properties of array type with custom mapping are now mapped correctly ([64f3be7f](https://github.com/DynamicMapper/DynamicMapper/commit/64f3be7f26fda520b42919082a963cec11361697))

### 1.6.0 (2019-10-19)

##### New Features

*  mapped properties that resolves to `nil` are now mapped to `null` instead of `undefined` by default ([57ae23d3](https://github.com/DynamicMapper/DynamicMapper/commit/57ae23d3619cad93245c9338291674ca7f847cbb))

### 1.5.0 (2019-10-19)

##### New Features

*  `nullSubstitute` value factory ([10ef8124](https://github.com/DynamicMapper/DynamicMapper/commit/10ef8124694b94511effa6fd0a3c5e0097c9fc82))
*  option to set all member configuration in strict map mapper ([b8f45a20](https://github.com/DynamicMapper/DynamicMapper/commit/b8f45a20e08aad0eb0f54b42d06b9f3e46fd3103))
*  allow `nullSubstitute` to null ([386d08f6](https://github.com/DynamicMapper/DynamicMapper/commit/386d08f65a89ed5b473230291810216437f54a4e))

#### 1.4.1 (2019-10-01)

##### Bug Fixes

*  inherit `mapFromUsing` mapping pair ([9d581f96](https://github.com/DynamicMapper/DynamicMapper/commit/9d581f96c16669e4ad558cf525e38d0910274f33))

### 1.4.0 (2019-10-01)

##### New Features

*  before and after mapping ([b5d8791e](https://github.com/DynamicMapper/DynamicMapper/commit/b5d8791e229bf1bb8a76ad8cab3f384717a9e743))

##### Bug Fixes

*  skip auto mapping when custom resolver is configured ([fadc397c](https://github.com/DynamicMapper/DynamicMapper/commit/fadc397c5e7357b501728d4a8c9f578d302d28fb))

#### 1.3.1 (2019-09-20)

##### Bug Fixes

*  method properties should not be required in member configuration ([bd8063eb](https://github.com/DynamicMapper/DynamicMapper/commit/bd8063eb14241fab062f7b6e20ea89528525d499))

### 1.3.0 (2019-09-20)

##### New Features

*  subtype mapping ([7273ad02](https://github.com/DynamicMapper/DynamicMapper/commit/7273ad028eedfbfb7aea974d6aa88e2d4fb2d931))
*  inherit source member configuration ([2b7a6b08](https://github.com/DynamicMapper/DynamicMapper/commit/2b7a6b08aa40d849df3b9949828e4ff4722c6179))

##### Bug Fixes

*  don't allow duplications in inherited type maps ([d6951f5b](https://github.com/DynamicMapper/DynamicMapper/commit/d6951f5b288c01e8957111bae2ad669f6511f02d))
*  type safety in auto map member configuration ([7f5d7319](https://github.com/DynamicMapper/DynamicMapper/commit/7f5d73194acf6840320c26f7c2db031a842e30e2))

### 1.1.0 (2019-09-18)

##### New Features

*  option to create a strict map requiring property mapping for each destination member ([20d3ab73](https://github.com/DynamicMapper/DynamicMapper/commit/20d3ab73a42a7b3178f2cba34df3e136d950cd6d))

