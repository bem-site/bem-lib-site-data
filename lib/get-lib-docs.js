var fs = require('fs'),
    path = require('path');

function getLibDocs(pathToLib, langs) {
    return ['readme', 'changelog', 'migration']
        .reduce(function(acc, filename) {
            var possibilities = [];

            langs.forEach(function(lang) {
                possibilities.push(filename + '.' + lang + '.md');
            });

            possibilities.push(filename + '.md');

            var found = possibilities
                .map(function(filename) {
                    return path.join(pathToLib, filename);
                })
                .filter(fs.existsSync);

            found.length && (acc[filename] = found);

            return acc;
        }, {});
};

module.exports = getLibDocs;
