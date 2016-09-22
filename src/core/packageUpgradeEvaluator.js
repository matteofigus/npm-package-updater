'use strict';

let   npmService  = require('../services/npmService');
const semver      = require('semver');
const semverUtils = require('semver-utils');

// NOTE: npm semver docs https://docs.npmjs.com/misc/semver

module.exports = {
    getUpgradeRecommendation: (packageName, versionRange, next) => {
        npmService.getLatestVersionNumber(packageName, (err, versionNumber) => {
            if (err) {
                return next(err, null);
            }

            const parsedVersionRange = semverUtils.parseRange(versionRange)[0];
            const canUpgrade = semver.gtr(versionNumber, versionRange);

            return next(null, {
                canUpgrade,
                recommendedVersion: canUpgrade ? ((parsedVersionRange.operator || '') + versionNumber) : null
            });
        });
    }
};
