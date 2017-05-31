if (!window.Widgets) Widgets = {};
if (typeof Widgets.Helpers == 'undefined') Widgets.Helpers = {};
Widgets.Helpers.endsWith = function(str, suffix) {
	return str.indexOf(suffix, str.length-suffix.length) !== -1;
};
Widgets.Helpers.Detect = function(){
	var info = {
		browser: {
			chrome: isBrowser('Chrome', 'Google Inc'),
			safari: isBrowser('Safari', 'Apple Computer'),
			firefox: navigator.userAgent.toLowerCase().indexOf('firefox') != -1,
			opera: typeof window.opera != 'undefined' &&
				   typeof window.opera.buildNumber != 'undefined',
			ie: navigator.appName == 'Microsoft Internet Explorer'
				? getIErevision("MSIE ([0-9]{1,}[\.0-9]{0,})")
				: navigator.appName == 'Netscape'
					? getIErevision("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})") : -1,
			mac: navigator.platform.toUpperCase().indexOf('MAC') != -1
		},
		features: {
			css: {
				transforms: cssProperty('transform'),
				transitions: cssProperty('transition')
			},
			js: {}
		}
	};
	info.browser.webkit = info.browser.chrome || info.browser.safari;
	info.browser.drag = function() {
		var b = info.browser, v = { able: 'dragable', ing: 'draging' },
			ie = '-ie', opera = '-opera', safariPc = '-safari-pc';
		if (b.safari && !b.mac) { v.able += safariPc; v.ing += safariPc; }
		else if (b.ie > -1) { v.able += ie; v.ing += ie; }
		else if (b.opera) { v.able += opera; v.ing += opera; }
		return v;
	}();
	info.features.js.rotateScale = !info.features.css.transforms && browser.ie > 0 ?
		browser.ie >= 6 && browser.ie < 8 ?
			function(t, a, s) {
				var sin = Math.sin(a), cos = Math.cos(a);
				t['filter'] = "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand', M11="+
					cos+", M12=-"+sin+", M21="+sin+", M22="+cos+")";
			} :
			function(t, a, s) {
				var sin = Math.sin(a), cos = Math.cos(a);
				t['-ms-filter'] = "\"progid:DXImageTransform.Microsoft.Matrix(SizingMethod='auto expand', M11="+
					cos+", M12=-"+sin+", M21="+sin+", M22="+cos+")\"";
			} :
		function(t, a, s) { t['transform'] = 'rotate('+a+'rad) scale('+s+')'; };

	function cssProperty(p) {
		var b = document.body || document.documentElement,
		s = b.style;
		if (typeof s == 'undefined') return false;
		if (typeof s[p] == 'string') return true;
		v = ['Moz', 'Webkit', 'Khtml', 'O', 'ms', 'Icab'],
		p = p.charAt(0).toUpperCase()+p.substr(1);
		for (var i = 0; i < v.length; i++)
			if (typeof s[v[i]+p] == 'string') return true;
	}
	function isBrowser(name, vendor) {
		return navigator.userAgent.indexOf(name) != -1
			&& navigator.vendor.indexOf(vendor) != -1;
	}
	function getIErevision(regex) {
		if ((new RegExp(regex)).exec(navigator.userAgent) != null)
			return parseFloat(RegExp.$1);
	}
	return info;
}();
Widgets.Helpers.Dimension = function(){
	var _p = Relator.$(), endsWith = Widgets.Helpers.endsWith,
		error = {
			number: 'invalid numeric value',
			measure: 'invalid measure string'
		},
		value = {
			get: function(that){ return _p.get(that).Value; },
			set: function(that, val){
				var _ = _p.get(that);
				if (typeof val == 'string') {
					_.Value = parseInt(val, 10);
					if (isNaN(_.Value)) throw new Error(error.number);
					if (endsWith(val, 'px')) _.Measure = true;
					else if (endsWith(val, '%')) _.Measure = false;
					else if (!isNaN(val)) _.Measure = that.Defaults.Measure;
					else throw new Error(error.measure);
				}
				else if (typeof val == 'number') _.Value = val;
				else throw new Error(error.number);
			}
		},
		measure = {
			get: function(that){ return _p.get(that).Measure ? 'px' : '%'; },
			set: function(that, meas){
				var _ = _p.get(that);
				if (typeof meas == 'boolean') _.Measure = meas;
				else if (typeof meas == 'string') {
					if (meas == 'px') _.Measure = true;
					else if (meas == '%') _.Measure = false;
					else throw new Error(error.measure);
				}
			}
		};

	function C(val, meas) {
		var _ = _p.set(this);
		if (typeof meas != 'undefined') measure.set(this, meas);
		else _.Measure = this.Defaults.Measure;
		if (typeof val != 'undefined') value.set(this, val);
		else _.Value = this.Defaults.Value;
    }

	C.prototype.Defaults = {
		Value: 0,
		Measure: false // for '%', true for 'px'
	};
	C.prototype.Value = function(val) {
		if (typeof val != 'undefined') value.set(this, val);
		else return value.get(this);
	};
	C.prototype.Measure = function(meas) {
		if (typeof meas != 'undefined') measure.set(this, meas);
		else return measure.get(this);
	};
	C.prototype.Destroy = function(){ destroy(this); };
	C.prototype.InPixels = function(){ return inPixels(this); };
	C.prototype.Html = function(){ return html(this); };

	function destroy(that) {
		_p.del(that);
		delete that;
	}
	function inPixels(that) { return _p.get(that).Measure; }
	function html(that) { return _p.get(that).Value+measure.get(that); }

	return C;
}();
Widgets.Helpers.Button = function(){
	var _p = Relator.$();

	function C(elem, start, stop) {
		var _ = _p.set(this);
		_.Elem = elem;
		_.Start = start;
		_.Stop = stop;
		_.Pressed = false;
	}

	C.prototype.Destroy = function(){ destroy(this); };
	C.prototype.Bind = function(){ bind(this); };
	C.prototype.UnBind = function(){ unBind(this); };

	function destroy(that) {
		_p.del(that); 
		delete that;
	}
	function bind(that) {
		var _ = _p.get(that);
		_.Elem.on('mousedown.animation', { that:that }, pressed).
			on('mouseup.animation mouseleave.animation', { that:that }, unPressed);
	}
	function unBind(that) { _p.get(that).Elem.off('.animation'); }

	function pressed(event) {
		var _ = _p.get(event.data.that);
		_.Pressed = true;
		_.Start();
	}
	function unPressed(event) {
		var _ = _p.get(event.data.that);
		if (_.Pressed) {
			_.Pressed = false;
			_.Stop();
		}
	}

	return C;
}();