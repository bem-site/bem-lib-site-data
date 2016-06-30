var fs = require('fs'),
    path = require('path');

function getLibDocs(pathToLib, langs) {
    return ['readme', 'changelog', 'migration']
        .reduce(function(acc, filename) {
            langs.forEach(function(lang) {
                var pathToFile = path.join(pathToLib, filename + '.' + lang + '.md');
                if (!fs.existsSync(pathToFile)) return;
                acc[filename] || (acc[filename] = {});
                acc[filename][lang] = pathToFile;
            });

            if (fs.existsSync(filename + '.md')) {
                acc[filename] || (acc[filename] = {});
                acc[filename][''] = filename + '.md';
            }

            return acc;
        }, {});
};

module.exports = getLibDocs;
