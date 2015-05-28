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

module.exports = new Application();