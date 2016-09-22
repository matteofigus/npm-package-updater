'use strict';

const expect     = require('expect.js');
const npmService = require('../../src/services/npmService');

describe('npmService', () => {
    describe('getLatestVersionNumber', () => {
        describe('given package name', () => {
            it('should return version number', (next) => {
                npmService.getLatestVersionNumber('hapi-ot-logger', (err, versionNumber) => {
                    expect(versionNumber).to.be('3.2.1');
                    next();
                });
            });
        });

        describe('given non-existent package name', () => {
            it('should return error', (next) => {
                npmService.getLatestVersionNumber('its-a-trap-131f4ba', (err) => {
                    expect(err.code).to.be('E404');
                    next();
                });
            });
        });
    });
});
