module.exports = {
    files: {
        provide: require('enb/techs/file-provider'),
        copy: require('enb/techs/file-copy'),
        merge: require('enb/techs/file-merge')
    },
    bem: require('enb-bem-techs'),
    css: {
        stylus: require('enb-stylus/techs/stylus'),
    },
    js: require('enb-js/techs/browser-js'),
    ym: require('enb-modules/techs/prepend-modules'),
    engines: {
        enbxjst: require('enb-xjst/techs/bemhtml'),
        bemhtml: require('enb-bemxjst/techs/bemhtml'),
        bhServer: require('enb-bh/techs/bh-commonjs'),
        bhServerInclude: require('enb-bh/techs/bh-bundle'),
        bhClient: require('enb-bh/techs/bh-bundle')
    },
    html: {
        bemhtml: require('enb-bemxjst/techs/bemjson-to-html'),
        bh: require('enb-bh/techs/bemjson-to-html')
    }
};
