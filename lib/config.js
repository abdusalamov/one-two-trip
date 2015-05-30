'use strict';

var config = exports;

/**
 * Чтение файла конфига из аргументов командной строки
 * @return {*}
 */
config.load = function(callback) {
    var configFilePath;
    for (var i = 0; i < process.argv.length; i++) {
        var value = process.argv[i];
        if (value.indexOf('--config=') != -1) {
            configFilePath = value.substr(9);
        }
    }

    if (configFilePath == undefined) {
        console.error('Failed to start application: config option is not set. Check required option --config="...".');
        process.exit(1);
    }

    var result = config.loadConfigFile(configFilePath);
    typeof callback == 'function' && callback(result);
};

config.loadConfigFile = function(file) {
    var msg = '| Loading file from "' + file + '" |';
    var div = new Array(msg.length - 1).join('-');
    console.log('+' + div + '+' + "\n" + msg + "\n" + '+' + div + '+');

    return JSON.parse(require('fs').readFileSync(file));
};