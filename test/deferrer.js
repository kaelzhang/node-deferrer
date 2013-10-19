'use strict';

var expect = require('chai').expect;
var deferrer = require('../');


describe("description", function(){
    function Foo () {
        this._result = [];
    }

    Foo.prototype.result = function() {
        return this._result;
    };

    Foo.prototype._a = function(args, done) {
        var self = this;

        setTimeout(function () {
            self._result.push(args);
            done(null);
        }, 10);
    };

    Foo.prototype._b = function(args) {
        var self = this;
        self._result.push(args);
        return args;
    };

    deferrer({
        host: Foo.prototype
    })
    .promise('a', '_a')
    .promise('b', '_b')
    .done(function(err, done){
        done(err, this);
    });

    it("queued", function(done){
        new Foo().a(1, 2).b(3, 4).done(function(err, self){
            expect(err).to.equal(null);
            expect(self._result).to.deep.equal([ [ 3, 4 ], [ 1, 2 ] ]);
            done();
        })
    });
});