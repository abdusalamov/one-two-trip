var EventEmitter = require('events').EventEmitter,
    util = require('util');

/**
 * Компонент вывода ошибок
 *
 * @param logger
 * @param mediator
 * @constructor
 *
 * Events:
 * module:errors:getErrors - запрашивает ошибки
 * module:errors:receiveErrors - получает ответ
 */
var ErrorsReader = function (logger, mediator) {
    this.logger = logger;
    this.mediator = mediator instanceof EventEmitter && mediator || this;
    this.config = {};

    this.mediator.on('module:errors:receiveErrors', this.proceed.bind(this));
};

util.inherits(ErrorsReader, EventEmitter);

ErrorsReader.prototype.init = function (config, cb) {
    this.config = config || {};
    this.getErrors();
    (typeof cb == 'function') && cb();
};

ErrorsReader.prototype.getErrors = function () {
    this.mediator.emit('module:errors:getErrors');
};

ErrorsReader.prototype.proceed = function (result) {
    result.forEach(function(item) {
        this.logger.info('error: ', item);
    }.bind(this));
    this.mediator.emit('application:shutdown');
};

exports.ErrorsReader = ErrorsReader;