var EventEmitter = require('events').EventEmitter,
    util = require('util');

var Generator = function (logger, mediator) {
    this.logger = logger;
    this.mediator = mediator instanceof EventEmitter && mediator || this;
    this.config = {};

    //this.mediator.on('message:heartbeat', this.handleHeartbeat.bind(this));
    this.mediator.on('module:listener:heartbeatTimedOut', this.runGenerator.bind(this));
};

util.inherits(Generator, EventEmitter);

Generator.prototype.init = function (config, cb) {
    this.config = config || {};

    (typeof cb == 'function') && cb();
};

Generator.prototype.runGenerator = function () {
    //this.logger.info('New role: generator');
    this.mediator.emit('application:change_role', 'generator');
    this.mediator.emit('publish', 'message', this.getMessage());
    setInterval(this.publishMessage.bind(this), this.config.interval);
};

Generator.prototype.publishMessage = function () {
    var message = this.getMessage();
    this.logger.debug('push message: ', message);
    this.mediator.emit('publish', 'message', message);
};

//Generator.prototype.handleHeartbeat = function () {
//    console.log(arguments);
//};

Generator.prototype.getMessage = function () {
    this.cnt = this.cnt || 0;
    return this.cnt++;
};

exports.Generator = Generator;