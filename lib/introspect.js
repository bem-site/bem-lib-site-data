var path = require('path'),
    Promise = require('pinkie-promise'),
    bemBlocksIntrospect = require('bem-blocks-introspect'),
    bemConfig = require('bem-config')(),
    config = bemConfig.moduleSync('bem-lib-site-data') || {},
    libs = config.libs || {};

module.exports = function(pathToLib) {
    var lib = path.basename(pathToLib),
        bemBlocksIntrospectOpts = {
            outputFolder: path.join(process.cwd(), 'tmp', 'data', lib),
            sets: libs[lib] && config.libs[lib].platforms || config.platforms
        };

    return new Promise(function(resolve) {
        bemBlocksIntrospect(pathToLib, bemBlocksIntrospectOpts, resolve);
    }).catch(function(err) {
        console.error('ERROR', err);
        throw new Error(err);
    });
}
