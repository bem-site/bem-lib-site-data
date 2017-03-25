var fs = require('fs'),
    path = require('path'),
    naming = require('bem-naming'),
    endpointParser = require('bower-endpoint-parser'),

    configureExampleNodes = require('./bundle-node-configurator'),

    DEFAULT_LANGS = ['ru', 'en'],

    env = process.env,
    pathToLib = env.BEM_LIB_SITE_PATH,
    lib = env.BEM_LIB_SITE_LIB,

    bemConfig = require('bem-config')(),
    config = bemConfig.moduleSync('bem-lib-site') || {},
    libConf = config.libs && config.libs[lib] || {},
    libLangs = process.env.BEM_I18N_LANGS && process.env.BEM_I18N_LANGS.split(' ') || libConf.langs || config.langs,
    bowerConf = fs.existsSync(path.join(pathToLib, 'bower.json')) && require(path.resolve(pathToLib, 'bower.json')) || {},

    platforms = libConf && libConf.platforms || config.platforms || { desktop: ['common.blocks', 'desktop.blocks'] },
    platformsNames = Object.keys(platforms),

    tempFolder = config.data && config.data.tempFolder || 'tmp',
    destFolder = path.join(tempFolder, 'data');

module.exports = function (config) {
    libLangs !== false && config.setLanguages(libLangs || DEFAULT_LANGS);

    config.includeConfig('enb-bem-examples');
    config.includeConfig('enb-bem-docs');

    var examplesConfigurator = config.module('enb-bem-examples')
            .createConfigurator('examples'),
        docsConfigurator = config.module('enb-bem-docs')
            .createConfigurator('docs', 'examples');

    platformsNames.forEach(function(platform) {
        var levels = getLevelsByPlatform(lib, platform);

        configureExampleNodes(config,
            [path.join(destFolder, lib, platform + '.examples/*/*')],
            getExampleLevelsByPlatform(lib, platform),
            platform);

        examplesConfigurator.configure({
            levels: levels,
            destPath: path.join(destFolder, lib, platform + '.examples'),
            techSuffixes: ['examples'],
            fileSuffixes: ['bemjson.js', 'title.txt'],
            inlineBemjson: true,
            processInlineBemjson: wrapInPage
        });

        docsConfigurator.configure({
            levels: levels,
            destPath: path.join(destFolder, lib, platform + '.docs'),
            exampleSets: [path.join(destFolder, lib, platform + '.examples')],
            langs: config.getLanguages(),
            jsdoc: {
                suffixes: ['vanilla.js', 'browser.js', 'js'],
                parser: libConf.jsdoc
            }
        });
    });
};

function getLevelsByPlatform(lib, platform) {
    return [path.join(pathToLib, 'blocks')]
        .concat(platforms[platform].map(function(level) {
            return path.join(pathToLib, level);
        }))
        .concat(platforms[platform].map(function(level) {
            return path.join(pathToLib, level + '.blocks');
        }))
        .concat(platforms[platform].map(function(level) {
            return path.join(pathToLib, 'design', level + '.blocks');
        }))
        .map(function(levelPath) {
            return path.resolve(levelPath);
        })
        .filter(fs.existsSync);
}

function getExampleLevelsByPlatform(lib, platform) {
    var libConfig = config.libs && config.libs[lib] || {},
        // TODO: search for levels recursively in libs
        pathToLibs = (libConfig.deps || bowerConf.dependencies && Object.keys(bowerConf.dependencies)
            .filter(function(dep) { return dep.indexOf('bem-') > -1; }) || [])
            .map(function(depLibName) {
                var parsed = endpointParser.json2decomposed(depLibName);

                depLibName = parsed.name || parsed.source.split('/').pop().split('.')[0];

                return path.join(tempFolder, 'bower', pathToLib.replace(/\.\.\//g, ''), depLibName);
            }).concat(pathToLib);

    var levels = [];

    pathToLibs.forEach(function(libPath) {
        var absLibPath = path.resolve(libPath);

        levels = levels.concat(
            path.join(absLibPath, 'blocks'),
            path.join(absLibPath, 'test.blocks'), // TODO: ломает engino, должно быть вынесено в конфиг
            platforms[platform].map(function(level) {
                return path.join(absLibPath, 'blocks-' + level);
            }),
            platforms[platform].map(function(level) {
                return path.join(absLibPath, level + '.blocks');
            }),
            platforms[platform].map(function(level) {
                return path.join(absLibPath, 'design', level + '.blocks');
            })
        );
    });

    levels.push('examples.blocks');

    return levels.filter(fs.existsSync);
}


function wrapInPage(bemjson, meta) {
    var basename = path.basename(meta.filename, '.bemjson.js');

    if (libConf.coreLib === 'bem-bl') {
        return {
            block: 'b-page',
            title: naming.stringify(meta.notation),
            head: [{ elem: 'css', url: basename + '.css' }],
            content: [
                bemjson,
                { elem: 'js', url: 'https://yastatic.net/jquery/1.8.3/jquery.min.js' },
                { elem: 'js', url: basename + '.js' }
            ]
        };
    }

    return {
        block: 'page',
        title: naming.stringify(meta.notation),
        head: [{ elem: 'css', url: basename + '.css' }],
        scripts: [{ elem: 'js', url: basename + '.js' }],
        mods: { theme: getThemeFromBemjson(bemjson) },
        content: bemjson
    };
}

function getThemeFromBemjson(bemjson) {
    if(typeof bemjson !== 'object') return;

    var theme, key;

    for(key in bemjson) {
        if(theme = key === 'mods'? bemjson.mods.theme :
            getThemeFromBemjson(bemjson[key])) return theme;
    }
}
