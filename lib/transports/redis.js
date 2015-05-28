var redis = require('redis'),
    events = require('events'),
    util = require('util');

var RedisTransport = function (options, callback) {
    this.client = null;
    this.init(options, callback);
    this.on('message', function () {
        console.log(123);
    });
};

util.inherits(RedisTransport, events.EventEmitter);

RedisTransport.prototype.init = function (options, callback) {
    var _this = this;

    this.client = redis.createClient(options.port, options.host);

    this.client.on("error", function (err) {
        console.error("Redis error " + err);
    });

    this.client.select(options.db, function(){
        typeof callback == 'function' && callback();
    });

    this.client.on('message', function(channel, data){
        try {
            var object = JSON.parse(data);
            _this.emit(channel, object);
        } catch(e) {
            logger.error('Redis error: ', e);
        }
    });
};

RedisTransport.prototype.set = function(key, value, callback) {
    this.client.set(key, JSON.stringify(value), function(err, data){
       typeof callback == 'function' && callback(err, data);
    });
};

RedisTransport.prototype.get = function(key, callback) {
    this.client.get(key, function(err, data){
        if (!err) {
            try {
                data = JSON.parse(data);
            } catch (e) {
                err = new Error('Invalid data', data);
            }
        }
        typeof callback == 'function' && callback(err, data);
    });
};

RedisTransport.prototype.expire = function(key, seconds) {
    this.client.expire(key, seconds);
};

RedisTransport.prototype.subscribe = function(channel) {
    this.client.subscribe(channel);
};

module.exports = RedisTransport;