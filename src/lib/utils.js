/*jslint indent: 4, nomen: true */
/*global require, module, exports, process */
(function () {

    'use strict';

    var Path = require('path'),
        utils = {
            /*
            remove: function (arr, find) {
                var index = arr.indexOf(find);
                if (index > -1) {
                    arr.splice(index, 1);
                }
                return arr;
            },
            */
            dirname: function (base, sep) {
                if (arguments.length < 2) {
                    base = Path.normalize(base);
                }
                sep = sep || Path.sep;
                var result, reg,
                    ps = (sep === '\\') ? '\\\\' : '/';
                reg = new RegExp(ps + '(?:.(?!' + ps + '))+$', 'gi');
                result = base.match(reg);
                return result[0].replace(sep, '');
            },
            stats: function (stats) {
                return {
                    dev: stats.dev,
                    ino: stats.ino,
                    uid: stats.uid,
                    gid: stats.gid,
                    rdev: stats.rdev,
                    size: stats.size,
                    mode: stats.mode,
                    nlink: stats.nlink,
                    blocks: stats.blocks,
                    blksize: stats.blksize,
                    atime: Date.parse(stats.atime),
                    mtime: Date.parse(stats.mtime),
                    ctime: Date.parse(stats.ctime),
                    birthtime: Date.parse(stats.birthtime)
                };
            }
        };
    module.exports = utils;
}());
