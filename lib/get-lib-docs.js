var fs = require('fs'),
    path = require('path'),
    Promise = require('pinkie-promise'),
    cp = require('./cp'),
    bemConfig = require('bem-config')(),
    config = bemConfig.moduleSync('bem-lib-site-data');

module.exports = function getLibDocs(pathToLib) {
    var lib = path.basename(pathToLib),
        langs = config.libs[lib] && config.libs[lib].langs || config.langs,
        queue = [];

    var libDocs = ['readme', 'changelog', 'migration'].reduce(function(acc, fileType) {
        langs && langs.forEach(function(lang) {
            var pathToFile = path.join(pathToLib, fileType + '.' + lang + '.md');
            if (!fs.existsSync(pathToFile)) return;

            queue.push(storeDocFile(lib, fileType, pathToFile, lang, acc));
        });

        var pathToFile = path.join(pathToLib, fileType + '.md');
        fs.existsSync(pathToFile) && queue.push(storeDocFile(lib, fileType, pathToFile, '', acc));

        return acc;
    }, {});

    return Promise.all(queue).then(function() {
        return libDocs;
    });
};

function storeDocFile(lib, fileType, pathToFile, lang, result) {
    var filename = path.basename(pathToFile),
        copyTo = path.join(config.outputFolder, 'data', lib, filename);

    result[fileType] || (result[fileType] = {});
    result[fileType][lang] = filename;

    return cp(pathToFile, copyTo);
}
