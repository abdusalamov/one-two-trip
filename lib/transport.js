var async = require('async');

var Transports = function (options, callback) {
    this.redis = new (require('./transports/redis'))(options.redis, callback);
};

module.exports = Transports;