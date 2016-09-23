'use strict';

const expect                           = require('expect.js');
const rewire                           = require('rewire');
const packageUpgradePullRequestCreator = rewire('../../src/core/packageUpgradePullRequestCreator');

describe('packageUpgradePullRequestCreator', () => {
    describe('createPullRequest', () => {
        describe('given package name and version range', () => {
            let pullRequest;

            before((next) => {
                const options = {
                    apiToken: 'secret_token',
                    repository: {
                        user: 'opentable',
                        name: 'npm-package-updater'
                    },
                    package: {
                        source:  'dependencies',
                        name: 'github',
                        versionRange: '^4.0.1'
                    },
                    manifest: {
                        sha: 'e84a830d4427c06c82ec30fa60873fc67470f641',
                        encoding: 'base64',
                        content:
                        {
                            name: 'npm-package-updater',
                            version: '0.0.1-alpha',
                            devDependencies: {
                                eslint: '^3.5.0',
                                'eslint-config-defaults': '^9.0.0',
                                espree: '^3.3.0',
                                'expect.js': '^0.3.1',
                                mocha: '^3.0.2',
                                rewire: '^2.5.2',
                                underscore: '^1.8.3'
                            },
                            dependencies: {
                                async: '^2.0.1',
                                github: '^3.1.0',
                                npm: '^3.10.7',
                                semver: '^5.3.0',
                                'semver-utils': '^1.1.1'
                            }
                        }
                        ,
                        trailingNewline: '\n',
                        indentSize: 2
                    }
                };

                packageUpgradePullRequestCreator.__set__('githubService', {
                    getReferenceSha: (options, next) => {
                        next(null, 'some-sha');
                    },
                    createReference: (options, next) => {
                        next(null, {});
                    },
                    updateFile: (options, next) => {
                        next(null, {});
                    },
                    createPullRequest: (options, next) => {
                        next(null, {
                            title: 'upgrade \'github\' to ^4.0.1',
                            url: 'https://api.github.com/repos/opentable/npm-package-updater/pulls/12'
                        });
                    }
                });

                packageUpgradePullRequestCreator.createPullRequest(options, (err, _pullRequest) => {
                    pullRequest = _pullRequest;
                    next();
                });
            });

            it('should return pull reqeust title', () => {
                expect(pullRequest.title).to.be('upgrade \'github\' to ^4.0.1');
            });

            it('should return pull reqeust url', () => {
                expect(pullRequest.url).to.be('https://api.github.com/repos/opentable/npm-package-updater/pulls/12');
            });

            it('should indicate this is a new pull request', () => {
                expect(pullRequest.isNew).to.be(true);
            });
        });
    });
});
