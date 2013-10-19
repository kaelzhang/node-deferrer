# deferrer [![NPM version](https://badge.fury.io/js/checker.png)](http://badge.fury.io/js/deferrer) [![Build Status](https://travis-ci.org/kaelzhang/node-deferrer.png?branch=master)](https://travis-ci.org/kaelzhang/node-deferrer) [![Dependency Status](https://gemnasium.com/kaelzhang/node-deferrer.png)](https://gemnasium.com/kaelzhang/node-deferrer)

Deferrer is a fast promise-object generator.

```
function Foo (){}

Foo.prototype._a = function (args, done) {
	setTimeout(function (){
		console.log('a', args);
		done(null);
	
	}, 100);
}

Foo.prototype._b = function (args, done) {
	process.nextTick(function(){
		console.log('b', args);
		done(null);
	});
}

Foo.prototype._done = function(err, callback){
	callback(err);
}

var deferrer = require('deferrer');

deferrer({
	host: Foo.prototype
	type: 'parallel'
})
.promise('a', '_a')
.promise('b', '_b')
.done('_done');

var foo = new Foo();

foo.a(1, 2).b(3, 4).done(function(err){
	console.log('done');
});

// b [3, 4]
// a [1, 3]
// done
```