'use strict';

const expect        = require('expect.js');
const rewire        = require('rewire');
const githubService = rewire('../../src/services/githubService');

describe('githubService', () => {
    describe('getFileContent', () => {
        describe('given options and file path', () => {
            it('should return file', (next) => {
                const options = { apiToken: 'secret_token', repo: { user: 'opentable', name: 'npm-package-updater' } };
                const path = 'package.json';

                githubService.__set__('github', {
                    authenticate: (options) => {
                        expect(options.type).to.be('oauth');
                        expect(options.token).to.be('secret_token');
                    },
                    repos: {
                        getContent: (options, cb) => {
                            expect(options.user).to.be('opentable');
                            expect(options.repo).to.be('npm-package-updater');
                            expect(options.path).to.be('package.json');

                            return cb(null, {
                                content: 'ew0KICAibmFtZSI6ICJucG0tcGFja2FnZS11cGRhdGVyIg0KfQ==',
                                encoding: 'base64'
                            });
                        }
                    }
                });

                githubService.getFileContent(options, path, (err, file) => {
                    expect(file.name).to.be('npm-package-updater');
                    next();
                });
            });
        });

        describe('given options and non-existent file path', () => {
            it('should return error', (next) => {
                const options = { apiToken: 'secret_token', repo: { user: 'opentable', name: 'npm-package-updater' } };
                const path = '/its.a.trap';

                githubService.__set__('github', {
                    authenticate: () => {},
                    repos: {
                        getContent: (options, cb) => {
                            const err = new Error();
                            err.status = 'Not Found';

                            return cb(err);
                        }
                    }
                });

                githubService.getFileContent(options, path, (err) => {
                    expect(err.status).to.be('Not Found');
                    next();
                });
            });
        });
    });
});
