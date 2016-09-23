'use strict';

let github = new require('github')({
    protocol: 'https',
    host: 'api.github.com',
    headers: {
        'user-agent': 'npm-package-updater'
    },
    followRedirects: false,
    timeout: 5000
});

module.exports = {
    getFileContent: (options, next) => {
        github.authenticate({
            type: 'oauth',
            token: options.apiToken
        });

        github.repos.getContent({ user: options.repository.user, repo: options.repository.name, path: options.path }, (err, file) => {
            if (err) {
                return next(err, null);
            }

            return next(null, {
                sha: file.sha,
                encoding: file.encoding,
                content: JSON.parse(new Buffer(file.content, file.encoding).toString()),
                trailingNewline: '\n', // TODO
                indentSize: 2 // TODO
            });
        });
    },
    getReferenceSha: (options, next) => {
        github.authenticate({
            type: 'oauth',
            token: options.apiToken
        });

        github.gitdata.getReference({
            user: options.repository.user,
            repo: options.repository.name,
            ref: 'heads/master'
        }, (err, result) => {
            if (err) {
                return next(err, null);
            }

            return next(null, result.object.sha);
        });
    },
    createReference: (options, next) => {
        github.authenticate({
            type: 'oauth',
            token: options.apiToken
        });

        github.gitdata.createReference({
            user: options.repository.user,
            repo: options.repository.name,
            ref: `refs/heads/${options.branchName}`,
            sha: options.repository.headSha
        }, (err, result) => {
            if (err) {
                return next(err, null);
            }

            return next(null, result);
        });
    },
    updateFile: (options, next) => {
        github.authenticate({
            type: 'oauth',
            token: options.apiToken
        });

        github.repos.updateFile({
            user: options.repository.user,
            repo: options.repository.name,
            path: options.path,
            message: `upgrade '${options.package.name}' to ${options.package.versionRange}`,
            content: options.pullRequest.content,
            sha: options.manifest.sha,
            branch: options.branchName
        }, (err, result) => {
            next(null, result);
        });
    },
    createPullRequest: (options, next) => {
        github.authenticate({
            type: 'oauth',
            token: options.apiToken
        });

        github.pullRequests.create({
            user: options.repository.user,
            repo: options.repository.name,
            title: `upgrade '${options.package.name}' to ${options.package.versionRange}`,
            head: options.branchName,
            base: 'master'
        }, (err, result) => {
            if (err) {
                return next(err, null);
            }

            return next(null, result);
        });
    }
};
