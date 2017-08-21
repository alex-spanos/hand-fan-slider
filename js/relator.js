var Relator = function () {
    function indexOf (value) {
        for (var i = 0, length = this.length; i < length; i++)
			if (this[i] === value) return i;
        return -1;
    }
    function Relator () {
        var Stack = [], Array = [];
        if (!Stack.indexOf) Stack.indexOf = indexOf;
        return {
            $ : function () { return Relator(); },
            del: function(value) {
                var i = Stack.indexOf(value);
                if (~i) {
                    Stack.splice(i, 1);
                    Array.splice(i, 1);
                }
                return this;
            },
            get: function(value) { return Array[Stack.indexOf(value)]; },
            len: function() { return Stack.length; },
            set: function(value) {
                var i = Stack.indexOf(value);
                return ~i ? Array[i] : Array[Stack.push(value) - 1] = {};
			}
        };
    }
    return Relator();
}();