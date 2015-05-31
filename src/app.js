'use strict';

var Core = require('./core').core,
    Transports = require('./../lib/transport');

var App = function() {
    this.core = new Core();
};

App.prototype.run = function()  {

    // конфиг приложения
    var config = require('./../lib/config');

    config.load(function (config) {
        global.config = config;
        global.debugLevel = config.debugLevel || 'info';

        this.initTransports(config.transports, function (transports) {
            this.core.init(config, transports);
        }.bind(this));


    }.bind(this));
};

App.prototype.initTransports = function (config, callback) {
    new Transports(config, function (transports) {
        callback(transports);
    });
};

exports.app = new App();