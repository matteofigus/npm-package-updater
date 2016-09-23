'use strict';

const expect        = require('expect.js');
const rewire        = require('rewire');
const githubService = rewire('../../src/services/githubService');

describe('githubService', () => {
    describe('getFileContent', () => {
        describe('given options and file path', () => {
            let fileDescriptor;

            before((next) => {
                const options = {
                    apiToken: 'secret_token',
                    repository: { user: 'opentable', name: 'npm-package-updater' },
                    path: 'package.json'
                };

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
                                sha: 'e84a830d4427c06c82ec30fa60873fc67470f641',
                                content: 'ewogICJuYW1lIjogIm5wbS1wYWNrYWdlLXVwZGF0ZXIiLAogICJ2ZXJzaW9u\nIjogIjAuMC4xLWFscGhhIiwKICAiZGVzY3JpcHRpb24iOiAiYXBwIHRoYXQg\nY2hlY2tzIG5vZGUgcHJvamVjdHMgZm9yIHBvdGVudGlhbCBkZXBlbmRlbmN5\nIHVwZ3JhZGVzIGFuZCBpc3N1ZXMgdXBncmFkZSBwdWxsIHJlcXVlc3RzIiwK\nICAicmVwb3NpdG9yeSI6IHsKICAgICJ0eXBlIjogImdpdCIsCiAgICAidXJs\nIjogImdpdDovL2dpdGh1Yi5jb20vb3BlbnRhYmxlL25wbS1wYWNrYWdlLXVw\nZGF0ZXIiCiAgfSwKICAicHJpdmF0ZSI6IHRydWUsCiAgInNjcmlwdHMiOiB7\nCiAgICAic3RhcnQiOiAibm9kZSBzcmMvYXBwLmpzIiwKICAgICJsaW50Ijog\nImVzbGludCAuLyIsCiAgICAibW9jaGEiOiAibW9jaGEgdGVzdHMgLS1yZWN1\ncnNpdmUgLS1zbG93IDI1MDAgLS10aW1lb3V0IDEwMDAwIC0tcmVwb3J0ZXIg\nJHtNT0NIQV9SRVBPUlRFUjotc3BlY30iLAogICAgInRlc3QiOiAibnBtIHJ1\nbiBsaW50ICYmIG5wbSBydW4gbW9jaGEiCiAgfSwKICAia2V5d29yZHMiOiBb\nXSwKICAiYXV0aG9yIjogImF6b2thc0BvcGVudGFibGUuY29tIiwKICAiYnVn\ncyI6IHsKICAgICJ1cmwiOiAiaHR0cHM6Ly9naXRodWIuY29tL29wZW50YWJs\nZS9ucG0tcGFja2FnZS11cGRhdGVyL2lzc3VlcyIKICB9LAogICJob21lcGFn\nZSI6ICJodHRwczovL2dpdGh1Yi5jb20vb3BlbnRhYmxlL25wbS1wYWNrYWdl\nLXVwZGF0ZXIiLAogICJkZXZEZXBlbmRlbmNpZXMiOiB7CiAgICAiZXNsaW50\nIjogIl4zLjUuMCIsCiAgICAiZXNsaW50LWNvbmZpZy1kZWZhdWx0cyI6ICJe\nOS4wLjAiLAogICAgImVzcHJlZSI6ICJeMy4zLjAiLAogICAgImV4cGVjdC5q\ncyI6ICJeMC4zLjEiLAogICAgIm1vY2hhIjogIl4zLjAuMiIsCiAgICAicmV3\naXJlIjogIl4yLjUuMiIsCiAgICAidW5kZXJzY29yZSI6ICJeMS44LjMiCiAg\nfSwKICAiZGVwZW5kZW5jaWVzIjogewogICAgImFzeW5jIjogIl4yLjAuMSIs\nCiAgICAiZ2l0aHViIjogIl4zLjEuMCIsCiAgICAibnBtIjogIl4zLjEwLjci\nLAogICAgInNlbXZlciI6ICJeNS4zLjAiLAogICAgInNlbXZlci11dGlscyI6\nICJeMS4xLjEiCiAgfQp9Cg==\n',
                                encoding: 'base64'
                            });
                        }
                    }
                });

                githubService.getFileContent(options, (err, _fileDescriptor) => {
                    fileDescriptor = _fileDescriptor;
                    next();
                });
            });

            it('should return sha', (next) => {
                expect(fileDescriptor.sha).to.be('e84a830d4427c06c82ec30fa60873fc67470f641');
                next();
            });

            it('should return encoding', (next) => {
                expect(fileDescriptor.encoding).to.be('base64');
                next();
            });

            it('should return content', (next) => {
                expect(fileDescriptor.content.name).to.be('npm-package-updater');
                next();
            });
        });

        describe('given options and non-existent file path', () => {
            it('should return error', (next) => {
                const options = {
                    apiToken: 'secret_token',
                    repository: { user: 'opentable', name: 'npm-package-updater' },
                    path: '/its.a.trap'
                };

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

                githubService.getFileContent(options, (err) => {
                    expect(err.status).to.be('Not Found');
                    next();
                });
            });
        });
    });
});
