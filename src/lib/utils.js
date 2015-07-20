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
            }
        };
    module.exports = utils;
}());
