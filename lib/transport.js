var Transports = function (options, callback) {
    this.options = options;
    //this.redis = new (require('./transports/redis'))(options.redis, callback);
    this.transports = {};

    this.init(callback);
};

Transports.prototype.init = function (callback) {
    for (var key in this.options) {
        if (this.options.hasOwnProperty(key)) {
            this.transports[key] = new (require('./transports/'+this.options[key].transport))(this.options[key]);
        }
    }

    callback(this.transports);
};

module.exports = Transports;