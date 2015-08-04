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
        Utils = require(Path.join(cwd, 'src', 'lib', 'utils')),
        scandir = require(Path.join(cwd, 'src', 'lib', 'scandir-async')),
        exec = require(Path.join(cwd, 'src', 'lib', 'scandir-async')).exec;

    describe('scandir', function () {

        describe('scandir.node()', function () {
            it('returns an object', function () {
                var base = cwd,
                    stats = {};
                result = scandir.node(base, stats);
                expect(result).toEqual({
                    files: [],
                    stats: {},
                    isdir: false,
                    fullpath: cwd,
                    name: Utils.dirname(cwd)
                });
            });
        });

        describe('scandir.files/files', function () {

            it('returns Q.promise', function () {
                var promise;
                sinon.stub(Q, 'defer', qPromiseFunc);
                promise = scandir.files('toto');
                expect(promise).toEqual('yo! it\'s a promise');
                Q.defer.restore();
            });

            it('use FS.readdir', function () {
                sinon.stub(FS, 'readdir');
                scandir.files('test_fs_readdir');
                expect(FS.readdir.calledOnce).toEqual(true);
                FS.readdir.restore();
            });

            it('Q.reject called on non existent path', function (done) {
                var msg = 'Invalid path. Aborted';
                scandir.files('test_invalid_path').then(function () {}, function (err) {
                    expect(err.hasOwnProperty('path')).toBe(true);
                    expect(err.hasOwnProperty('code')).toBe(true);
                    expect(err.hasOwnProperty('errno')).toBe(true);
                    done();
                });
            });

            it('Q.resolved with false (no file in folder)', function (done) {
                var no_file_path = Path.join(cwd, 'spec', 'expected', 'files_method', 'nofile');
                scandir.files(no_file_path).then(function (result) {
                    expect(result).toEqual([]);
                    done();
                }, function (err) {});
            });

            it('Q.resolved with array of files (length = 4)', function (done) {
                var no_file_path = Path.join(cwd, 'spec', 'expected', 'files_method', 'threefile');
                scandir.files(no_file_path).then(function (result) {
                    expect(result.length).toEqual(4);
                    done();
                }, function (err) {});

            });

        });

        describe('browsable method (async)', function () {
            it('resolve w/ stats', function (done) {
                var base = Path.join(cwd, 'spec', 'expected', 'explore_method');
                scandir.browsable(base).then(function (stats) {
                    expect(stats.isDirectory()).toEqual(true);
                    done();
                }, function (err) {});
            });
            it('resolve w/ FS.error', function (done) {
                var base = Path.join(cwd, 'spec', 'expected', 'non_exists');
                scandir.browsable(base).then(function () {}, function (err) {
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
                        isdir: true,
                        fullpath: file,
                        name: 'explore_method',
                        stats: FS.statSync(file)
                    };
                scandir.build(base, scandir).then(function (data) {
                    expect(lodash.isPlainObject(data)).toEqual(true);
                    expect(data.files.length).toEqual(4);
                    expect(data.files[0].files).toEqual(false); // index.html

                    expect(data.files[1].isdir).toEqual(true); // subnofiles
                    expect(data.files[1].files).toEqual([]); // subnofiles

                    expect(data.files[2].isdir).toEqual(true); // subone
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
                    expect(data.files[3].files[2].files[0].files[0].files).toEqual(false); // subtwo/subsub/subsubsub/file.css
                    expect(data.files[3].files[2].files[0].files[0].isdir).toEqual(false); // subtwo/subsub/subsubsub/file.css
                    done();
                }, function (err) {});
            });
        });

        describe('scandir.arrange', function () {
            it('not arrange default  sorted:false/undefined', function () {
                var data = [
                        {name: 'autrefichier.js', isdir: false},
                        {name: 'dossier', isdir: true},
                        {name: 'fichier.js', isdir: false}
                    ],
                    res = data.concat([]);
                scandir.arrange(res);
                expect(data).toEqual(res);
                res = data.concat([]);
                scandir.arrange(res, false);
                expect(data).toEqual(res);
            });
            it('arrange directories first sorted:true', function () {
                var data = [
                        {name: 'autrefichier.js', isdir: false},
                        {name: 'dossier', isdir: true},
                        {name: 'fichier.js', isdir: false}
                    ],
                    res = data.concat([]);
                scandir.arrange(res, true);
                data = [
                    {name: 'dossier', isdir: true},
                    {name: 'autrefichier.js', isdir: false},
                    {name: 'fichier.js', isdir: false}
                ];
                expect(data).toEqual(res);
            });
            it('arrange directories first sorted:ASC', function () {
                var data = [
                        {name: 'autrefichier.js', isdir: false},
                        {name: 'dossier', isdir: true},
                        {name: 'fichier.js', isdir: false}
                    ],
                    res = data.concat([]);
                scandir.arrange(res, 'ASC');
                data = [
                    {name: 'dossier', isdir: true},
                    {name: 'autrefichier.js', isdir: false},
                    {name: 'fichier.js', isdir: false}
                ];
                expect(data).toEqual(res);
            });
            it('arrange files first sorted:DESC', function () {
                var data = [
                        {name: 'autrefichier.js', isdir: false},
                        {name: 'dossier', isdir: true},
                        {name: 'fichier.js', isdir: false}
                    ],
                    res = data.concat([]);
                scandir.arrange(res, 'DESC');
                data = [
                    {name: 'autrefichier.js', isdir: false},
                    {name: 'fichier.js', isdir: false},
                    {name: 'dossier', isdir: true}
                ];
                expect(data).toEqual(res);
            });
        });

        describe('scandir/exec/scandir.exec', function () {

            it('returns Q.promise', function () {
                sinon.stub(FS, 'stat');
                sinon.stub(scandir, 'build');
                sinon.stub(Q, 'defer', qPromiseFunc);
                result = scandir.exec('toto');
                expect(result).toEqual('yo! it\'s a promise');
                scandir.build.restore();
                FS.stat.restore();
                Q.defer.restore();
            });

            it('reject w/ a FS.stat error', function (done) {
                var path = Path.join(cwd, 'spec', 'expected', 'non_exists');
                scandir.exec(path).then(function (data) {}, function (err) {
                    expect(err.hasOwnProperty('path')).toBe(true);
                    expect(err.hasOwnProperty('code')).toBe(true);
                    expect(err.hasOwnProperty('errno')).toBe(true);
                    done();
                });
            });

            it('reject w/ not directory', function (done) {
                var path = Path.join(cwd, 'spec', 'expected', 'not_directory');
                scandir.exec(path).then(function (data) {}, function (err) {
                    expect(err.message).toEqual('Invalid path. Aborted.');
                    done();
                });
            });

            it('Q.reject', function (done) {
                var msg = 'Invalid arguments. Aborted.';
                exec().then(function (data) {}, function (err) {
                    expect(err.message).toEqual(msg);
                    done();
                });
                exec([]).then(function (data) {}, function (err) {
                    expect(err.message).toEqual(msg);
                    done();
                });
                exec(123).then(function (data) {}, function (err) {
                    expect(err.message).toEqual(msg);
                    done();
                });
                exec(null).then(function (data) {}, function (err) {
                    expect(err.message).toEqual(msg);
                    done();
                });
                exec(undefined).then(function (data) {}, function (err) {
                    expect(err.message).toEqual(msg);
                    done();
                });
            });

            it('returns a plainObject w/ basename as property', function (done) {
                var name,
                    path = Path.join(cwd, 'spec', 'expected', 'explore_method');
                name = Utils.dirname(path);
                scandir.exec(path).then(function (data) {
                    expect(lodash.isPlainObject(data)).toBe(true);
                    expect(data.name).toEqual(name);
                    done();
                }, function (err) {});
            });

            it('returns a plainObject w/ basename as property dot base', function (done) {
                var path = '.',
                    name = Utils.dirname(cwd); //scandir
                scandir.exec(path).then(function (data) {
                    expect(lodash.isPlainObject(data)).toBe(true);
                    expect(data.name).toEqual(name);
                    expect(data.name).toEqual('scandir-async');
                    done();
                }, function (err) {});
            });
        });

        describe('scandir sorted', function () {

            it('not sorted', function (done) {
                var map,
                    res = ['anotherfolder', 'autrefichier.js', 'file.js', 'simplefolder'],
                    path = Path.join(cwd, 'spec', 'expected', 'sorted'); //scandir
                scandir.exec(path, {
                    sorted: false
                }).then(function (data) {
                    map = data.files.map(function (item) {
                        return item.name;
                    });
                    expect(map).toEqual(res);
                    done();
                }, function (err) {});
            });

            it('sorted folder first', function (done) {
                var map,
                    res = ['anotherfolder', 'simplefolder', 'autrefichier.js', 'file.js'],
                    path = Path.join(cwd, 'spec', 'expected', 'sorted'); //scandir
                scandir.exec(path, {
                    sorted: true
                }).then(function (data) {
                    map = data.files.map(function (item) {
                        return item.name;
                    });
                    expect(map).toEqual(res);
                    done();
                }, function (err) {});
            });

            it('sorted folder "ASC"', function (done) {
                var map,
                    res = ['anotherfolder', 'simplefolder', 'autrefichier.js', 'file.js'],
                    path = Path.join(cwd, 'spec', 'expected', 'sorted'); //scandir
                scandir.exec(path, {
                    sorted: 'ASC'
                }).then(function (data) {
                    map = data.files.map(function (item) {
                        return item.name;
                    });
                    expect(map).toEqual(res);
                    done();
                }, function (err) {});
            });

            it('sorted folder "DESC"', function (done) {
                var map,
                    res = ['autrefichier.js', 'file.js', 'anotherfolder', 'simplefolder'],
                    path = Path.join(cwd, 'spec', 'expected', 'sorted'); //scandir
                scandir.exec(path, {
                    sorted: 'DESC'
                }).then(function (data) {
                    map = data.files.map(function (item) {
                        return item.name;
                    });
                    expect(map).toEqual(res);
                    done();
                }, function (err) {});
            });

            it('subdir sorted list', function (done) {
                var map,
                    res = ['dossier', 'autrefichier.js', 'fichier.js'],
                    path = Path.join(cwd, 'spec', 'expected', 'sorted'); //scandir
                scandir.exec(path, {
                    sorted: true
                }).then(function (data) {
                    map = data.files[0].files.map(function (item) {
                        return item.name;
                    });
                    expect(map).toEqual(res);
                    done();
                }, function (err) {});
            });

        });

    });

}());
