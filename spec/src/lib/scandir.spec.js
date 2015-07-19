/*jshint unused: false */
/*jslint indent: 4 */
/*global jasmine, process, require, define, describe, xdescribe, it, xit, expect, beforeEach, afterEach, afterLast, spyOn */
(function () {

    'use strict';

    var result, helper,
        cwd = process.cwd(),
        qPromiseFunc = function () {
            return {
                promise: 'yo! it\'s a promise',
                reject: function () {
                    return 'yo! promise rejected';
                },
                resolve: function () {
                    return 'yo! promise resolved';
                }
            };
        },
        options = {
            depth: 1,
            filters: ['../*.md']
        },
        //
        Q = require('q'),
        FS = require('fs'),
        Path = require('path'),
        sinon = require('sinon'),
        lodash = require('lodash'),
        //
        Utils = require(Path.join(cwd, 'src', 'server', 'lib', 'utils')),
        Scandir = require(Path.join(cwd, 'src', 'server', 'lib', 'scandir'));
    /*
    exec = require(base).exec,
    build = require(base).build,
    files = require(base).files
    */

    describe('scandir', function () {

        describe('scandir.options()', function () {
            it('returns defaults options', function () {
                helper = new Scandir();
                result = helper.options();
                expect(result.root).toEqual('.');
                expect(result.depth).toEqual(0);
                expect(result.filters).toEqual([]);
            });
        });

        describe('scandir.node()', function () {
            it('returns an object', function () {
                var base = cwd,
                    stats = {};
                helper = new Scandir();
                result = helper.node(base, stats);
                expect(result).toEqual({
                    files: [],
                    stats: {},
                    fullpath: cwd,
                    name: 'readmepad'
                });
            });
        });

        describe('scandir.files/files', function () {

            it('returns Q.promise', function () {
                var promise;
                sinon.stub(Q, 'defer', qPromiseFunc);
                helper = new Scandir();
                promise = helper.files('toto');
                expect(promise).toEqual('yo! it\'s a promise');
                Q.defer.restore();
            });

            it('use FS.readdir', function () {
                helper = new Scandir();
                sinon.stub(FS, 'readdir');
                helper.files('test_fs_readdir');
                expect(FS.readdir.calledOnce).toEqual(true);
                FS.readdir.restore();
            });

            it('Q.reject called on non existent path', function (done) {
                var msg = 'Invalid path. Aborted';
                helper = new Scandir();
                helper.files('test_invalid_path').then(function () {}, function (err) {
                    expect(err.message).toEqual(msg);
                    done();
                });
            });

            it('Q.resolved with false - no file in folder', function (done) {
                var no_file_path = Path.join(cwd, 'spec', 'expected', 'files_method', 'nofile');
                helper = new Scandir();
                helper.files(no_file_path).then(function (result) {
                    expect(result).toEqual(false);
                    done();
                }, function (err) {
                    // no error
                });
            });

            it('Q.resolved with array of files - length 4', function (done) {
                var no_file_path = Path.join(cwd, 'spec', 'expected', 'files_method', 'threefile');
                helper = new Scandir();
                helper.files(no_file_path).then(function (result) {
                    expect(result.length).toEqual(4);
                    done();
                }, function (err) {
                    // no error
                });

            });

        });

        describe('browsable method (async)', function () {
            it('resolve w/ stats', function (done) {
                var base = Path.join(cwd, 'spec', 'expected', 'explore_method');
                helper = new Scandir();
                helper.browsable(base).then(function (stats) {
                    expect(stats.isDirectory()).toEqual(true);
                    done();
                }, function () {});
            });
            it('resolve w/ FS.error', function (done) {
                var base = Path.join(cwd, 'spec', 'expected', 'non_exists');
                helper = new Scandir();
                helper.browsable(base).then(function () {}, function (err) {
                    // returns an FS Error
                    expect(err.hasOwnProperty('path')).toBe(true);
                    expect(err.hasOwnProperty('code')).toBe(true);
                    expect(err.hasOwnProperty('errno')).toBe(true);
                    done();
                });
            });
        });

        describe('list items/build method', function () {
            it('returns plain object', function (done) {
                var file = Path.join(cwd, 'spec', 'expected', 'explore_method'),
                    base = {
                        files: [],
                        fullpath: file,
                        name: 'explore_method',
                        stats: FS.statSync(file)
                    };
                helper = new Scandir();
                helper.build(base, helper).then(function (data) {
                    expect(lodash.isPlainObject(data)).toEqual(true);
                    expect(data.files.length).toEqual(4);
                    expect(data.files[0].files).toEqual(false); // index.html
                    expect(data.files[1].files).toEqual(false); // subnofiles
                    expect(data.files[2].files.length).toEqual(1); // subone
                    expect(data.files[2].files[0].files.length).toEqual(2); // subone/file && subone/file.txt
                    expect(data.files[2].files[0].files[0].name).toEqual('file'); // subone/file && subone/file.txt
                    expect(data.files[2].files[0].files[1].name).toEqual('file.txt'); // subone/file && subone/file.txt
                    expect(data.files[3].files.length).toEqual(3); // subtwo
                    expect(data.files[3].files[0].name).toEqual('file.js'); // subtwo/file.js
                    expect(data.files[3].files[1].name).toEqual('file.md'); // subtwo/file.md
                    expect(data.files[3].files[2].files.length).toEqual(1); // subtwo/subsub
                    expect(data.files[3].files[2].files[0].files.length).toEqual(1); // subtwo/subsub/subsubsub
                    expect(data.files[3].files[2].files[0].files[0].name).toEqual('file.css'); // subtwo/subsub/subsubsub/file.css
                    done();
                }, function (err) {
                    // no error
                });
            });
        });

        describe('scandir/exec/scandir.exec', function () {

            it('returns Q.promise', function () {
                helper = new Scandir();
                sinon.stub(FS, 'stat');
                sinon.stub(helper, 'build');
                sinon.stub(Q, 'defer', qPromiseFunc);
                result = helper.exec('toto');
                expect(result).toEqual('yo! it\'s a promise');
                helper.build.restore();
                FS.stat.restore();
                Q.defer.restore();
            });

            it('returns a path/test scandir.options().root', function () {
                var promise, p, e;
                helper = new Scandir();
                sinon.stub(FS, 'stat');
                sinon.stub(helper, 'build');
                /* --- */
                p = '';
                helper.exec(p);
                expect(helper.options().root).toEqual(cwd);
                //
                p = '.';
                helper.exec(p);
                expect(helper.options().root).toEqual(cwd);
                //
                p = 'toto';
                helper.exec(p);
                expect(helper.options().root).toEqual(Path.join(cwd, p));
                //
                p = Path.join(cwd, 'toto');
                helper.exec(p);
                expect(helper.options().root).toEqual(Path.join(cwd, 'toto'));
                //
                p = Path.join(cwd, '..', '..', 'toto');
                helper.exec(p);
                expect(helper.options().root).toEqual(Path.resolve(cwd, Path.join('..', '..', 'toto')));
                //
                p = Path.join(cwd, '..', '.', '..', 'toto');
                helper.exec(p);
                expect(helper.options().root).toEqual(Path.resolve(cwd, Path.join('..', '.', '..', 'toto')));
                /* --- */
                expect(FS.stat.called).toEqual(true);
                helper.build.restore();
                FS.stat.restore();
            });


            it('returns options with default root', function () {
                helper = new Scandir();
                var defaults = helper.options(),
                    opts = {
                        filters: ['**/*.hml'],
                        added: 'no default'
                    };
                helper.exec(opts);
                result = {
                    depth: 0,
                    root: cwd,
                    added: 'no default',
                    filters: ['**/*.hml']
                };
                expect(helper.options()).toEqual(result);
            });

            it('Q.reject', function (done) {
                var msg = 'Invalid arguments. Aborted.';
                helper = new Scandir();
                helper.exec().then(function (data) {}, function (err) {
                    expect(err.message).toEqual(msg);
                    done();
                });
                helper.exec([]).then(function (data) {}, function (err) {
                    expect(err.message).toEqual(msg);
                    done();
                });
                helper.exec(123).then(function (data) {}, function (err) {
                    expect(err.message).toEqual(msg);
                    done();
                });
                helper.exec(null).then(function (data) {}, function (err) {
                    expect(err.message).toEqual(msg);
                    done();
                });
                helper.exec(undefined).then(function (data) {}, function (err) {
                    expect(err.message).toEqual(msg);
                    done();
                });
            });

            it('reject w/ a FS.stat error', function (done) {
                var path = Path.join(cwd, 'spec', 'expected', 'non_exists');
                helper = new Scandir();
                helper.exec(path).then(function (data) {
                    // no data
                }, function (err) {
                    // returns an FS Error
                    expect(err.hasOwnProperty('path')).toBe(true);
                    expect(err.hasOwnProperty('code')).toBe(true);
                    expect(err.hasOwnProperty('errno')).toBe(true);
                    done();
                });
            });

            it('reject w/ not directory', function (done) {
                var path = Path.join(cwd, 'spec', 'expected', 'not_directory');
                helper = new Scandir();
                helper.exec(path).then(function (data) {
                    // no data
                }, function (err) {
                    // returns an Error
                    expect(err.message).toEqual('Invalid path. Aborted.');
                    done();
                });
            });

            xit('does not reject', function (done) {
                var path = Path.join(cwd, 'spec', 'expected', 'explore_method');
                //
                helper = new Scandir();
                sinon.stub(helper, 'build', function () {
                    var deferred = Q.defer();
                    setTimeout(function () {
                        deferred.resolve('ok');
                    }, 1000);
                    return deferred.promise;
                });
                helper.exec(path).then(function (data) {
                    // no data
                    expect(helper.options().root).toEqual(path);
                    done();
                }, function (err) {
                    // no error
                    console.log(err);
                    done();
                });

                helper.exec(options).then(function (data) {
                    // no data
                    expect(helper.options().filters).toEqual(options.filters);
                    done();
                }, function (err) {
                    // no error
                    console.log(err);
                    done();
                });

                helper.exec(path, options).then(function (data) {
                    // no data
                    expect(helper.options().root).toEqual(path);
                    expect(helper.options().filters).toEqual(options.filters);
                    done();
                }, function (err) {
                    // no error
                    console.log(err);
                    done();
                });
                helper.build.restore();

            });

            it('returns a plainObject w/ basename as property', function (done) {
                var name,
                    path = Path.join(cwd, 'spec', 'expected', 'explore_method');
                name = Utils.dirname(path);
                //
                helper = new Scandir();
                helper.exec(path).then(function (data) {
                    expect(lodash.isPlainObject(data)).toBe(true);
                    // expect(data.name).toEqual(name);
                    done();
                }, function (err) {
                    console.log(err);
                    done();
                });
                //
                path = '.';
                name = 'readmepad';
                helper.exec(path).then(function (data) {
                    expect(lodash.isPlainObject(data)).toBe(true);
                    // expect(data.name).toEqual(name);
                    done();
                }, function (err) {
                    // no error
                    console.log(err);
                    done();
                });
            });
        });

    });

}());
