'use strict';

const expect        = require('expect.js');
const githubService = require('../../src/services/githubService');

if (!process.env.TOKEN) {
    console.log('Github auth token not defined. Skipping "githubService" tests...');
} else {
    describe('githubService', () => {
        describe('getFileContent', () => {
            describe('given options and file path', () => {
                it('should return file', (next) => {
                    const options = { apiToken: process.env.TOKEN, repo: { user: 'opentable', name: 'npm-package-updater' } };
                    const path = '/package.json';

                    githubService.getFileContent(options, path, (err, file) => {
                        expect(file.name).to.be('npm-package-updater');
                        next();
                    });
                });
            });

            describe('given options and non-existent file path', () => {
                it('should return error', (next) => {
                    const options = { apiToken: process.env.TOKEN, repo: { user: 'opentable', name: 'npm-package-updater' } };
                    const path = '/its.a.trap';

                    githubService.getFileContent(options, path, (err) => {
                        expect(err.status).to.be('Not Found');
                        next();
                    });
                });
            });
        });
    });
}