/**
 * Logger plugin
 */

var _ = require('underscore');
var util = require('util');
var events = require('events');

var Logger = function() {
    this.level = null;
    this.defaultLevel = 'info';
};

util.inherits(Logger, events.EventEmitter);

Logger.prototype.log = function(level, messages)
{
    this.checkLevel();

    var output = [];
    if (!_.isObject(messages)) {
        messages = {0: messages};
    }
    for (var i in messages) {
        if (!_.isString(messages[i])) {
            output.push(messages[i] instanceof Error ? messages[i].toString() : JSON.stringify(messages[i]));
        } else {
            output.push(messages[i]);
        }
    }

    var date = new Date();
    var month = date.getMonth() + 1;
    month = (month < 10 ? '0' : '') + month;
    var day = date.getDate();
    day = (day < 10 ? '0': '') + day;
    var hour = date.getHours();
    hour = (hour < 10 ? '0' : '') + hour;
    var minutes = date.getMinutes();
    minutes = (minutes < 10 ? '0' : '') + minutes;
    var seconds = date.getSeconds();
    seconds = (seconds < 10 ? '0' : '') + seconds;
    var time = day + '.' + month + '.' + date.getFullYear() + ' ' + hour + ':' + minutes + ':' + seconds;

    var logMessage = '[' + time + ']  - ' + output.join(' ');

    console.log(level, logMessage);
};

/**
 * Set current loglevel
 */
Logger.prototype.checkLevel = function()
{
    if(!this.level || this.level != global.debugLevel)
    {
        this.level = global.debugLevel || this.defaultLevel;
        this.info('Log level:', this.level);
    }
};
/**
 * Short level methods
 */

Logger.prototype.info = function()
{
    this.log('info', arguments);
};
Logger.prototype.debug = function()
{
    this.log('debug', arguments);
};
Logger.prototype.warn = function()
{
    this.log('warn', arguments);
};
Logger.prototype.error = function()
{
    this.log('error', arguments);
};

exports.plugin = new Logger();