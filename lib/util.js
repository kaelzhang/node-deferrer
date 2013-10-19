'use strict';

var util = module.exports = {};

var node_fs = require('fs');

util.makeArray = function (subject) {
    if ( subject === undefined || subject === null ) {
        return [];
    
    } else if ( Array.isArray(subject) ) {
        return subject;

    } else if ( util.isArguments(subject) ) {
        return Array.prototype.slice.call(subject);
    
    } else {
        return [subject];
    }
};


util.mix = function (receiver, supplier, override){
    var key;

    if(arguments.length === 2){
        override = true;
    }

    for(key in supplier){
        if(override || !(key in receiver)){
            receiver[key] = supplier[key]
        }
    }

    return receiver;
};


util.flatten = function (array) {
    return array.reduce(function (prev, current) {
        return prev.concat(current);

    }, []);
};


var toString = Object.prototype.toString;

util.isArguments = function (subject) {
    return toString.call(subject) === '[object Arguments]';
};


util.isDir = function (name) {
    return node_fs.existsSync(name) && node_fs.statSync(name).isDirectory();
};