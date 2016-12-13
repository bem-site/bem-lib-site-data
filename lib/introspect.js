var path = require('path'),
    Promise = require('pinkie-promise'),
    bemBlocksIntrospect = require('bem-blocks-introspect'),
    bemConfig = require('bem-config')(),
    config = bemConfig.moduleSync('bem-lib-site') || {},
    libs = config.libs || {};

module.exports = function(pathToLib) {
    var lib = path.basename(pathToLib),
        tempDirectory = config.data && config.data.tempFolder || 'tmp',
        bemBlocksIntrospectOpts = {
            outputFolder: path.join(process.cwd(), tempDirectory, 'data', lib),
            sets: libs[lib] && config.libs[lib].platforms || config.platforms || { desktop: ['common.blocks', 'desktop.blocks'] }
        };

    return bemBlocksIntrospect(pathToLib, bemBlocksIntrospectOpts)
        .catch(function(err) {
            console.error('Error in introspection', err);
            throw new Error(err);
        });
}
