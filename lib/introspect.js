var path = require('path'),
    Promise = require('pinkie-promise'),
    bemBlocksIntrospect = require('bem-blocks-introspect'),
    bemConfig = new (require('bem-config'))(),
    config = bemConfig.getModule('lib-site-generator');

module.exports = function(pathToLib) {
    var lib = path.basename(pathToLib),
        bemBlocksIntrospectOpts = {
            outputFolder: path.join(config.tempFolder, 'data', lib),
            sets: config.libs[lib] && config.libs[lib].platforms || config.platforms
        };

    return new Promise(function(resolve) {
        bemBlocksIntrospect(pathToLib, bemBlocksIntrospectOpts, resolve);
    });
}
