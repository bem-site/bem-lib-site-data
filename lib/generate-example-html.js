var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    hljs = require('highlight.js'),
    beautify = require('js-beautify'),
    nodeEval = require('node-eval'),
    stringifyObject = require('stringify-object'),
    stringifyObjectOpts = { indent: '    ' };

function getBemjson(examplePath) {
    return nodeEval(fs.readFileSync(examplePath + '.bemjson.js', 'utf8'));
}

function getHtml(examplePath, bemjson) {
    var html;

    // TODO: support BEMHTML optionally
    try {
        html = require(examplePath + '.bh.js').apply(bemjson);
    } catch(e) {
        // console.log('No example file', pathToBundle + '.bh.js', 'was found, falling back to BEMHTML...');
        try {
            html = require(examplePath + '.bemhtml.js').BEMHTML.apply(bemjson);
        } catch(e) {
            console.error(e);
            console.error('Error: Cannot apply templates', pathToBundle + '.bemhtml.js');
            return '<pre>' + e.stack + '</pre>';
        }
    }

    return hljs.highlight('xml', beautify.html(html)).value;
}

function getDeps(examplePath, exampleName) {
    var exampleDir = path.dirname(path.dirname(examplePath)),
        blockName = path.basename(exampleDir),
        blockDocsDir = exampleDir.replace(/\/(.*?)\.examples\//, '/$1.docs/'),
        dataPath = path.join(blockDocsDir, blockName + '.data.json'),
        data = require(dataPath),
        examples = data.en.examples, // FIXME: упячка
        deps = [];

    for (var i = 0, l = examples.length; i < l; i++) {
        if (examples[i].name === exampleName) {
            deps = examples[i].entityDeps;
            break;
        }
    }

    return hljs.highlight('js', stringifyObject(deps, stringifyObjectOpts)).value;
}

module.exports = function generateExampleHTML(pathToExampleFolder) {
    var exampleName = path.basename(pathToExampleFolder);
        examplePath = path.join(pathToExampleFolder, exampleName);
        outputPath = pathToExampleFolder.replace(/\/(.*?)\.examples\//, '/$1.html/');

    mkdirp.sync(path.dirname(outputPath));

    var bemjson = getBemjson(examplePath);
    fs.writeFileSync(outputPath + '.bemjson.html', hljs.highlight('js', stringifyObject(bemjson, stringifyObjectOpts)).value);

    var html = getHtml(examplePath, bemjson);
    fs.writeFileSync(outputPath + '.html.html', html);

    var deps = getDeps(examplePath, exampleName);
    fs.writeFileSync(outputPath + '.deps.html', deps);
};
