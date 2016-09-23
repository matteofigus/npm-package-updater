'use strict';

const deepcopy    = require('deepcopy');
let githubService = require('../services/githubService');

module.exports = {
    createPullRequest: (options, next) => {
        options.branchName = `upgrade-${options.package.name}`;

        githubService.getReferenceSha(options, (err, sha) => {
            if (err) {
                return next(err, null);
            }

            options.repository.headSha = sha;

            githubService.createReference(options, (err) => {
                if (err && (err.message.indexOf('Reference already exists') === -1)) {
                    return next(err, null);
                }

                options.path = 'package.json';

                const manifest = deepcopy(options.manifest.content);
                manifest[options.package.source][options.package.name] = options.package.versionRange;

                options.pullRequest = { content: new Buffer(JSON.stringify(manifest, null, options.manifest.indentSize) + options.manifest.trailingNewline).toString('base64') };

                githubService.updateFile(options, (err) => {
                    if (err) {
                        return next(err, null);
                    }

                    githubService.createPullRequest(options, (err, pullRequest) => {
                        if (err) {
                            if (err.message.indexOf('A pull request already exists') > -1) {
                                return next(null, {
                                    title: null,
                                    url: null,
                                    isNew: false
                                });
                            } else {
                                return next(err, null);
                            }
                        }

                        return next(null, {
                            title: pullRequest.title,
                            url: pullRequest.url,
                            isNew: true
                        });
                    });
                });
            });
        });
    }
};
