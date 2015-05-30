var redis = require('redis'),
    events = require('events'),
    async = require('async'),
    util = require('util');

var RedisTransport = function (options, callback) {
    this.clients = {};
    this.options = options;
    this.init(options, callback);
};

util.inherits(RedisTransport, events.EventEmitter);

RedisTransport.prototype.init = function (options, callback) {
    this.connect('subscriber', callback);
};

RedisTransport.prototype.connect = function (role, callback) {
    this.clients[role] = redis.createClient(this.options.port, this.options.host);

    this.clients[role].on("error", function (err) {
        console.error("Redis error " + err);
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
    this.clients['subscriber'].expire(key, seconds);
};

RedisTransport.prototype.publish = function(channel, data) {
    var tasks = [];
    tasks.push(function (callback) {
        if (!this.clients['publisher']) {
            this.connect('publisher', callback);
        } else callback();
    }.bind(this));
    tasks.push(function (callback) {
        this.clients['publisher'].publish(channel, data);
    }.bind(this));
    async.series(tasks);
};

RedisTransport.prototype.subscribe = function(channel, callback) {
    this.on(channel, callback);
    this.clients['subscriber'].subscribe(channel, function (){console.log(arguments)});
};

module.exports = RedisTransport;