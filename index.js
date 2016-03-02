var path = require('path'),
    mv = require('mv'),
    del = require('del'),
    magicPlatform = require('enb-magic-platform'),
    installBowerDeps = require('./lib/install-bower-deps'),
    introspect = require('./lib/introspect'),

    bemConfig = new (require('bem-config'))(),
    config = bemConfig.getModule('lib-site-generator');

module.exports = function(pathToLib) {
    var initialCwd = process.cwd(),
        absPathToLib = path.resolve(pathToLib);

    // NOTE: needed for magicPlatform
    process.chdir(__dirname);
    process.env.BEM_LIB_SITE_GENERATOR_LIB = absPathToLib;

    var lib = path.basename(pathToLib);

    return installBowerDeps(absPathToLib)
        .then(function() {
            return introspect(absPathToLib);
        })
        .then(function() {
            return magicPlatform.runTasks('examples');
        })
        .then(function() {
            return magicPlatform.runTasks('docs');
        })
        .then(function() {
            // move built data to dest folder
            // NOTE: there's no obvious way to build it there beforehand with magicPlatform
            return new Promise(function(resolve, reject) {
                var destPath = path.resolve(initialCwd, config.tempFolder, 'data', lib);

                del(destPath).then(function() {
                    mv(path.resolve('tmp', 'data', lib), destPath, { mkdirp: true }, function(err) {
                        if (err) return reject(err);

                        del('tmp').then(function() {
                            process.chdir(initialCwd);
                            resolve();
                        });
                    });
                });
            });
        })
        .catch(function(err) {
            console.error(err.stack);
        });
};
