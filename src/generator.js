var EventEmitter = require('events').EventEmitter,
    util = require('util');

/**
 * Компонент генератора - публикует сообщения
 *
 * @param logger
 * @param mediator
 * @constructor
 *
 * Events:
 * module:generator:registerChangeRole - попытка заявить себя генератором
 * module:generator:proceedProcess - успешная попыта, продолжить сценарий
 */
var Generator = function (logger, mediator) {
    this.logger = logger;
    this.mediator = mediator instanceof EventEmitter && mediator || this;
    this.config = {};

    this.mediator.on('module:listener:heartbeatTimedOut', this.runGenerator.bind(this));
    this.mediator.on('module:generator:proceedProcess', this.proceed.bind(this));
};

util.inherits(Generator, EventEmitter);

Generator.prototype.init = function (config, cb) {
    this.config = config || {};

    (typeof cb == 'function') && cb();
};

Generator.prototype.runGenerator = function () {
    this.mediator.emit('module:generator:registerChangeRole');
};

Generator.prototype.proceed = function () {
    this.mediator.emit('application:change_role', 'generator');
    setInterval(this.publishMessage.bind(this), this.config.interval);
};

Generator.prototype.publishMessage = function () {
    var message = this.getMessage();
    this.logger.debug('push message: ', message);
    this.mediator.emit('publish', 'message', message);
};

// функция из задания, без изменений
Generator.prototype.getMessage = function () {
    this.cnt = this.cnt || 0;
    return this.cnt++;
};

exports.Generator = Generator;