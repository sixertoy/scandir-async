/*jslint indent: 4, nomen: true */
/*global require, module, exports, process, console */
(function () {

    'use strict';

    var dotbase = '.',
        // requires
        Q = require('q'),
        FS = require('fs'),
        Path = require('path'),
        Util = require('util'),
        chalk = require('chalk'),
        grunt = require('grunt'),
        lodash = require('lodash'),
        Utils = require('./utils'),
        //
        // Object ScandirAsync
        ScandirAsync = function () {

            /**
             *
             * defaults
             *
             */
            this.root = dotbase;
            this.defaults = {
                depth: 0,
                filters: []
            };

            /**
             *
             *
             *
             */
            this.options = function () {
                return lodash.assign({
                    root: this.root
                }, this.defaults);
            };

            /**
             *
             * @see https://strongloop.com/strongblog/how-to-compose-node-js-promises-with-q/
             *
             */
            this.map = function (entries, callback) {
                var $this = this;
                try {
                    var q = new Q();
                    return q.then(function () {
                        // inside a `then`, exceptions will be handled in next onRejected
                        return entries.map(function (node) {
                            return callback.apply($this, [node]);
                        });
                    }).all(); // return group promise
                } catch (e) {
                    throw new Error(e);
                }
            };

            /**
             *
             * Verifie qu'un dossier contient des fichiers
             *
             */
            this.files = function (base) {
                var deferred = Q.defer(),
                    relative = Path.relative(process.cwd(), base);

                FS.readdir(relative, function (err, files) {
                    if (err) {
                        grunt.log.debug('ScandirAsync.files() :: ' + relative);
                        deferred.reject(err);

                    } else {
                        if (files.length) {
                            deferred.resolve(files);
                        } else {
                            deferred.resolve(false);
                        }
                    }
                });
                return deferred.promise;
            };

            /**
             *
             *
             *
             */
            this.browsable = function (base) {
                var deferred = Q.defer(),
                    relative = Path.relative(process.cwd(), base);

                FS.stat(relative, function (err, stats) {
                    if (err) {
                        grunt.log.debug('ScandirAsync.browsable() :: ' + relative);
                        deferred.reject(err);
                    } else {
                        deferred.resolve(stats);
                    }
                });
                return deferred.promise;
            };

            /**
             *
             *
             *
             */
            this.build = function (node) {
                var p, childs, msg,
                    $this = this,
                    deferred = Q.defer(),
                    base = node.fullpath;
                //
                // retourne les stats pour un fichier
                $this.browsable(base).then(function (stats) {
                    // ajout des stats au node
                    node.stats = stats;
                    // si c'est un fichier
                    if (stats.isFile()) {
                        // console.log('file.name => ' + node.name);
                        node.files = false;
                        deferred.resolve(node);

                    } else if (stats.isDirectory()) {
                        // console.log('dir.name => ' + node.name);
                        node.files = [];
                        $this.files(base).then(function (files) {
                            if (!files) {
                                grunt.log.debug('contient pas de fichiers');
                                node.files = false;
                                deferred.resolve(node);

                            } else {
                                node.files = files.map(function (file) {
                                    p = Path.join(base, file);
                                    return $this.node(p, false);
                                });
                                $this.map(node.files, $this.build).then(function (res) {
                                    deferred.resolve(node);

                                }, function (err) {
                                    // erreur du chargement de fichier
                                    // console.log(chalk.red.bold(msg));
                                    grunt.log.debug('ScandirAsync.build() recursive error');
                                    deferred.reject(err);
                                });

                            }

                        }, function (err) {
                            // erreur du chargement de fichier
                            grunt.log.debug('ScandirAsync.build() files error');
                            deferred.reject(err);
                        });

                    } else {
                        msg = 'ScandirAsync.build() not a directory and not a file: ' + base;
                        grunt.log.debug(msg);
                        throw new Error(msg);
                    }

                }, function (err) {
                    // erreur du chargement de fichier
                    // msg = 'ScandirAsync.build() browsable error';
                    // console.log(chalk.red.bold(msg));
                    deferred.reject(err);
                });
                return deferred.promise;
            };

            /**
             *
             *
             *
             */
            this.node = function (base, stats) {
                // construction de l'objet
                var data = {
                    files: [],
                    stats: stats,
                    fullpath: base,
                    name: Utils.dirname(base)
                };
                return data;
            };

            /**
             *
             * ScandirAsync Entry Point
             *
             */
            this.exec = function (pBase, pOptions) {
                var child, msg,
                    main = {},
                    $this = this,
                    deferred = Q.defer();
                //
                // si l'argument base n'est pas une string
                // ou n'est pas un objet
                if (!lodash.isString(pBase) && !lodash.isPlainObject(pBase)) {
                    msg = 'Invalid arguments. Aborted.';
                    deferred.reject(new Error(msg));
                }
                //
                // si l'argument base
                // est un objet
                if (lodash.isPlainObject(pBase)) {
                    // on transforme options en objet
                    // sur une de valeurs par defaut
                    pOptions = lodash.assign({}, pBase);
                    pBase = this.root;
                }
                //
                // defaults parameters
                if (lodash.isEmpty(pBase)) {
                    pBase = this.root;
                }
                if (!lodash.isPlainObject(pOptions)) {
                    pOptions = {};
                }
                // si base n'est pas un chemin absolut
                if (!Path.isAbsolute(pBase)) {
                    pBase = Path.join(process.cwd(), pBase);
                }

                this.root = Path.normalize(pBase);
                this.defaults = lodash.assign(this.defaults, pOptions);

                FS.stat(this.root, function (err, stats) {
                    if (err) {
                        deferred.reject(err);
                    } else if (lodash.isEmpty(stats) || !stats.isDirectory()) {
                        msg = 'Invalid path. Aborted.';
                        deferred.reject(new Error(msg));
                    } else {
                        // lancement de la recursivite
                        child = $this.node($this.root, stats);
                        // console.log(child);
                        //
                        $this.build(child).then(function () {
                            // renvoi de l'objet main
                            main[child.name] = child;
                            deferred.resolve(main);

                        }, function (err) {
                            deferred.reject(err);

                        });

                    }
                });
                return deferred.promise;
            };

        };

    module.exports = ScandirAsync;

}());