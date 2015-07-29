/*jshint unused: false */
/*jslint indent: 4 */
/*global jasmine, process, require, define, describe, xdescribe, it, xit, expect, beforeEach, afterEach, afterLast */
(function () {

    'use strict';

    var result, helper, base, stats,
        cwd = process.cwd(),
        OS = require('os'),
        FS = require('fs'),
        Path = require('path'),
        sinon = require('sinon'),
        Utils = require(Path.join(cwd, 'src', 'lib', 'utils'));

    describe('Utils', function () {

        describe('stats', function () {
            describe('as object for a directory', function () {
                base = Path.join(cwd, 'spec', 'expected');
                stats = FS.statSync(base);
                result = Utils.stats(stats);
                it('returns an object', function () {
                    expect(result).toEqual(jasmine.any(Object));
                });
                it('dev', function () {
                    expect(result.dev).toEqual(jasmine.any(Number));
                });
                it('ino', function () {
                    expect(result.ino).toEqual(jasmine.any(Number));
                });
                it('mode', function () {
                    expect(result.mode).toEqual(jasmine.any(Number));
                });
                it('nlink', function () {
                    expect(result.nlink).toEqual(jasmine.any(Number));
                });
                it('uid', function () {
                    expect(result.uid).toEqual(jasmine.any(Number));
                });
                it('gid', function () {
                    expect(result.gid).toEqual(jasmine.any(Number));
                });
                it('rdev', function () {
                    expect(result.rdev).toEqual(jasmine.any(Number));
                });
                it('size', function () {
                    expect(result.size).toEqual(jasmine.any(Number));
                });
                xit('blksize', function () {
                    expect(result.blksize).toEqual(undefined);
                });
                xit('blocks', function () {
                    expect(result.blocks).toEqual(undefined);
                });
                it('atime', function () {
                    expect(result.atime).toEqual(jasmine.any(Number));
                });
                it('mtime', function () {
                    expect(result.mtime).toEqual(jasmine.any(Number));
                });
                it('ctime', function () {
                    expect(result.ctime).toEqual(jasmine.any(Number));
                });
                it('birthtime', function () {
                    expect(result.birthtime).toEqual(jasmine.any(Number));
                });
            });
        });

        describe('dirname', function () {

            it('returns on linux', function () {
                base = 'file/to/point';
                result = Utils.dirname(base, '/');
                expect(result).toEqual('point');
            });

            it('returns on windows', function () {
                base = 'file\\to\\point';
                result = Utils.dirname(base, '\\');
                expect(result).toEqual('point');
            });

            it('returns on windows native', function () {
                if (OS.platform().toLocaleLowerCase() === 'win32') {
                    base = 'file\\to\\point';
                    result = Utils.dirname(base);
                    expect(result).toEqual('point');
                } else {
                    base = 'file/to/point';
                    result = Utils.dirname(base);
                    expect(result).toEqual('point');
                }
            });

        });

    });

}());
