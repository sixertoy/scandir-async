# scandir-async [![Built with Grunt][grunt-img]](http://gruntjs.com/)

[![MIT License][license-img]][license-url] [![NPM version][npm-version-img]][npm-url] [![NPM downloads][npm-downloads-img]][npm-url] [![Build][travis-img]][travis-url] [![Coverage][coverall-img]][coverall-url]

* Iterates trough a directory and returns a js object tree
* Result can be directories/files sorted first

## Install

```bash
npm install scandir-async
```

## Usage

```javascript
var scandir = require('scandir-async'),
    exec = require('scandir-async').exec;
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
    isdir: true,
    name: dirname,
    fullpath: /abs/path/to/dirname,
    stats: {
        dev: 310691535,
         ino: 2814749767439347,
         uid: 0,
         gid: 0,
         rdev: 0,
         size: 0,
         mode: 16822,
         nlink: 1,
         blocks: false,
         blksize: false,
         atime: 1436683130000,
         mtime: 1436683130000,
         ctime: 1436683130000,
         birthtime: 1436683129000
    },
    files: [{
            isdir: false,
            files: false,
            name: dirname,
            stats: [object],
            fullpath: /abs/path/to/dirname
        }, {
            isdir: true,
            files: [...],
            name: dirname,
            stats: [object],
            fullpath: /abs/path/to/dirname
        },
        {...}
    ]
}
```

## Options

#### Folder

- absolute path

#### Options Object

**Currently implemented**

```javascript
{
    sorted: false, // Default not sorted
    sorted: true, // 'ASC'
    sorted: 'ASC',
    sorted: 'DESC',
}
```

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

- v0.1.15: Sorted fix name lowercase
- v0.1.12: Sorted options added
- v0.1.11: Files prop for directory is an array
- v0.1.10: Changes on tree object

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
