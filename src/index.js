'use strict';

const async                 = require('async');
let githubService           = require('./services/githubService');
let packageUpgradeEvaluator = require('./core/packageUpgradeEvaluator');

module.exports = {
    run: (options, next) => {
        async.map(options.repositories, (repository, repositoryNext) => {
            githubService.getFileContent({ apiToken: options.apiToken, repository: { user: repository.user, name: repository.name }}, 'package.json', (err, fileDescriptor) => {
                const dependencies = fileDescriptor.content.dependencies.map((dependency) => { return { packageName: Object.keys(dependency)[0], versionRange: dependency[Object.keys(dependency)[0]] }; });

                async.map(dependencies, (dependency, dependencyNext) => {
                    packageUpgradeEvaluator.getUpgradeRecommendation(dependency.packageName, dependency.versionRange, (err, upgradeRecommendation) => {
                        if (err) {
                            return dependencyNext(err, null);
                        }

                        upgradeRecommendation.packageName = dependency.packageName;
                        upgradeRecommendation.versionRange = dependency.versionRange;

                        return dependencyNext(err, upgradeRecommendation);
                    });
                }, (err, dependencyUpgradeEvaluationResults) => {
                    if (err) {
                        return repositoryNext(err, null);
                    }

                    const devDependencies = fileDescriptor.content.devDependencies.map((devDependency) => { return { packageName: Object.keys(devDependency)[0], versionRange: devDependency[Object.keys(devDependency)[0]] }; });

                    async.map(devDependencies, (devDependency, devDependencyNext) => {
                        packageUpgradeEvaluator.getUpgradeRecommendation(devDependency.packageName, devDependency.versionRange, (err, upgradeRecommendation) => {
                            if (err) {
                                return devDependencyNext(err, null);
                            }

                            upgradeRecommendation.packageName = devDependency.packageName;
                            upgradeRecommendation.versionRange = devDependency.versionRange;

                            return devDependencyNext(err, upgradeRecommendation);
                        });
                    }, (err, devDependencyUpgradeEvaluationResults) => {
                        if (err) {
                            return repositoryNext(err, null);
                        }

                        return repositoryNext(null, {
                            repository,
                            dependencyUpgradeEvaluationResults,
                            devDependencyUpgradeEvaluationResults
                        });
                    });
                });
            });
        }, (err, results) => {
            if (err) {
                return next(err, null);
            }

            return next(null, {
                options: {
                    dryRun: options.dryRun
                },
                repositories: results
            });
        });
    }
};
