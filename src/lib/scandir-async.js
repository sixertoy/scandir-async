/*jslint indent: 4, nomen: true */
/*global require, module, exports, process, console */
(function () {

    'use strict';

    function sortByName(a, b) {
        if (a.name < b.name)
            return -1;
        if (a.name > b.name)
            return 1;
        return 0;
    }

    function sortDirectoryFirst(a, b) {
        if (!a.isdir && !b.isdir) {
            return sortByName(a, b);
        } else {
            return b.isdir - a.isdir;
        }
    }

    function sortFilesFirst(a, b) {
        if (!a.isdir && !b.isdir) {
            return sortByName(a, b);
        } else {
            return a.isdir - b.isdir;
        }
    }

    var dotbase = '.',
        defaults = {
            depth: 0,
            filters: [],
            sorted: false
        },
        //
        // requires
        Q = require('q'),
        FS = require('fs'),
        Path = require('path'),
        util = require('util'),
        chalk = require('chalk'),
        grunt = require('grunt'),
        lodash = require('lodash'),
        Utils = require('./utils'),

        //
        // Object scandir
        scandir = {

            /**
             *
             *
             *
             */
            node: function (base, stats) {
                return {
                    files: [],
                    stats: stats,
                    isdir: false,
                    fullpath: base,
                    name: Utils.dirname(base)
                };
            },

            /**
             *
             *
             *
             */
            arrange: function (files, order) {
                if (arguments.length > 1 && order !== false) {
                    order = lodash.isString(order) ? order.toUpperCase() : 'ASC';
                    if (order === 'ASC' || order === 'DESC') {
                        if (order === 'ASC') {
                            files.sort(sortDirectoryFirst);
                        } else {
                            files.sort(sortFilesFirst);
                        }
                    }
                }
            },

            /**
             *
             * @see https://strongloop.com/strongblog/how-to-compose-node-js-promises-with-q/
             *
             */
            map: function (entries, options, callback) {
                var res, q;
                try {
                    q = new Q();
                    return q.then(function () {
                        // inside a `then`, exceptions will be handled in next onRejected
                        res = entries.map(function (node) {
                            return callback.apply(scandir, [node, options]);
                        });
                        return res;
                    }).all(); // return group promise
                } catch (e) {
                    throw new Error(e);
                }
            },

            /**
             *
             * Verifie qu'un dossier contient des fichiers
             *
             */
            files: function (base) {
                var deferred = Q.defer();
                FS.readdir(base, function (err, files) {
                    if (err) {
                        grunt.log.debug('scandir.files() :: ' + base);
                        deferred.reject(err);

                    } else {
                        files = files.filter(function (file) {
                            return true;
                        });
                        deferred.resolve(files);
                    }
                });
                return deferred.promise;
            },

            /**
             *
             *
             *
             */
            browsable: function (base) {
                var deferred = Q.defer();
                FS.stat(base, function (err, stats) {
                    if (err) {
                        grunt.log.debug('scandir.browsable() :: ' + base);
                        deferred.reject(err);
                    } else {
                        deferred.resolve(stats);
                    }
                });
                return deferred.promise;
            },

            /**
             *
             *
             *
             */
            build: function (node, options) {
                var p, childs, msg, sstats,
                    deferred = Q.defer(),
                    base = node.fullpath;
                //
                // retourne les stats pour un fichier
                scandir.browsable(base).then(function (stats) {
                    // ajout des stats au node
                    // en supprimant les fonctions de l'objet stats
                    node.stats = Utils.stats(stats);
                    // si c'est un fichier
                    if (stats.isFile()) {
                        node.files = false;
                        node.isdir = false;
                        deferred.resolve(node);

                    } else if (stats.isDirectory()) {
                        node.files = [];
                        node.isdir = true;
                        scandir.files(base).then(function (files) {
                            if (!files) {
                                grunt.log.debug('contient pas de fichiers');
                                node.files = false;
                                deferred.resolve(node);

                            } else {
                                node.files = files.map(function (file) {
                                    p = Path.join(base, file);
                                    // creation de l'item du tree
                                    return scandir.node(p, false);
                                });
                                scandir.map(node.files, options, scandir.build).then(function (res) {
                                    if (options.sorted) {
                                        scandir.arrange(node.files, options.sorted);
                                    }
                                    deferred.resolve(node);

                                }, function (err) {
                                    // erreur du chargement de fichier
                                    // console.log(chalk.red.bold(msg));
                                    grunt.log.debug('scandir.build() recursive error');
                                    deferred.reject(err);
                                });

                            }

                        }, function (err) {
                            // erreur du chargement de fichier
                            grunt.log.debug('scandir.build() files error');
                            deferred.reject(err);
                        });

                    } else {
                        msg = 'scandir.build() not a directory and not a file: ' + base;
                        grunt.log.debug(msg);
                        throw new Error(msg);
                    }

                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            },

            /**
             *
             * scandir Entry Point
             *
             */
            exec: function (base, options) {
                var child, msg, root,
                    deferred = Q.defer();

                // si l'argument base n'est pas une string
                // ou n'est pas un objet
                if (arguments.length < 1 || (!lodash.isString(base) && !lodash.isPlainObject(base))) {
                    msg = 'Invalid arguments. Aborted.';
                    deferred.reject(new Error(msg));

                } else {
                    //
                    // si l'argument base
                    // est un objet
                    if (lodash.isPlainObject(base)) {
                        // on transforme options en objet
                        // sur une de valeurs par defaut
                        options = lodash.assign({}, base);
                        base = dotbase;
                    }
                    //
                    // defaults parameters
                    if (lodash.isEmpty(base)) {
                        base = dotbase;
                    }
                    if (!lodash.isPlainObject(options)) {
                        options = {};
                    }

                    // si base n'est pas un chemin absolut
                    if (!Path.isAbsolute(base)) {
                        base = Path.join(process.cwd(), base);
                    }

                    root = Path.normalize(base);
                    options = lodash.assign(defaults, options);

                    FS.stat(root, function (err, stats) {
                        if (err) {
                            deferred.reject(err);

                        } else if (lodash.isEmpty(stats) || !stats.isDirectory()) {
                            msg = 'Invalid path. Aborted.';
                            deferred.reject(new Error(msg));

                        } else {
                            // lancement de la recursive
                            child = scandir.node(root, stats);
                            scandir.build(child, options).then(function () {
                                deferred.resolve(child);

                            }, function (err) {
                                deferred.reject(err);
                            });

                        }
                    });
                }
                return deferred.promise;
            }
        };
    module.exports = scandir;
    exports.exec = scandir.exec;
}());
