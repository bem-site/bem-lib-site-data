var fs = require('fs'),
    path = require('path'),
    techs = require('./techs'),

    BEM_TEMPLATE_ENGINE = process.env.BEM_TEMPLATE_ENGINE || 'BH';

var platform = 'desktop'; // FIXME: !

module.exports = function(config, nodes, levels) {
    config.nodes(nodes, function(nodeConfig) {
        var nodeDir = nodeConfig.getNodePath(),
            blockName = path.basename(path.dirname(nodeDir)),
            blockSublevelDir = path.join(nodeDir, blockName + '.blocks'),

            exampleName = path.basename(nodeDir),
            sublevelDir = path.join(nodeDir, exampleName + '.blocks'),

            extendedLevels = [].concat(levels); // TODO: check if it's proper levels

        if(fs.existsSync(blockSublevelDir)) {
            extendedLevels.push(blockSublevelDir);
        }

        if(fs.existsSync(sublevelDir)) {
            extendedLevels.push(sublevelDir);
        }

        nodeConfig.addTech([techs.bem.levels, { levels : extendedLevels }]);

        var langs = config.getLanguages();

        // Base techs
        nodeConfig.addTechs([
            [techs.bem.bemjsonToBemdecl],
            [techs.bem.depsOld],
            [techs.bem.files]
        ]);

        // Client techs
        nodeConfig.addTechs([
            [techs.css.stylus, {
                autoprefixer: {
                    browsers: getBrowsers(platform)
                },
                url: 'inline',
                compress: true
            }],
            [techs.css.stylus, {
                target : '?.ie.css',
                sourceSuffixes : ['styl', 'ie.styl'],
                autoprefixer: {
                    browsers: getBrowsers(platform)
                },
                url: 'inline',
                compress: true
            }],
            [techs.js, {
                target : '?.browser.js',
                sourceSuffixes : ['vanilla.js', 'js', 'browser.js'],
                filesTarget : '?.js.files'
            }],
            [techs.files.merge, {
                target : '?.pre.js',
                sources : [BEM_TEMPLATE_ENGINE === 'BH'? '?.browser.bh.js' : '?.browser.bemhtml.js', '?.browser.js']
            }],

            // TODO: look to options
            // no need for ym for bem-bl based projects

            [techs.ym, {
                source : '?.pre.js',
                target : '?.js'
            }]
        ]);

        // js techs
        nodeConfig.addTechs([
            [techs.bem.depsByTechToBemdecl, {
                target : '?.js-js.bemdecl.js',
                sourceTech : 'js',
                destTech : 'js'
            }],
            [techs.bem.mergeBemdecl, {
                sources : ['?.bemdecl.js', '?.js-js.bemdecl.js'],
                target : '?.js.bemdecl.js'
            }],
            [techs.bem.depsOld, {
                target : '?.js.deps.js',
                bemdeclFile : '?.js.bemdecl.js'
            }],
            [techs.bem.files, {
                depsFile : '?.js.deps.js',
                filesTarget : '?.js.files',
                dirsTarget : '?.js.dirs'
            }]
        ]);

        // Client Template Engine
        nodeConfig.addTechs([
            [techs.bem.depsByTechToBemdecl, {
                target : '?.template.bemdecl.js',
                sourceTech : 'js',
                destTech : 'bemhtml'
            }],
            [techs.bem.depsOld, {
                target : '?.template.deps.js',
                bemdeclFile : '?.template.bemdecl.js'
            }],
            [techs.bem.files, {
                depsFile : '?.template.deps.js',
                filesTarget : '?.template.files',
                dirsTarget : '?.template.dirs'
            }],
            BEM_TEMPLATE_ENGINE === 'BH'? [techs.engines.bhClient, {
                target : '?.browser.bh.js',
                filesTarget : '?.template.files',
                bhOptions: {
                    jsAttrName : 'data-bem',
                    jsAttrScheme : 'json'
                },
                mimic : 'BEMHTML'
            }] : BEM_TEMPLATE_ENGINE === 'BEMHTML'? [techs.engines.bemhtml, {
                target : '?.browser.bemhtml.js',
                filesTarget : '?.template.files',
                compat: true,
                devMode : false,
                sourceSuffixes: ['bemhtml', 'bemhtml.js'],
                forceBaseTemplates: true
            }] : [techs.engines.enbxjst, {
                target : '?.browser.bemhtml.js',
                filesTarget : '?.template.files',
                compat: true,
                devMode : false
            }]
        ]);

        // Build htmls
        nodeConfig.addTechs(BEM_TEMPLATE_ENGINE === 'BH'? [
            [techs.engines.bhServerInclude, {
                bhOptions: {
                    jsAttrName : 'data-bem',
                    jsAttrScheme : 'json'
                }
            }],
            [techs.html.bh]
        ] : BEM_TEMPLATE_ENGINE === 'BEMHTML'? [
            [techs.engines.bemhtml, {
                devMode : false,
                compat : true,
                sourceSuffixes: ['bemhtml', 'bemhtml.js']
            }],
            [techs.html.bemhtml]
        ] : [
            [techs.engines.enbxjst, { devMode : false, compat : true }],
            [techs.html.bemhtml]
        ]);

        langs && langs.forEach(function(lang) {
            var destTarget = '?.' + lang + '.html';

            nodeConfig.addTech([techs.files.copy, { source : '?.html', target : destTarget }]);
            nodeConfig.addTarget(destTarget);
        });

        nodeConfig.addTargets([
            '?.css', '?.ie.css', '?.js', '?.html'
        ]);
    });
};

function getBrowsers(platform) {
    switch(platform) {
        case 'desktop':
            return [
                'last 2 versions',
                'ie 10',
                'ff 24',
                'opera 12.1'
            ];
        case 'touch':
            return [
                'android 4',
                'ios >= 5',
                'ie 10'
            ];
        case 'touch-pad':
            return [
                'android 4',
                'ios 5'
            ];
        case 'touch-phone':
            return [
                'android 4',
                'ios 6',
                'ie 10'
            ];
    }
}
