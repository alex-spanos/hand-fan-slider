Widgets.Sliders = {
	Class: function(){
		var _p = Relator.$();

		function C(selfId, options) {
			var _ = _p.set(this), $self = $('div#'+selfId), self = this;
			_.SelfId = selfId;
			this.Options = $.extend(true, {}, this.Options);
			$.extend(true, this.Options, options);
			var sel = this.Options.Selectors;
			_.Container = $self.find('.'+sel.target).eq(0);
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
		}

		C.prototype.Options = {
			Selectors: {
				target: 'ventaille-target',
				buttons: {
					left: 'left.ventaille-button',
					right: 'right.ventaille-button'
				}
			}
		};

		function getValue(d, inPixels, w) { return inPixels
			? d.InPixels() ? d.Value() : w*d.Value()/100
			: d.InPixels() ? 100*d.Value()/w : d.Value();
		}

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
			container.on('vmousedown', function(e){
				e.preventDefault();
				container.removeClass(drag.able).addClass(drag.ing);
				x0 = e.pageX;
				t0 = new Date().getTime();
				draging = true;
			}).on('vmouseup', function(){
				container.removeClass(drag.ing).addClass(drag.able);
				draging = false;
				animationStop(that);
			}).on('vmousemove', function(e){
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
			}).on('mouseleave', function(){ container.trigger('vmouseup'); });
		}
		function unBindGesture(that) {
			_p.get(that).Container.off('vmousedown vmouseup vmousemove mouseleave');
		}

		return C;
	}(),
	Instances: {}
};