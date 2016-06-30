var path = require('path'),
    mv = require('mv'),
    del = require('del'),
    Promise = require('pinkie-promise'),
    magicPlatform = require('enb-magic-platform'),
    installBowerDeps = require('./lib/install-bower-deps'),
    introspect = require('./lib/introspect'),
    generateDataJson = require('./lib/generate-data-json'),

    bemConfig = require('bem-config')(),
    config = bemConfig.moduleSync('bem-lib-site-data');

module.exports = function(pathToLib) {
    var initialCwd = process.cwd(),
        absPathToLib = path.resolve(pathToLib);

    // NOTE: needed for magicPlatform
    process.chdir(__dirname);
    process.env.BEM_LIB_SITE_GENERATOR_LIB = absPathToLib;

    var lib = path.basename(pathToLib);

    return installBowerDeps(absPathToLib)
        .then(function() {
            return Promise.all([
                introspect(absPathToLib),
                magicPlatform.runTasks(['examples', 'docs'])
            ]);
        })
        .then(function(data) {
            // var introspectionFiles = data[0];

            // move built data to dest folder
            // NOTE: there's no obvious way to build it there beforehand with magicPlatform
            return new Promise(function(resolve, reject) {
                var destPath = path.resolve(initialCwd, config.tempFolder, 'data', lib);

                del(destPath).then(function() {
                    mv(path.resolve('tmp', 'data', lib), destPath, { mkdirp: true }, function(err) {
                        if (err) return reject(err);

                        del('tmp').then(function() {
                            process.chdir(initialCwd);

                            // TODO: fix me!
                            var version = '3.0.0',
                                langs = ['ru', 'en'];

                            generateDataJson(destPath, lib, version, langs, pathToLib).then(function() {
                                resolve();
                            });
                        });
                    });
                });
            });
        })
        .catch(function(err) {
            console.error(err.stack);
        });
};
