# scandir-async [![Built with Grunt][grunt-img]](http://gruntjs.com/)

[![MIT License][license-img]][license-url] [![NPM version][npm-version-img]][npm-url] [![NPM downloads][npm-downloads-img]][npm-url] [![Build][travis-img]][travis-url]

* Iterates trough a directory and returns a js object tree

## Install

```bash
npm install scandir-async
```

## Usage

```javascript
var Scandir = require('scandir-async),
    instance = new Scandir();
instance.exec([folder], [options]).then(function(data){
    // Q.promise resolved
}, function(err){
    // Q.promise rejected
});
```

## Tree Object

```json
{
    "dirname":{
        files: [{
                files: false,
                name: dirname,
                stats: [NodeJS fs stats],
                fullpath: /abs/path/to/dirname
            }, {
                files: [...],
                name: dirname,
                stats: [NodeJS fs stats],
                fullpath: /abs/path/to/dirname
            },
            {...}
        ],
        name: dirname,
        stats: [NodeJS fs stats],
        fullpath: /abs/path/to/dirname
    }
}
```

## Options

#### Folder

- absolute path

#### Options Object

**Not implemented yet**
```javascript
{
    depth: 0,
    filters: ['**/*.hml']
}
```

## Issues

### Tests

Git add/clone does not take care of empty folder used for tests, it must be created manually

```bash
mkdir spec/expected/explore_method/subnofiles
mkdir spec/expected/files_method/nofile
mkdir spec/expected/files_method/threefile/subfolder
```

A .gitkeep file can be used in empty folder, but scandir does not use filters yet

## History

[grunt-img]: https://cdn.gruntjs.com/builtwith.png
[license-img]: http://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[license-url]: LICENSE-MIT

[coverall-url]: https://coveralls.io/r/sixertoy/scandir-async
[coverall-img]: https://img.shields.io/coveralls/sixertoy/scandir-async.svg?style=flat-square

[travis-url]: https://travis-ci.org/sixertoy/scandir-async
[travis-img]: http://img.shields.io/travis/sixertoy/scandir-async.svg?style=flat-square

[npm-url]: https://npmjs.org/package/generator-gruntproject
[npm-version-img]: http://img.shields.io/npm/v/scandir-async.svg?style=flat-square
[npm-downloads-img]: http://img.shields.io/npm/dm/scandir-async.svg?style=flat-square
