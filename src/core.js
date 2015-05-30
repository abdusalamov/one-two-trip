'use strict';

var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    logger = require('./../lib/logger').plugin,
    transports = require('./../lib/transport'),

    Generator = require('./generator').Generator,
    Listener = require('./listener').Listener;
    //Formatter = require('./formatter').Formatter,
    //Storage = require('./storage').Storage,
    //Diff = require('./diff').Diff,
    //Transport = require('./transport').Transport;

/**
 * Ядро приложения
 * @constructor
 */
var Core = function(config, transports)
{
    this.core = {};
    this.config = config;
    this.transports = transports;
    this.started = false;
    this.logger = logger;

    this.modules = ['generator', 'listener'];
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

    this.startGenerator();
    this.startListener();
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

exports.core = Core;