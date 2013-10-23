'use strict';

module.exports = deferrer;
deferrer.Deferrer = Deferrer;

var util    = require('./lib/util');
var async   = require('async');


function deferrer (options) {
    return new Deferrer(options || {});
}


function Deferrer (options) {
    this._host = options.host;
    this._type = options.type || 'parallel';

    var key = '_deferred_queue';

    Object.defineProperty(this._host, '_deferred', {
        set: function (value) {
            if ( !this.hasOwnProperty(key) ) {
                this[key] = [];
            }

            this[key].push(value);
        }
    });
}


function CHAIN () {
    return this;
};


Deferrer.prototype.promise = function(method_name, origin_name, options) {
    options = options || {};

    var method = this._check_method(origin_name, 'The second parameter of `promise`');
    var props = {};

    props[method_name] = {
        value: function () {
            this._deferred = {
                args        : util.makeArray(arguments),
                method      : method,
                // name        : method_name
            };

            if ( options.once ) {
                this[method_name] = CHAIN;
            }

            if ( options.extra ) {
                extra.apply(this, arguments);
            }

            return this;
        }
    };

    Object.defineProperties(this._host, props);

    return this;
};


Deferrer.prototype._run_async = function(arr, context, callback) {
    var async_method = this._type === 'parallel' ? 'each' : 'eachSeries';
    var self = this;

    async[async_method](arr, function (item, done) {
        var method = item.method;
        var args = item.args;

        self._run_method(method, context, args, done);

    }, callback);
};


Deferrer.prototype._run_method = function(method, context, args, done) {
    // async:
    // function(args, done){}
    if ( method.length === 2 ) {
        method.call(context, args, done);

    } else {
        var result = method.call(context, args);
        done(null, result);
    }
};


Deferrer.prototype._check_method = function(method, message_slice) {
    if ( typeof method === 'string' ) {
        method = this._host[method];
    }

    if ( typeof method !== 'function' ) {
        throw new Error( message_slice + ' must be an function or an existing method name');
    }

    return method;
};


// @param {Object} done done logic
Deferrer.prototype.done = function(name, done) {
    if ( arguments.length === 1 ) {
        done = name;
        name = 'done';
    }

    done = this._check_method(done, '`done`');

    var self = this;
    var props = {};
    
    props[name] = {
        // @param {Object} callback user callback
        value: function (callback) {
            var sub_self = this;
            self._run_async(this._deferred_queue, this, function(err){
                sub_self._deferred_queue.length = 0;
                self._run_method(done, sub_self, err, callback);
            });
        }
    };

    Object.defineProperties(this._host, props);

    return this;
};


