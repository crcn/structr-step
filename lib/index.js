var tq = require("tq");

exports.name = "step";
exports.type = "operator";
exports.factory = function(that, property, value) {

	return function() {

		//if the current queue does NOT exist, OR there IS a current function (embedded step), then create a queue
		if(!this._cqueue || this._cfun) {
			this._cqueue = tq.queue().start();
			this._cfun   = null;
		}

		//remove the old callback function
		var args = Array.prototype.slice.apply(arguments),
		next = typeof args[args.length-1] == "function" ? args.pop() : function(){},
		self = this;

		//pop the function onto the queue
		this._cqueue.push(function() {

			var nextQueue = this;

			//pop on the NEW callback function (triggers next on queue)
			args.push(function() {
				next.apply(this, arguments);
				nextQueue();
			});

			//keep tabs on the old queue incase there are sub-stepping functions
			var oldQueue = self._cqueue;

			//set the CURRENT function incase the original callback is calling
			//stepped functions
			self._cfun = value;

			//apply to the original fn
			value.apply(self, args);

			self._cfun   = null;
			self._cqueue = oldQueue;
		});
	}
}