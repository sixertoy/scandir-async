# scandir-async [![Built with Grunt][grunt-img]](http://gruntjs.com/)

[![MIT License][license-img]][license-url] [![NPM version][npm-version-img]][npm-url] [![NPM downloads][npm-downloads-img]][npm-url] [![Build][travis-img]][travis-url] [![Coverage][coverall-img]][coverall-url]

* Iterates trough a directory and returns a js object tree

## Install

```bash
npm install scandir-async
```

## Usage

```javascript
var scandir = require('scandir-async),
    exec = require('scandir-async).exec;
scandir.exec([folder], [options]).then(function(data){
    // Q.promise resolved
}, function(err){
    // Q.promise rejected
});
// or exposed
exec([folder], [options]).then(function(data){
    // Q.promise resolved
}, function(err){
    // Q.promise rejected
});
```

## Tree Object

```javascript
{
    "dirname":{
        files: [{
                isdir: false,
                files: false,
                name: dirname,
                stats: [NodeJS fs stats],
                fullpath: /abs/path/to/dirname
            }, {
                isdir: true,
                files: [...],
                name: dirname,
                stats: [NodeJS fs stats],
                fullpath: /abs/path/to/dirname
            },
            {...}
        ],
        isdir: true,
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
Or launch test using **npm test**

```bash
mkdir spec/expected/explore_method/subnofiles
mkdir spec/expected/files_method/nofile
mkdir spec/expected/files_method/threefile/subfolder
```

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
