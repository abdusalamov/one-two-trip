'use strict';

var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    logger = require('./../lib/logger').plugin,

    Generator = require('./generator').Generator,
    Listener = require('./listener').Listener,
    ErrorsReader = require('./errors').ErrorsReader;

/**
 * Ядро приложения
 * @constructor
 *
 * Events
 * publish - публикация сообщения в редиску
 * application:change_role - смена роли приложения (слушатель -> генератор)
 * application:shutdown - завершить процесс
 */
var Core = function(config, transports)
{
    this.core = {};
    this.config = config;
    this.transports = transports;
    this.started = false;
    this.logger = logger;

    this.modules = ['generator', 'listener', 'errors'];
};

//ядро выступает в роли медиатора
util.inherits(Core, EventEmitter);

Core.prototype.init = function(config, transports)
{
    if(!config) {
        this.logger.error('Config is empty object');
        process.exit(1);
    }

    this.config = config;
    this.transports = transports;

    this.transports.redis.subscribe('message', this.emit.bind(this, 'message'));
    this.on('publish', this.transports.redis.publish.bind(this.transports.redis));
    this.on('application:change_role', this.logger.info.bind(this.logger, 'New role:'));
    this.on('module:listener:registerProcess', this.attemptToRegisterProcess.bind(this));
    this.on('module:generator:registerChangeRole', this.attemptToChangeRole.bind(this));
    this.on('module:listener:error', this.writeError.bind(this));
    this.on('module:errors:getErrors', this.getErrors.bind(this));
    this.on('application:shutdown', this.shutdown.bind(this));
    this.run();
};

Core.prototype.run = function()
{
    //процесс инициализирован
    if(this.started) return;
    this.started = true;
    this.logger.info('Core initializing...');

    //проверка состояния готовности
    this.on('module:ready', this.checkState.bind(this));

    if (process.argv.indexOf(this.config.errors.command) != -1) {
        this.startErrorsReader();
    }
    else {
        this.startGenerator();
        this.startListener();
    }
};

Core.prototype.ready = function(module)
{
    this.logger.info('Module ' + module + ' started');
    this.emit('module:ready', module);
};

Core.prototype.startGenerator = function(){
    this.core.generator = new Generator(this.logger, this);
    this.core.generator.init(this.config.generator || {}, this.ready.bind(this, 'generator'));
};

Core.prototype.startListener = function(){
    this.core.listener = new Listener(this.logger, this);
    this.core.listener.init(this.config.listener || {}, this.ready.bind(this, 'listener'));
};

Core.prototype.startErrorsReader = function(){
    this.core.errors = new ErrorsReader(this.logger, this);
    this.core.errors.init(this.config.errors || {}, this.ready.bind(this, 'errors'));
};

Core.prototype.attemptToRegisterProcess = function (key) {
    this.transports.redis.incr(key, function (result) {
        this.transports.redis.expire(key, 3);
        (result == 1) && this.emit('module:listener:proceedProcess', key);
    }.bind(this));
};

Core.prototype.attemptToChangeRole = function () {
    this.transports.redis.incr('change_role', function (result) {
        this.transports.redis.expire('change_role', 2);
        (result == 1) && this.emit('module:generator:proceedProcess');
    }.bind(this));
};

Core.prototype.checkState = function(module)
{
    var index = this.modules.indexOf(module);
    if(index >= 0) this.modules.splice(index, 1);
    else {
        this.logger.warn('Unregistered module initialized:', module);
        return;
    }
    if(!this.modules.length) {
        this.logger.info('All modules initialized, run!');
        this.emit('run');
    }
};

Core.prototype.writeError = function (msg) {
    this.transports.redis.sadd('errors', msg);
};

Core.prototype.getErrors = function () {
    this.transports.redis.smembers('errors', function (err, data) {
        this.emit('module:errors:receiveErrors', data);
    }.bind(this));
};

Core.prototype.shutdown = function () {
    process.exit(0);
};

exports.core = Core;