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
    getFileContent: (options, path, next) => {
        github.authenticate({
            type: 'oauth',
            token: options.apiToken
        });

        github.repos.getContent({ user: options.repo.user, repo: options.repo.name, path }, (err, file) => {
            if (err) {
                return next(err, null);
            }

            return next(null, JSON.parse(new Buffer(file.content, file.encoding).toString()));
        });
    }
};
