var redis = require('redis'),
    events = require('events'),
    util = require('util'),
    logger = require('./../logger').plugin;

var RedisTransport = function (options, callback) {
    this.clients = {};
    this.options = options;
    this.init(options, callback);
};

util.inherits(RedisTransport, events.EventEmitter);

RedisTransport.prototype.init = function (options, callback) {
    this.connect('subscriber', callback);
    this.connect('publisher');
};

RedisTransport.prototype.connect = function (role, callback) {
    this.clients[role] = redis.createClient(this.options.port, this.options.host);

    this.clients[role].on("error", function (err) {
        console.error("Redis error " + err.stack);
    });

    this.clients[role].select(this.options.db, function(){
        typeof callback == 'function' && callback();
    });

    this.clients[role].on('message', function(channel, data){
        try {
            var object = JSON.parse(data);
            this.emit(channel, object);
        } catch(e) {
            logger.error('Redis parse error: ', e);
        }
    }.bind(this));
};

RedisTransport.prototype.set = function(key, value, callback) {
    this.clients['subscriber'].set(key, JSON.stringify(value), function(err, data){
       typeof callback == 'function' && callback(err, data);
    });
};

RedisTransport.prototype.get = function(key, callback) {
    this.clients['subscriber'].get(key, function(err, data){
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
    this.clients['publisher'].expire(key, seconds);
};

RedisTransport.prototype.publish = function(channel, data) {
    this.clients['publisher'].publish(channel, data);
};

RedisTransport.prototype.subscribe = function(channel, callback) {
    this.on(channel, callback);
    this.clients['subscriber'].subscribe(channel);
};

/*
    Пользуемся однопоточностью редиса, чтобы избежать race condition
 */
RedisTransport.prototype.incr = function(key, callback) {
    this.clients['publisher'].incr(key, function (err, result) {
        (typeof callback == 'function') && callback(result);
    });
};

RedisTransport.prototype.sadd = function(key, value, callback) {
    this.clients['publisher'].sadd(key, value, callback);
};

RedisTransport.prototype.smembers = function(key, callback) {
    this.clients['publisher'].smembers(key, callback);
};

module.exports = RedisTransport;