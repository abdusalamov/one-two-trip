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

/*
var Transport = require('./../lib/transport')
    Config = require('./../lib/config');

var Application = function () {
    this.transports = {};
    this.config = {};
};

Application.prototype.run = function () {
    this.readConfig();
    this.initTransports(function () {

    });
};

Application.prototype.readConfig = function () {
    this.config = Config.getConfig();
};

Application.prototype.initTransports = function (callback) {
    var transports = new Transport(this.config.transports, callback);
};

Application.prototype.startGenerator = function () {

};

Application.prototype.startListener = function () {

};

module.exports = new Application();*/
