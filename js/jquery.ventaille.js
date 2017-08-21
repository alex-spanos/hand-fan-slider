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
			firefox: isFirefox(),
			opera: isOpera(),
			ie: isIE(),
			mac: isMac()
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
	function isFirefox() {
		return navigator.userAgent.toLowerCase().indexOf('firefox') != -1;
	}
	function isOpera() {
		return typeof window.opera != 'undefined' &&
			   typeof window.opera.buildNumber != 'undefined';
	}
	function isIE() {
		if (navigator.appName == 'Microsoft Internet Explorer')
			return getIErevision("MSIE ([0-9]{1,}[\.0-9]{0,})");
		else if (navigator.appName == 'Netscape')
			return getIErevision("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
		return -1;
	}
	function getIErevision(regex) {
		if ((new RegExp(regex)).exec(navigator.userAgent) != null)
			return parseFloat(RegExp.$1);
	}
	function isMac() {
		return navigator.platform.toUpperCase().indexOf('MAC') != -1;
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
Widgets.Ventailles = {
	VentailleItem: function(){
		var _p = Relator.$(), browser = Widgets.Helpers.Detect.browser,
			setRotate = Widgets.Helpers.Detect.features.js.rotateScale,
			cssAnim = Widgets.Helpers.Detect.features.css.transitions && !browser.webkit,
			eventName = 'transitionend webkitTransitionEnd', className = 'transit-linear dur-',
			animPosition = cssAnim ?
				function(that, position, duration, callback) {
					var _ = _p.get(that), container = _.Container, click = _.Click,
						times = browser.webkit ? 1 : 4;
					duration = 100*Math.ceil(duration/100);
					var clazz = className+duration;
					container.on(eventName, function(){
						times--;
						if (!times) {
							container.add(click).removeClass(clazz);
							container.off(eventName);
							callback();
						}
					}).add(click).addClass(clazz);
					setPosition(that, position);
				} :
				function(that, position, duration, callback) {
					var _ = _p.get(that), container = _.Container, click = _.Click,
						positionA = that.Options.Position, startAngle = positionA.Angle,
						centerA = positionA.Center, Oa = positionA.Opacity, Sa = positionA.Scale,
						Xa = centerA.X.Value(), Ya = centerA.Y.Value(), meas = centerA.X.Measure(),
						Da = position.Angle-positionA.Angle,
						dX = (position.Center.X.Value()-Xa)/Da,
						dY = (position.Center.Y.Value()-Ya)/Da,
						dS = (position.Scale-Sa)/Da;
						dO = (position.Opacity-Oa)/Da;
					if (browser.safari) var contEl = container[0];
					that.Options.Position = position;
					container.css('z-index', position.Center.Z);
					$({ deg: startAngle }).animate({ deg: position.Angle },{
						duration: duration,
						easing: 'linear',
						step: function(now){
							var cor = now-startAngle, s = {
									'left': (Xa+cor*dX)+meas,
									'bottom': (Ya+cor*dY)+meas
								};
							setRotate(s, now, Sa+cor*dS);
							container.css(s);
							click.css('opacity', Oa+cor*dO);
							if (browser.safari) {
								contEl.style.display = 'none';
								contEl.offsetHeight;
								contEl.style.display = 'block';
							}
						},
						queue: false,
						complete: callback
					});
				};
		if (cssAnim) loadDurations();

		function C(container, options) {
			var _ = _p.set(this);
			_.Container = container;
			this.Options = $.extend(true, {}, this.Options);
			$.extend(true, this.Options.Image, options);
			var size = this.Options.Image.Size;
			size.Width = new Widgets.Helpers.Dimension(size.Width);
			size.Height = new Widgets.Helpers.Dimension(size.Height);
			_.Resizable = !(size.Width.InPixels() && size.Height.InPixels());
		}

		C.prototype.Options = {
			Image: {
				Url: '',
				Click: '',
				Alt: '',
				Title: '',
				Size: {
					Width: undefined,
					Height: undefined
				}
			}
		};
		C.prototype.Load = function(){ load(this); };
		C.prototype.Destroy = function(){ destroy(this); };
		C.prototype.Resizable = function(){ return resizable(this); };
		C.prototype.AdjustSize = function(){ adjustSize(this); };
		C.prototype.SetPosition = function(position){ setPosition(this, position); };
		C.prototype.AnimPosition = function(position, duration, callback) {
			animPosition(this, position, duration, callback);
		};

		function load(that) {
			var _ = _p.get(that), image = that.Options.Image,
				size = image.Size, width = size.Width, height = size.Height;
			_.Container.width(width.Html()).height(height.Html());
			var sizePx = getSizePx(that);
			_.Container.css('margin', '0 0 -'+
				height.Value()/2+height.Measure()+' -'+width.Value()/2+width.Measure());
			_.Click = $("<a />", {
				width:sizePx.width,
				height:sizePx.height,
				href:image.Click
			}).appendTo(_.Container);
			_.Image = $('<img>').load(function(){ _.Click.append(this); }).
				attr({'src':image.Url,'alt':image.Alt,'title':image.Title,
					'width':sizePx.width,'height':sizePx.height});
		}
		function destroy(that) {
			var size = that.Options.Image.Size;
			size.Width.Destroy();
			size.Height.Destroy();
			_p.del(that);
			delete that;
		}
		function resizable(that) { return _p.get(that).Resizable; }
		function adjustSize(that) {
			var _ = _p.get(that), sizePx = getSizePx(that), style = {
					'width':sizePx.width,
					'height':sizePx.height
				};
			_.Click.css(style);
			_.Image.attr(style);
		}
		function setPosition(that, position) {
			var _ = _p.get(that), center = position.Center;
			that.Options.Position = position;
			_.Click.css('opacity', position.Opacity);
			var s = {
				'left':center.X.Html(),
				'bottom':center.Y.Html(),
				'z-index':center.Z
			};
			setRotate(s, position.Angle, position.Scale);
			_.Container.css(s);
		}

		function getSizePx(that) {
			var container = _p.get(that).Container, size = that.Options.Image.Size;
			return {
				width: size.Width.InPixels() ? size.Width.Value() : container.width(),
				height: size.Height.InPixels() ? size.Height.Value() : container.height()
			}
		}
		function loadDurations() {
			var style = '<style>';
			for (var i = 1; i < 6; ++i)
				for (var c = 0; c < 10; ++c) style += formDuration(100*i+10*c);
			style += formDuration(600);
			style += '</style>';
			$('head').append(style);
		}
		function formDuration(ms) {
			return '.dur-'+ms+' { -o-transition-duration: '+ms+'ms; -webkit-transition-duration: '+
				ms+'ms; -moz-transition-duration: '+ms+'ms; transition-duration: '+ms+'ms; }\r\n';
		}

		return C;
	}(),
	Ventaille: function(){
		var _p = Relator.$(), util = Widgets.Helpers, drag = function(){
				var b = util.Detect.browser, v = { able: 'dragable', ing: 'draging' },
					ie = '-ie', opera = '-opera', safariPc = '-safari-pc';
				if (b.safari && !b.mac) { v.able += safariPc; v.ing += safariPc; }
				else if (b.ie > -1) { v.able += ie; v.ing += ie; }
				else if (b.opera) { v.able += opera; v.ing += opera; }
				return v;
			}();

		function C(selfId, options) {
			var _ = _p.set(this), $self = $('div#'+selfId), self = this;
			_.SelfId = selfId;
			this.Options = $.extend(true, {}, this.Options);
			$.extend(true, this.Options, options);
			this.Options.Radious = new util.Dimension(this.Options.Radious);
			this.Options.CenterY = new util.Dimension(this.Options.CenterY);
			_.Visible = 0;
			_.Position = this.Options.Extra;
			_.Positions = [];
			_.Items = [];
			var sel = this.Options.Selectors;
			_.Container = $self.find('.'+sel.target).eq(0);
			_.Content = $self.find('.'+sel.content).eq(0);
			_.Ratio = $self.find('.'+sel.ratio).eq(0);
			var ctrl = this.Options.Controls;
			if (ctrl.buttons || ctrl.gesture) _.Animation = {
				KeepMoving: false,
				Moving: false,
				Direction: true, // for CW, false for CCW
				Duration: 0,
				Completed: 0,
				Callback: function(){ animationComplete(self); }
			};
			if (ctrl.buttons) {
				var unPressedCb = function(){ animationStop(self); };
				_.Buttons = {
					Left: new util.Button($self.find('.'+sel.buttons.left),
						function(){ animationStart(self, true); }, unPressedCb),
					Right: new util.Button($self.find('.'+sel.buttons.right),
						function(){ animationStart(self, false); }, unPressedCb)
				};
			}
			$(window).on('resize.ventailles.'+selfId, function(){ self.Resize(); });
		}

		C.prototype.Options = {
			MaxVisible: 11,
			Extra: 2,
			Radious: '40%', // of width
			CenterY: '-25%', // of width
			MaxScale: 0.4,
			Controls: {
				buttons: false,
				gesture: true
			},
			Selectors: {
				dataAttr: 'ventaille-item',
				target: 'ventaille-target',
				content: 'ventaille-content',
				ratio: 'ventaille-ratio',
				buttons: {
					left: 'left.ventaille-button',
					right: 'right.ventaille-button'
				}
			}
		};
		C.prototype.Load = function(){ load(this); };
		C.prototype.Destroy = function(){ destroy(this); };
		C.prototype.Resize = function(){ resize(this); };

		function load(that) {
			var _ = _p.get(that), dataAttr = that.Options.Selectors.dataAttr,
				itemContainers = _.Container.find('div['+dataAttr+']'),
				l = itemContainers.length;
			if (l == 0) return;
			for (var i = 0; i < l; ++i) {
				var itemContainer = itemContainers.eq(i);
				itemContainer.attr('id', _.SelfId+'-item-'+i);
				(_.Items[i] = new Widgets.Ventailles.VentailleItem(
					itemContainer, $.parseJSON(itemContainer.attr(dataAttr)))
				).Load();
				itemContainer.removeAttr(dataAttr);
			}
			adjust(that);
			bindControls(that);
		}
		function destroy(that) {
			var _ = _p.get(that), l = _.Items.length;
			unBindControls(that);
			$(window).off('resize.ventailles.'+_.SelfId);
			if (that.Options.Controls.buttons) {
				_.Buttons.Left.Destroy();
				_.Buttons.Right.Destroy();
			}
			for (var i = 0; i < l; ++i) _.Items[i].Destroy();
			_p.del(that);
			delete that;
		}
		function resize(that) {
			var items = _p.get(that).Items;
			unBindControls(that);
			for (var i = 0; i < items.length; ++i) {
				var item = items[i];
				if (item.Resizable()) item.AdjustSize();
			}
			bindControls(that);
		}

		function adjust(that) {
			var _ = _p.get(that), items = _.Items, opts = that.Options,
				l = items.length, d = l-opts.MaxVisible+2*opts.Extra;
			if (d < 0) {
				_.Visible = l;
				_.Position = opts.Extra = 0;
			} else _.Visible = opts.MaxVisible;
			var r = opts.Radious, c = opts.CenterY, inPixels = r.InPixels() && c.InPixels();
			if (_.Visible%2 != 1) throw new Error('number of visible items must be odd and greater than 2');
			if (!inPixels && (r.InPixels() || c.InPixels())) throw new Error('pixels/percentage conflict');
			var p = _.Position, s = _.Visible+opts.Extra+p, pos = _.Positions, k = _.Container.width();
			d = p-opts.Extra;
			shape(that, inPixels, k, r.Value(), c.Value(), _.Visible, opts.Extra, itemsPad(that, r, k));
			k = _.Center;
			for (p = 0; p < d; ++p) items[p].SetPosition(k);
			for (p = d; p < s; ++p) items[p].SetPosition(pos[p-d]);
			for (p = s; p < l; ++p) items[p].SetPosition(k);
		}
		function shape(that, inPixels, w, r, c, v, e, p) {
			var _ = _p.get(that), pos = _.Positions, q = Math.abs(c), x = inPixels ? w/2 : 50,
				phi = Math.asin(q/r), theta = (Math.PI+(c>0?1:-1)*2*phi)/(v-1),
				sin = Math.sin(theta), cos = Math.cos(theta), m = Math.floor(v/2),
				s = that.Options.MaxScale/m, z = m+e, a = 1.0/z, b = v+e-1, t = b+e;
			_.Center = transfer(create(0, -q, inPixels, 0, 0, 1, 1), x, c);
			pos[e] = create(Math.sqrt(Math.pow(r,2)-Math.pow(c,2)), -c, inPixels, e, Math.PI/2-phi, 1, e*a);
			for (var i = e-1; i >= 0; --i)
				pos[i] = next(pos[i+1], inPixels, -sin, cos, -theta, i, 1+(i-e)*s, i*a);
			for (i = e+1; i <= z; ++i)
				pos[i] = next(pos[i-1], inPixels, sin, cos, theta, i, 1+(i-e)*s, i*a);
			for (i = z+1; i <= t; ++i)
				pos[i] = next(pos[i-1], inPixels, sin, cos, theta, t-i, 1+(b-i)*s, (t-i)*a);
			for (i = 0; i <= t; ++i) transfer(pos[i], x, c);
			r += c+p;
			i = round(inPixels ? 100/w*r : r);
			_.Ratio.css('padding-bottom', i+'%');
			_.Content.css('bottom', round(100*(100-i)/i)+'%');
		}
		function next(position, inPixels, sin, cos, theta, z, s, o) {
			var center = position.Center, a = position.Angle,
				x = center.X.Value(), y = center.Y.Value();
			return create(x*cos-y*sin, x*sin+y*cos, inPixels, z, a-theta, s, o);
		}
		function transfer(position, dx, dy) {
			var center = position.Center, x = center.X.Value(), y = center.Y.Value();
			center.X.Value(round(x+dx));
			center.Y.Value(round(y+dy));
			return position;
		}
		function create(x, y, inPixels, z, angle, scale, opacity) { return {
			Center: {
				X: new util.Dimension(round(x), inPixels),
				Y: new util.Dimension(round(y), inPixels),
				Z: z
			},
			Angle: round(angle),
			Scale: round(scale),
			Opacity: round(opacity)
		};}
		function itemsPad(that, r, c) {
			var items = _p.get(that).Items, l = items.length,
				t = m = 0, inPixels = r.InPixels(), v = r.Value();
			for (var p = 0; p < l; ++p) {
				var s = items[p].Options.Image.Size;
				t = itemPad(v, getValue(s.Width, inPixels, c), getValue(s.Height, inPixels, c));
				if (t > m) m = t;
			}
			return round(m*(that.Options.MaxScale+1));
		}
		function itemPad(r, w, h) { return round(Math.sqrt(r*(r+h)+(Math.pow(w,2)+Math.pow(h,2))/4)-r); }
		function getValue(d, inPixels, w) { return inPixels
			? d.InPixels() ? d.Value() : w*d.Value()/100
			: d.InPixels() ? 100*d.Value()/w : d.Value();
		}
		function round(num) { return Math.round(1000*num)/1000; }

		function turn(that, cw, duration) {
			var _ = _p.get(that), items = _.Items, l = items.length, i = 0,
				p = _.Position, pos = _.Positions, animCb = _.Animation.Callback,
				ext = that.Options.Extra, s = _.Visible+ext+p, d = p-ext;
			if (cw) {
				items[normalize(d, l)].SetPosition(_.Center);
				d++; p++;
				for (i = d; i < s; i++)
					items[normalize(i, l)].AnimPosition(pos[i-d], duration, animCb);
				items[normalize(s, l)].SetPosition(pos[i-d]);
			} else {
				s--; d--; p--;
				items[normalize(s, l)].SetPosition(_.Center);
				for (i = s-1; i > d; i--)
					items[normalize(i, l)].AnimPosition(pos[i-d], duration, animCb);
				items[normalize(d, l)].SetPosition(pos[i-d]);
			}
			_.Position = normalize(p, l);
		}
		function normalize(dividend, divisor) { return ((dividend%divisor)+divisor)%divisor; }

		function animationComplete(that) {
			var _ = _p.get(that), l = _.Visible+2*that.Options.Extra-1, anim = _.Animation;
			if (!anim.Moving) return;
			anim.Completed++;
			if (anim.Completed == l) {
				anim.Moving = false;
				anim.Completed = 0;
				animateIf(that, anim.KeepMoving);
			}
		}
		function animationStart(that, direction) {
			var anim = _p.get(that).Animation;
			anim.KeepMoving = true;
			anim.Direction = direction;
			animateIf(that, !anim.Moving);
		}
		function animationStop(that) { _p.get(that).Animation.KeepMoving = false; }
		function animateIf(that, term) {
			var anim = _p.get(that).Animation;
			if (term == true) {
				anim.Moving = true;
				turn(that, anim.Direction, anim.Duration);
			}
		}

		function bindControls(that) {
			var controls = that.Options.Controls;
			if (controls.buttons) bindButtons(that);
			if (controls.gesture) bindGesture(that);
		}
		function unBindControls(that) {
			var controls = that.Options.Controls;
			if (controls.buttons) unBindButtons(that);
			if (controls.gesture) unBindGesture(that);
		}
		function bindButtons(that) {
			var buttons = _p.get(that).Buttons;
			buttons.Left.Bind();
			buttons.Right.Bind();
		}
		function unBindButtons(that) {
			var buttons = _p.get(that).Buttons;
			buttons.Left.UnBind();
			buttons.Right.UnBind();
		}
		function bindGesture(that) {
			var _ = _p.get(that), container = _.Container, anim = _.Animation,
				step = getValue(that.Options.Radious, true, container.width())/(_.Visible+1),
				draging = false, x0 = t0 = 0;
			container.addClass(drag.able);
			container.on('mousedown', function(e){
				e.preventDefault();
				container.removeClass(drag.able).addClass(drag.ing);
				x0 = e.pageX;
				t0 = new Date().getTime();
				draging = true;
			}).on('mouseup', function(){
				container.removeClass(drag.ing).addClass(drag.able);
				draging = false;
				animationStop(that);
			}).on('mousemove', function(e){
				var dx = dt = x1 = t1 = d = 0;
				if (draging) {
					x1 = e.pageX;
					t1 = new Date().getTime();
					dx = x1-x0;
					dt = t1-t0;
					if (Math.abs(dx) > step) {
						x0 = x1;
						t0 = t1;
						d = round(step/Math.abs(dx/dt));
						if (d > 600) d = 600;
						if (d < 100) d = 100;
						anim.Duration = d;
						setTimeout(function(){ if (Math.abs(x0-x1) < step) animationStop(that); }, d+10);
						animationStart(that, dx > 0);
					}
				}
			}).on('mouseleave', function(){ container.trigger('mouseup'); });
		}
		function unBindGesture(that) {
			_p.get(that).Container.off('mousedown mouseup mousemove mouseleave');
		}

		return C;
	}(),
	Instances: {}
};
(function($){
	var methods = {
		init: function(options){ return this.each(function(){
			var selfId = $(this).attr('id');
			Widgets.Ventailles.Instances[selfId] = new Widgets.Ventailles.Ventaille(selfId, options);
		});},
		load: function(){ return this.each(function(){
			Widgets.Ventailles.Instances[$(this).attr('id')].Load();
		});},
		destroy: function(){ return this.each(function(){
			Widgets.Ventailles.Instances[$(this).attr('id')].Destroy();
		});}
	};
	$.fn.ventaille = function(method) {
		if (methods[method])
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		else if (typeof method === 'object' || !method)
			return methods.init.apply(this, arguments);
		else $.error('Method "'+method+'" does not exist on jQuery.Ventaille');
	};
})(jQuery);
$(function(){ $('.ventaille').ventaille().ventaille('load'); });