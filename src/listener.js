var EventEmitter = require('events').EventEmitter,
    util = require('util');

var Listener = function (logger, mediator) {
    this.logger = logger;
    this.mediator = mediator instanceof EventEmitter && mediator || this;
    this.config = {};
    this.handleMessageLink = this.handleMessage.bind(this);

    this.mediator.on('message', this.handleMessageLink);
    this.mediator.on('application:change_role', this.switchRole.bind(this))
};

util.inherits(Listener, EventEmitter);

Listener.prototype.init = function (config, cb) {
    this.config = config || {};

    this.checkHeartbeat();
    (typeof cb == 'function') && cb();
    this.logger.info('Current role: listener');
};

Listener.prototype.switchRole = function (role) {
    switch (role) {
        case 'generator':
            this.mediator.removeListener('message', this.handleMessageLink);
            break;
        case 'listener':
            break;
    }
};

Listener.prototype.handleMessage = function (message) {
    this.logger.debug('receive message:', message);
    this.checkHeartbeat();
};

Listener.prototype.checkHeartbeat = function () {
    clearTimeout(this.timer);
    this.timer = setTimeout(this.releaseHeartbeat.bind(this), this.config.heartbeatInterval);
};

Listener.prototype.releaseHeartbeat = function () {
    this.mediator.emit('module:listener:heartbeatTimedOut');
};

exports.Listener = Listener;