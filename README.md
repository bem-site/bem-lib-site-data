bem-lib-site-data
----------------------

Collects data of BEM blocks library for `bem-lib-site` module.

## Installation
```sh
npm i bem-lib-site-data
```

## Usage

### Library config
Consider adding you library to config.

Library config format (all fields are optional):

```js
module.exports = {
    modules: {
        'bem-tools': {
            plugins: {}
        },
        'bem-lib-site-data': {
            tempFolder: 'tmp',
            outputFolder: 'output',
            langs: ['ru', 'en'],
            platforms: { // TODO: make it really optional
                'desktop': ['common', 'deskpad', 'desktop'],
                'touch-phone': ['common', 'touch', 'touch-phone'],
                'touch-pad': ['common', 'deskpad', 'touch', 'touch-pad']
            },
            libs: {
                'bem-components': {
                    langs: ['ru', 'en'],
                    github: {
                        url: 'github.com',
                        user: 'bem',
                        repo: 'bem-components',
                        defaultBranch: 'v2'
                    }
                }
            }
        }
    }
};
```

### Anatomy
Build process is following:
1. Install `bower` dependencies of a library
2. Collect source files list
3. Build examples
4. Build docs
5. Move results to destination folder. Destination folder ('./output') may be changed in config as well as needed platforms and languages.

### Notes
To build examples iframes there should be `bem-core` library as bower dependency (otherwise there won't be `page` template).
