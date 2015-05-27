'use strict';

// the only thing more annoying than comma-first vs comma-last: comma-never!

var assert = require('assert');
var spawn = require('child_process').spawn;
var fixPath = require('npm-path').set;

module.exports = function runlikenpm(command, callback) {
    assert.equal(typeof command, 'string');

    if (arguments.length === 1) {
        return runlikenpm.bind(this, command);
    } else {
        assert.equal(typeof callback, 'function');
    }

    var shell = 'sh';
    var flag = '-c';
    var options = {
        env: { },
        stdio: 'inherit'
    };

    if (process.platform === 'win32') {
        shell = process.env.comspec || 'cmd';
        flag = '/c';
        options.windowsVerbatimArguments = true;
    }

    Object.keys(process.env).forEach(function (key) {
        options.env[key] = process.env[key];
    });

    fixPath(options);

    return spawn(shell, [ flag, command ], options)
        .once('error', onerror)
        .once('exit', onexit);

    function onerror(err) {
        setImmediate(callback, err);
        callback = noop;
    }

    function onexit(code, signal) {
        var err = null;

        if (signal !== null) {
            err = new Error('killed with signal ' + signal);
            err.signal = signal;
        } else if (code !== 0) {
            err = new Error('exited with code ' + code);
            err.code = code;
        }

        setImmediate(callback, err);
        callback = noop;
    }

    function noop() {
      // do nothing
    }
};
