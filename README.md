### Structr-step makes asyncronous function chainable

### Example
```javascript

var structr = require("structr"),
fs = require("fs");

structr.mixin(require("structr-step"));



var TestClass = structr({
	
	
	/**
	 */

	"step asyncFn": function(path, next) {
		fs.readFile(path, next);
	},

	/**
	 */

	"step asyncFn2": function(path, next) {
		fs.readFile(path, next);
	}
});



var test = new TestClass();
test.asyncFn(__filename, function(err, content) {
	
});
test.asyncFn2(__filename, function(err, stat) {
	
});
```