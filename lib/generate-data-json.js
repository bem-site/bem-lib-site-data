var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    walk = require('bem-walk'),
    Promise = require('pinkie-promise'),
    getLibDocs = require('./get-lib-docs');

// TODO: check args
module.exports = function(pathToLibData, lib, version, pathToLib) {
    var platform = 'desktop'; // TODO: fixme

    var docs = glob.sync(path.join(pathToLibData, '*.docs')),
        examples = glob.sync(path.join(pathToLibData, '*.examples'));

    var docsWalker = walk(docs),
        sets = {},
        result = {
            library: lib,
            version: version,
            sets: sets,
        };

    return new Promise(function(resolve, reject) {
        docsWalker
            .on('data', function(item) {
                var set = path.basename(item.level).split('.')[0];
                sets[set] || (sets[set] = {});

                var block = item.entity.block;
                sets[set][block] || (sets[set][block] = {});
                sets[set][block][item.tech] = path.relative(pathToLibData, item.path);
            })
            .on('error', function(err) { reject(err); })
            .on('end', function() {
                examples.forEach(function(exampleSet) {
                    var set = path.basename(exampleSet).split('.')[0];
                    var setExamples = glob.sync(path.join(exampleSet, '*'));
                    setExamples.forEach(function(pathToBlockExamples) {
                        var block = path.basename(pathToBlockExamples);

                        sets[set] || (sets[set] = {});
                        sets[set][block] || (sets[set][block] = {});
                        sets[set][block].examples || (sets[set][block].examples = {});

                        var blockExamples = glob.sync(path.join(pathToBlockExamples, '*'));

                        blockExamples.forEach(function(pathToBlockExample) {
                            var blockExample = path.basename(pathToBlockExample);
                            sets[set][block].examples[blockExample] = glob.sync(path.join(pathToBlockExample, '*'))
                                .map(function(pathToExamples) {
                                    return path.relative(pathToLibData, pathToExamples);
                                });
                        });
                    });
                });

                getLibDocs(pathToLib, pathToLibData).then(function(libDocs) {
                    result.docs = libDocs;

                    fs.writeFile(path.join(pathToLibData, 'data.json'), JSON.stringify(result, null, 4), function(err) {
                        if (err) return reject(err);
                        resolve(result);
                    });
                }).catch(console.error.bind(console));
            });
    });
};
