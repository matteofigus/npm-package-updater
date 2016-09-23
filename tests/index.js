'use strict';

const _                 = require('underscore');
const expect            = require('expect.js');
const rewire            = require('rewire');
const npmPackageUpdater = rewire('../src/index');

describe('npmPackageUpdater', () => {
    describe('run', () => {
        describe('given a list of repositories and dry-run flag is true', () => {
            let upgradeSummary;

            before((next) => {
                const options = {
                    dryRun: true,
                    apiToken: 'secret_token',
                    repositories: [
                        { user: 'opentable', name: 'repo-1' },
                        { user: 'opentable', name: 'repo-2' }
                    ]
                };

                npmPackageUpdater.__set__('githubService', {
                    getFileContent: (options, path, cb) => {
                        if (options.repository.name === 'repo-1') {
                            return cb(null, {
                                sha: 'e84a830d4427c06c82ec30fa60873fc67470f641',
                                encoding: 'base64',
                                content: {
                                    dependencies: [
                                        { dep1: '^1.0.0' },
                                        { dep2: '^1.0.0' },
                                        { dep3: '^1.0.0' }
                                    ],
                                    devDependencies: [
                                        { dep1: '^1.0.0' },
                                        { dep2: '^1.0.0' },
                                        { dep3: '^1.0.0' }
                                    ]
                                },
                                trailingNewline: '\n',
                                indentSize: 2
                            });
                        } else {
                            return cb(null, {
                                sha: 'e84a830d4427c06c82ec30fa60873fc67470f641',
                                encoding: 'base64',
                                content: {
                                    dependencies: [
                                        { dep1: '^1.0.0' }
                                    ],
                                    devDependencies: [
                                        { dep1: '^1.0.0' }
                                    ]
                                },
                                trailingNewline: '\n',
                                indentSize: 2
                            });
                        }
                    }
                });

                npmPackageUpdater.__set__('packageUpgradeEvaluator', {
                    getUpgradeRecommendation: (packageName, versionRange, cb) => {
                        switch (packageName) {
                            case 'dep1':
                                return cb(null, {
                                    canUpgrade: true,
                                    recommendedVersion: '^2.0.1'
                                });
                            case 'dep2':
                                return cb(null, {
                                    canUpgrade: true,
                                    recommendedVersion: '^8.0.0'
                                });
                            case 'dep3':
                                return cb(null, {
                                    canUpgrade: false,
                                    recommendedVersion: null
                                });
                            default:
                                return cb(new Error(`Unhandled test package name: ${packageName}`), null);
                        }
                    }
                });

                npmPackageUpdater.run(options, (err, _upgradeSummary) => {
                    if (err) {
                        throw err;
                    }

                    upgradeSummary = _upgradeSummary;
                    next();
                });
            });

            it('should specify this was a dry run', () => {
                expect(upgradeSummary.options.dryRun).to.be(true);
            });

            it('should return information for two repositories', () => {
                expect(upgradeSummary.repositories.length).to.be(2);
            });

            it('should specify repo-1/dep1 can be upgraded and had a new pull request created', () => {
                const repository = _.find(upgradeSummary.repositories, (result) => result.repository.name === 'repo-1');
                const result = _.find(repository.dependencyUpgradeEvaluationResults, (upgradeEvaluationResult) => upgradeEvaluationResult.packageName === 'dep1');

                expect(result).to.eql({
                    packageName: 'dep1',
                    canUpgrade: true,
                    recommendedVersion: '^2.0.1',
                    versionRange: '^1.0.0'
                });
            });

            it('should specify repo-1/dep2 can be upgraded and already has an existing pull request', () => {
                const repository = _.find(upgradeSummary.repositories, (result) => result.repository.name === 'repo-1');
                const result = _.find(repository.dependencyUpgradeEvaluationResults, (upgradeEvaluationResult) => upgradeEvaluationResult.packageName === 'dep2');

                expect(result).to.eql({
                    packageName: 'dep2',
                    canUpgrade: true,
                    recommendedVersion: '^8.0.0',
                    versionRange: '^1.0.0'
                });
            });

            it('should specify repo-1/dep3 does not have any upgrades available', () => {
                const repository = _.find(upgradeSummary.repositories, (result) => result.repository.name === 'repo-1');
                const result = _.find(repository.dependencyUpgradeEvaluationResults, (upgradeEvaluationResult) => upgradeEvaluationResult.packageName === 'dep3');

                expect(result).to.eql({
                    packageName: 'dep3',
                    canUpgrade: false,
                    recommendedVersion: null,
                    versionRange: '^1.0.0'
                });
            });

            it('should specify repo-1/devDep1 can be upgraded and had a new pull request created', () => {
                const repository = _.find(upgradeSummary.repositories, (result) => result.repository.name === 'repo-1');
                const result = _.find(repository.devDependencyUpgradeEvaluationResults, (upgradeEvaluationResult) => upgradeEvaluationResult.packageName === 'dep1');

                expect(result).to.eql({
                    packageName: 'dep1',
                    canUpgrade: true,
                    recommendedVersion: '^2.0.1',
                    versionRange: '^1.0.0'
                });
            });

            it('should specify repo-1/devDep2 can be upgraded and already has an existing pull request', () => {
                const repository = _.find(upgradeSummary.repositories, (result) => result.repository.name === 'repo-1');
                const result = _.find(repository.devDependencyUpgradeEvaluationResults, (upgradeEvaluationResult) => upgradeEvaluationResult.packageName === 'dep2');

                expect(result).to.eql({
                    packageName: 'dep2',
                    canUpgrade: true,
                    recommendedVersion: '^8.0.0',
                    versionRange: '^1.0.0'
                });
            });

            it('should specify repo-1/devDep-3 does not have any upgrades available', () => {
                const repository = _.find(upgradeSummary.repositories, (result) => result.repository.name === 'repo-1');
                const result = _.find(repository.devDependencyUpgradeEvaluationResults, (upgradeEvaluationResult) => upgradeEvaluationResult.packageName === 'dep3');

                expect(result).to.eql({
                    packageName: 'dep3',
                    canUpgrade: false,
                    recommendedVersion: null,
                    versionRange: '^1.0.0'
                });
            });

            it('should specify repo-2/dep1 can be upgraded and had a new pull request created', () => {
                const repository = _.find(upgradeSummary.repositories, (result) => result.repository.name === 'repo-2');
                const result = _.find(repository.dependencyUpgradeEvaluationResults, (upgradeEvaluationResult) => upgradeEvaluationResult.packageName === 'dep1');

                expect(result).to.eql({
                    packageName: 'dep1',
                    canUpgrade: true,
                    recommendedVersion: '^2.0.1',
                    versionRange: '^1.0.0'
                });
            });

            it('should specify repo-2devDep1 can be upgraded and had a new pull request created', () => {
                const repository = _.find(upgradeSummary.repositories, (result) => result.repository.name === 'repo-2');
                const result = _.find(repository.devDependencyUpgradeEvaluationResults, (upgradeEvaluationResult) => upgradeEvaluationResult.packageName === 'dep1');

                expect(result).to.eql({
                    packageName: 'dep1',
                    canUpgrade: true,
                    recommendedVersion: '^2.0.1',
                    versionRange: '^1.0.0'
                });
            });
        });
    });
});
