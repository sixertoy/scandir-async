/*jshint unused: false */
/*jslint indent: 4 */
/*global jasmine, process, require, define, describe, xdescribe, it, xit, expect, beforeEach, afterEach, afterLast */
(function () {

    'use strict';

    var result, helper, base,
        cwd = process.cwd(),
        OS = require('os'),
        Path = require('path'),
        sinon = require('sinon'),
        Utils = require(Path.join(cwd, 'src', 'server', 'lib', 'utils'));

    describe('Utils', function () {

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
