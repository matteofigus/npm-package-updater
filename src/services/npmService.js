'use strict';

const npm = require('npm');

module.exports = {
    getLatestVersionNumber: (packageName, next) => {
        npm.load({ silent: true }, () => {
            npm.commands.view([packageName], true, (err, packageInfo) => {
                if (err) {
                    return next(err, null);
                }

                packageInfo = packageInfo[Object.keys(packageInfo)[0]];
                return next(null, packageInfo['dist-tags'].latest);
            });
        });
    }
};
