module.exports = {
    packagerConfig: {},
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                authors: 'My Authors',
                description: 'My Description'
            },
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin', 'win32'],
        },
    ],
};
