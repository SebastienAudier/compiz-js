var video;

(function ($) {

    $.fn.filterByData = function (prop, val) {
        var $self = this;
        if (typeof val === 'undefined') {
            return $self.filter(
                function () { return typeof $(this).data(prop) !== 'undefined'; }
            );
        }
        return $self.filter(
            function () { return $(this).data(prop) == val; }
        );
    };

})(window.jQuery);

var events = new Events();

events.add = function(obj) {
  obj.events = { };
}

events.implement = function(fn) {
  fn.prototype = Object.create(Events.prototype);
}

function Events() {
  this.events = { };
}

Events.prototype.on = function(name, fn) {
  var events = this.events[name];
  if (events == undefined) {
    this.events[name] = [ fn ];
    this.emit('event:on', fn);
  } else {
    if (events.indexOf(fn) == -1) {
      events.push(fn);
      this.emit('event:on', fn);
    }
  }
  return this;
}

Events.prototype.once = function(name, fn) {
  var events = this.events[name];
  fn.once = true;
  if (!events) {
    this.events[name] = [ fn ];
    this.emit('event:once', fn);
  } else {
    if (events.indexOf(fn) == -1) {
      events.push(fn);
      this.emit('event:once', fn);
    }
  }
  return this;
}

Events.prototype.emit = function(name, args) {
  var events = this.events[name];
  if (events) {
    var i = events.length;
    while(i--) {
      if (events[i]) {
        events[i].call(this, args);
        if (events[i].once) {
          delete events[i];
        }
      }
    }
  }
  return this;
}

var userPrefix;

var prefix = (function () {
  var styles = window.getComputedStyle(document.documentElement, ''),
    pre = (Array.prototype.slice
      .call(styles)
      .join('') 
      .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
    )[1],
    dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
  userPrefix = {
    dom: dom,
    lowercase: pre,
    css: '-' + pre + '-',
    js: pre[0].toUpperCase() + pre.substr(1)
  };
})();

function bindEvent(element, type, handler) {
	if(element.addEventListener) {
		element.addEventListener(type, handler, false);
	} else {
		element.attachEvent('on' + type, handler);
	}
}

function Viewport(data) {
  events.add(this);

  var self = this;

  this.element = document.getElementsByClassName('cube')[0];
  
  // Rotation variables
  this.fps = 30;
  this.sensivity = 0.1;
  this.sensivityFade = 0.93;
  this.touchSensivity = 1.5;
  this.speed = 1;
  this.lastX = 0;
  this.lastY = 0;
  this.mouseX = 0;
  this.mouseY = 0;
  this.distanceX = 0;
  this.distanceY = 0;
  this.positionX = 360;
  this.positionY = 0;  
  this.torqueX = 0;
  this.torqueY = 0;  
  
  // Transition variables
  this.isOnTransitionToCube = false;
  this.isCubeMode = false;
  this.down = false;
  this.upsideDown = false;
  this.currentSide = 0;
  this.calculatedSide = 0;
  
  // Have to be synchronize with css Layer
  this.delayForTransition = 500;
  this.defaultZTranslateSide = 300; 
  
  // Dialogs variables
  this.reliefInterval = 50;

	this.switchToCube = function() {
		self.isOnTransitionToCube = true;
		side = $(".side.active");
		self.initCubeTransformation(side);
		board = $(".board.current");
		self.transitToCube(board, side);
		dialogs = $(".board.current .dialog").toArray();
		videosPlaying = self.collectVideosPlaying(dialogs);
		setTimeout(function () {
			if(self.isOnTransitionToCube) {
				self.isOnTransitionToCube = false;
				board.detach();
				side.append(board);
				self.fullScreen(board);
				dialogs.sort(function(a, b) {return(Number(a.style.zIndex) - Number(b.style.zIndex))});
				var index = self.defaultZTranslateSide + self.reliefInterval;
				for(var i=0; i<dialogs.length; i++) {
					layer = $(document.createElement('div'));
					layer.copyCSS(side);
					layer.addClass("layer");
					layer.data("index", side.index());
					layer.css("transform", layer.css("transform").replace(self.defaultZTranslateSide, index));
					dialog = $(dialogs[i]);	
					
					// clone dialog on other component if it is not cloned...
					
					dialog.detach();
					$(".cube").append(layer);
					layer.append(dialog);
					for (var j=0; j < videosPlaying.length; j++) {
						videosPlaying[j].play();	
					}
					index += self.reliefInterval;
				} 
				self.isCubeMode = true;
			}		
		}, self.delayForTransition);
	}
	
	this.initCubeTransformation = function(side) {
		if(side.index() == 1) {
			self.positionX = 0;
			self.positionY = 0;
			$(".cube").css("transform", 'rotateX(' + self.positionY + 'deg) rotateY(' + self.positionX + 'deg)');
		}
		if(side.index() == 2) {
			self.positionX = 270;
			self.positionY = 360;
			$(".cube").css("transform", 'rotateX(' + self.positionY + 'deg) rotateY(' + self.positionX + 'deg)');
		}
		if(side.index() == 3) {
			self.positionX = 180;
			self.positionY = 360;
			$(".cube").css("transform", 'rotateX(' + self.positionY + 'deg) rotateY(' + self.positionX + 'deg)');
		}
		if(side.index() == 4) {
			self.positionX = 90;
			self.positionY = 360;
			$(".cube").css("transform", 'rotateX(' + self.positionY + 'deg) rotateY(' + self.positionX + 'deg)');
		}
	}
	
	this.collectVideosPlaying = function (dialogs) {
		videosPlaying = [];
		for(var i=0; i<dialogs.length; i++) {
			dialog = $(dialogs[i]);
			videos = dialog.find("video");
			for (var j=0; j < videos.length; j++) {
				video = videos[j];
				if(!video.paused) {
					videosPlaying.push(video);
				}
			}
		}
		return videosPlaying;
	}
	
	this.switchToDesktop = function() {
		board = $(".board.current");	
		dialogs = $(".layer .dialog").toArray();
		videosPlaying = self.collectVideosPlaying(dialogs);
		if(self.isOnTransitionToCube) {
			self.fullScreen(board);
			self.isOnTransitionToCube = false;
		} else if(self.isCubeMode) {
			layers = $(".layer").filterByData('index', $(".side.active").index());
			for(var i=0; i<layers.length; i++) {
				dialog = $(layers[i]).children();
				width = (dialog.width() / dialog.parent().width()) * 100;
				height = (dialog.height() / dialog.parent().height()) * 100;
				dialog.detach();
				board.append(dialog);
				dialog.css("width", width + "%");
				dialog.css("height", height + "%");
			}
			layers.remove();
			board.detach();
			$(".desktop").prepend(board);
			for (var j=0; j < videosPlaying.length; j++) {
				videosPlaying[j].play();	
			}
			self.isCubeMode = false;
		}
	}

	this.transitToCube = function(board, side) {
		
		var left   = side[0].getBoundingClientRect().left   + $(window)['scrollLeft']();
		var right  = side[0].getBoundingClientRect().right  + $(window)['scrollLeft']();
		var top    = side[0].getBoundingClientRect().top    + $(window)['scrollTop']();
		var bottom = side[0].getBoundingClientRect().bottom + $(window)['scrollTop']();
		
		board.css('width', (right - left)  + "px");
		board.css('height', (bottom - top) + "px");
		board.css('margin-left', left + "px");
		board.css('margin-top', top + "px");
	}
  
	this.fullScreen = function (aJQuery) {
		aJQuery.css('width', '100%');
		aJQuery.css('height', '100%');
		aJQuery.css('margin-left', '0px');
		aJQuery.css('margin-top', '0px');
	}
  
  bindEvent(document, 'mousedown', function() {
	self.down = true;
  });

  bindEvent(document, 'mouseup', function() {
	self.down = false;
  });
  
  bindEvent(document, 'keydown', function(e) {
	if(e.keyCode == 17) {
		if(!(self.isOnTransitionToCube || self.isCubeMode)) {
			self.switchToCube();
		}
	}
  });
  
  bindEvent(document, 'keyup', function() {
	self.down = false;
	self.switchToDesktop();
  });

  bindEvent(document, 'mousemove', function(e) {
	self.mouseX = e.pageX;
	self.mouseY = e.pageY;

  });

  bindEvent(document, 'touchstart', function(e) {
	self.down = true;
    e.touches ? e = e.touches[0] : null;
    self.mouseX = e.pageX / self.touchSensivity;
    self.mouseY = e.pageY / self.touchSensivity;
    self.lastX  = self.mouseX;
    self.lastY  = self.mouseY;
  });

	bindEvent(document, 'touchmove', function(e) {
	
	if(e.preventDefault) { 
		e.preventDefault();
    }

    if(e.touches.length == 1) {
		e.touches ? e = e.touches[0] : null;
		self.mouseX = e.pageX / self.touchSensivity;
		self.mouseY = e.pageY / self.touchSensivity;

		}
	});

	bindEvent(document, 'touchend', function(e) {
		self.down = false;
	});  
  
	setInterval(this.animate.bind(this), this.fps);
}

events.implement(Viewport);
Viewport.prototype.animate = function() {
	
	if(this.isCubeMode) {
		
		
	  this.distanceX = (this.mouseX - this.lastX);
	  this.distanceY = (this.mouseY - this.lastY);

	  this.lastX = this.mouseX;
	  this.lastY = this.mouseY;

	  if(this.down) {
		this.torqueX = this.torqueX * this.sensivityFade + (this.distanceX * this.speed - this.torqueX) * this.sensivity;
		this.torqueY = this.torqueY * this.sensivityFade + (this.distanceY * this.speed - this.torqueY) * this.sensivity;
	  }

	  if(Math.abs(this.torqueX) > 1.0 || Math.abs(this.torqueY) > 1.0) {
		if(!this.down) {
		  this.torqueX *= this.sensivityFade;
		  this.torqueY *= this.sensivityFade;
		}

		this.positionY -= this.torqueY;

		if(this.positionY > 360) {
		  this.positionY -= 360;
		} else if(this.positionY < 0) {
		  this.positionY += 360;
		}

		if(this.positionY > 90 && this.positionY < 270) {
		  this.positionX -= this.torqueX;

		  if(!this.upsideDown) {
			this.upsideDown = true;
		  }

		} else {

		  this.positionX += this.torqueX;

		  if(this.upsideDown) {
			this.upsideDown = false;
		  }
		}

		if(this.positionX > 360) {
		  this.positionX -= 360;
		} else if(this.positionX < 0) {
		  this.positionX += 360;
		}

		if(!(this.positionY >= 46 && this.positionY <= 130) && !(this.positionY >= 220 && this.positionY <= 308)) {
		  if(this.upsideDown) {
			if(this.positionX >= 42 && this.positionX <= 130) {
			  this.calculatedSide = 3;
			} else if(this.positionX >= 131 && this.positionX <= 223) {
			  this.calculatedSide = 2;
			} else if(this.positionX >= 224 && this.positionX <= 314) {
			  this.calculatedSide = 5;
			} else {
			  this.calculatedSide = 4;
			}
		  } else {
			if(this.positionX >= 42 && this.positionX <= 130) {
			  this.calculatedSide = 5;
			} else if(this.positionX >= 131 && this.positionX <= 223) {
			  this.calculatedSide = 4;
			} else if(this.positionX >= 224 && this.positionX <= 314) {
			  this.calculatedSide = 3;
			} else {
			  this.calculatedSide = 2;
			}
		  }
		} else {
		  if(this.positionY >= 46 && this.positionY <= 130) {
			this.calculatedSide = 6;
		  }

		  if(this.positionY >= 220 && this.positionY <= 308) {
			this.calculatedSide = 1;
		  }
		}

		if(this.calculatedSide !== this.currentSide) {
		  this.currentSide = this.calculatedSide;
		  this.emit('sideChange');
		}
	  }
	  
	  var absoluteY = 0;
	  if(this.positionY > 180) {
		 absoluteY = Math.max(310, this.positionY);
	  } else {
		  absoluteY = Math.min(20, this.positionY);
	  }
	  
		this.element.style[userPrefix.js + 'Transform'] = 'rotateX(' + absoluteY + 'deg) rotateY(' + this.positionX + 'deg)';
	  
	  //if(this.down) {
		//$("body").css("background-position-x", (window.innerWidth - this.lastX) * (2 * this.speed) + "px");
	  //}
	}
}

var viewport = new Viewport({
  element: document.getElementsByClassName('cube')[0],
});

function Cube(data) {
  var self = this;

  this.element = data.element;
  this.sides = this.element.getElementsByClassName('side');

  this.viewport = data.viewport;
  this.viewport.on('sideChange', function() {
    self.sideChange();
  });
}


Cube.prototype.sideChange = function() {

  for(var i = 0; i < this.sides.length; ++i) {
    this.sides[i].className = 'side';    
  }

  this.sides[this.viewport.currentSide - 1].className = 'side active';
  $(".board").removeClass("current");
  $(".side.active .board").addClass("current");
}

new Cube({
  viewport: viewport,
  element: viewport.element
});
