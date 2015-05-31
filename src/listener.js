var EventEmitter = require('events').EventEmitter,
    util = require('util');

/**
 * Компонент Слушатель
 *
 * @param logger
 * @param mediator
 * @constructor
 *
 * Events:
 * message - новое сообщение
 * module:listener:registerProcess - попытка начать обработку сообщения
 * module:listener:proceedProcess - успешная попытка, обрабатываем
 */
var Listener = function (logger, mediator) {
    this.logger = logger;
    this.mediator = mediator instanceof EventEmitter && mediator || this;
    this.config = {};
    this.handleMessageLink = this.handleMessage.bind(this);

    this.mediator.on('message', this.handleMessageLink);
    this.mediator.on('application:change_role', this.switchRole.bind(this));
    this.mediator.on('module:listener:proceedProcess', this.proceed.bind(this));
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
    this.checkHeartbeat();
    this.mediator.emit('module:listener:registerProcess', message);
};

Listener.prototype.proceed = function (message) {
    this.logger.debug('receive message:', message);
    this.eventHandler(message, function (err, msg) {
        if (err) this.mediator.emit('module:listener:error', msg);
    }.bind(this));
};

// функция из задания, без изменений
Listener.prototype.eventHandler = function(msg, callback){
    function onComplete(){
        var error = Math.random() > 0.85;
        callback(error, msg);
    }
    setTimeout(onComplete, Math.floor(Math.random()*1000));
};

Listener.prototype.checkHeartbeat = function () {
    clearTimeout(this.timer);
    this.timer = setTimeout(this.releaseHeartbeat.bind(this), this.config.heartbeatInterval);
};

Listener.prototype.releaseHeartbeat = function () {
    this.mediator.emit('module:listener:heartbeatTimedOut');
};

exports.Listener = Listener;