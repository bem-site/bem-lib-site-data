var fs = require('fs'),
    path = require('path'),
    techs = require('./techs'),

    // TODO: toggle default
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
                target : '?.borschik.browser.js',
                sourceSuffixes : ['vanilla.js', 'js', 'browser.js'],
                filesTarget : '?.js.files'
            }],
            [techs.borschik, {
                source: '?.borschik.browser.js',
                target: '?.browser.js',
                minify: false
            }],
            [techs.files.merge, {
                target : '?.pre.js',
                sources : [
                    '?.browser.' + (BEM_TEMPLATE_ENGINE === 'BH'? 'bh' : 'bemhtml') + '.js',
                    '?.browser.js'
                ]
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

        function getXjstTechsByEngine(engine, opts) {
            var engineKey = {
                BEMHTML: 'bemhtml',
                BEMHTML_OLD: 'bemhtmlOld'
            }[engine] || 'enbxjst'; // TODO: toggle default

            return [techs.engines[engineKey], Object.assign({
                compat: true,
                devMode : false,
                sourceSuffixes: ['bemhtml', 'bemhtml.js'],
                forceBaseTemplates: true
            }, opts)];
        }

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
            }] : getXjstTechsByEngine(BEM_TEMPLATE_ENGINE, {
                target : '?.browser.bemhtml.js',
                filesTarget : '?.template.files'
            })
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
        ] : [
            getXjstTechsByEngine(BEM_TEMPLATE_ENGINE),
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
