'use strict';

const expect                  = require('expect.js');
const rewire                  = require('rewire');
const packageUpgradeEvaluator = rewire('../../src/core/packageUpgradeEvaluator');

describe('packageUpgradeEvaluator', () => {
    describe('getUpgradeRecommendation', () => {
        describe('given package name and version range and package has upgrade available', () => {
            let upgradeRecommendation;

            before((next) => {
                const packageName = 'test-package';
                const versionRange = '^1.0.0';

                packageUpgradeEvaluator.__set__('npmService', {
                    getLatestVersionNumber: (packageName, cb) => {
                        expect(packageName).to.be('test-package');
                        return cb(null, '2.0.1');
                    }
                });

                packageUpgradeEvaluator.getUpgradeRecommendation(packageName, versionRange, (err, _upgradeRecommendation) => {
                    upgradeRecommendation = _upgradeRecommendation;
                    next();
                });
            });

            it('should recommend upgrade', (next) => {
                expect(upgradeRecommendation.canUpgrade).to.be(true);
                next();
            });

            it('should return recommended upgrade version', (next) => {
                expect(upgradeRecommendation.recommendedVersion).to.be('^2.0.1');
                next();
            });
        });

        describe('given package name and version range and package does not have upgrade available', () => {
            let upgradeRecommendation;

            before((next) => {
                const packageName = 'test-package';
                const versionRange = '^1.0.0';

                packageUpgradeEvaluator.__set__('npmService', {
                    getLatestVersionNumber: (packageName, cb) => {
                        expect(packageName).to.be('test-package');
                        cb(null, '1.9.8');
                    }
                });

                packageUpgradeEvaluator.getUpgradeRecommendation(packageName, versionRange, (err, _upgradeRecommendation) => {
                    upgradeRecommendation = _upgradeRecommendation;
                    next();
                });
            });

            it('should not recommend upgrade', (next) => {
                expect(upgradeRecommendation.canUpgrade).to.be(false);
                next();
            });

            it('should not return recommended upgrade version', (next) => {
                expect(upgradeRecommendation.recommendedVersion).to.be(null);
                next();
            });
        });

        // TODO: test error path
    });
});
