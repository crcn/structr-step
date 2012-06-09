var tq = require("tq");

exports.name = "step";
exports.type = "operator";
exports.factory = function(that, property, value) {

	if(!that.step) {
		that.step = function(fn) {

			//more than one function to step? add all of them onto the stepping function
			if(arguments.length > 1) {
				for(var i = 0, n = arguments.length; i < n; i++) {
					this.step(arguments[i]);
				}
				return this;
			}

			var cqueue = this._cqueue;

			//this will be called if an async function is called for the first time, OR
			//if an async function is called WITHIN an async function
			if(!this._cqueue || this._callingStepper) {
				cqueue = this._cqueue  = tq.queue().start();
				this._callingStepper   = false;
			}

			var self = this;

				//flag the class so that the current queue gets overwritten if another async function
				//is called within this one. 
				self._callingStepper = true;



			cqueue.push(function() {

				var args = Array.prototype.slice.call(arguments, 0),
				next = this;

				args[fn.length - 1] = function() {

					var args = arguments;

					if(self._cqueue != cqueue) {
						self._cqueue.push(function() {	
							next.apply(self, args);
							self._cqueue = cqueue;
							this();
						})
					} else {
						next.apply(self, args);
					}

				};



				fn.apply(self, args);

				//we've exited out of the function, so remove the flag
				self._callingStepper = false;

				// self._cqueue = cqueue;

			});

			return this;
		}
	}


	return function() {

		var args = Array.prototype.slice.call(arguments, 0),
		tole = typeof args[args.length - 1],
		orgNext;

		if(tole == "function" || tole == "undefined") {
			orgNext = args.pop();
		}

		if(!orgNext) {
			orgNext = function(){};
		}

		var self = this;

		return this.step(function(nextQueuedFn) {

			args.push(function() {
				nextQueuedFn();
				var args = arguments;
				self.step(function(next) {
					orgNext.apply(this, args);
					next();
				});

			});


			value.apply(this, args);
		});
	}
}