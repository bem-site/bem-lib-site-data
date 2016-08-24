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
    js: require('enb-borschik/techs/js-borschik-include'),
    ym: require('enb-modules/techs/prepend-modules'),
    engines: {
        enbxjst: require('enb-xjst/techs/bemhtml'),
        bemhtmlOld: require('enb-bemxjst-1x/techs/bemhtml'),
        bemhtml: require('enb-bemxjst/techs/bemhtml'),
        bhServer: require('enb-bh/techs/bh-commonjs'),
        bhServerInclude: require('enb-bh/techs/bh-bundle'),
        bhClient: require('enb-bh/techs/bh-bundle')
    },
    html: {
        bemhtml: require('enb-bemxjst/techs/bemjson-to-html'),
        bh: require('enb-bh/techs/bemjson-to-html')
    },
    borschik: require('enb-borschik/techs/borschik')
};
