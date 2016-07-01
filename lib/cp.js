var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp');

module.exports = function cp(what, where) {
    return new Promise(function(resolve, reject) {
        mkdirp(path.dirname(where), function(err) {
            if (err) reject(err);

            fs.createReadStream(what).pipe(fs.createWriteStream(where))
                .on('finish', resolve)
                .on('error', reject);
        });
    });
};