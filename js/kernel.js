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

  this.element = data.element;
  this.fps = data.fps;
  this.sensivity = data.sensivity;
  this.sensivityFade = data.sensivityFade;
  this.touchSensivity = data.touchSensivity;
  this.speed = data.speed;

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

  this.isCubeMode = false;
  this.down = false;
  this.upsideDown = false;

  this.previousPositionX = 0;
  this.previousPositionY = 0;

  this.currentSide = 0;
  this.calculatedSide = 0;

  this.switchToCube = function() {
	self.isCubeMode = true;
	board = $(".board.current");
	self.transitToCube(board);
	setTimeout(function () {
		if(self.isCubeMode) {
			board.detach();
			var side = self.detectSideInProgress();
			side.append(board);
			self.fullScreen(board);
			dialogs = $(".board.current .dialog").toArray();
			dialogs.sort(function(a, b) {
				return(Number(a.style.zIndex) - Number(b.style.zIndex));
			});
			var index = 350;
			if(side.index() == 2) {
				index = 550;
			}
			for(var i=0; i<dialogs.length; i++) {
				dialog = $(dialogs[i]);	
				width = dialog.css("width");
				height = dialog.css("height");
				dialog.detach();
				$(".cube").append(dialog);
				dialog.css("width", width);
				dialog.css("height", height);
				if(side.index() == 1) {
					dialog.css("transform", side.css("transform"));
					dialog.css("transform", side.css("transform").replace(300, index));
				}
				if(side.index() == 2) {
					leftPercent = 100 - (Number(dialog.css("left").replace("px", "")) * 100 / Number(side.css("width").replace("px", "")));
					dialog.css("transform", "rotateY(90deg) translateX(-" + leftPercent + "%) translateZ(" + index + "px)");
					dialog.css("left", "auto");	
				}
				if(side.index() == 3) {
					dialog.css("right", dialog.css("left"));
					dialog.css("left", "auto");
				}
				if(side.index() == 4) {
					dialog.css("left", "auto");
				}
				index += 50;
			} 
		}		
	}, 500);
  }
  
	this.transitToCube = function(board) {
		board.css('width', '650px');
		board.css('height', '650px');
		board.css('margin-left', '33%');
		board.css('margin-top', '5%');
	}
	
	this.detectSideInProgress = function () {
		var sideInProgress;  
		for(var i=1; i<$(".side").length -1; i++) {
			side = $($(".side")[i]);
			if(side.find('.board').length === 0) {
				sideInProgress = side;
			}
		}
		return sideInProgress;
	}
  
	this.fullScreen = function (aJQuery) {
		aJQuery.css('width', '100%');
		aJQuery.css('height', '100%');
		aJQuery.css('margin-left', '0px');
		aJQuery.css('margin-top', '0px');
	}
  
  this.switchToDesktop = function() {
	board = $(".board.current");
	if(self.isCubeMode) {
		board.detach();
		$(".desktop").prepend(board);
	}
	board.css('width', '100%');
	board.css('height', '100%');
	board.css('margin-left', '0px');
	board.css('margin-top', '0px');

	self.isCubeMode = false;
  }

  bindEvent(document, 'mousedown', function() {
	self.down = true;
  });

  bindEvent(document, 'mouseup', function() {
	self.down = false;
  });
  
  bindEvent(document, 'keydown', function(e) {
	if(e.keyCode == 17) {
		if(!self.isCubeMode) {
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
	  
	  this.element.style[userPrefix.js + 'Transform'] = 'rotateX(' + this.positionY + 'deg) rotateY(' + this.positionX + 'deg)';

	  if(this.positionY != this.previousPositionY || this.positionX != this.previousPositionX) {
		this.previousPositionY = this.positionY;
		this.previousPositionX = this.positionX;
	  }
	}
}

var viewport = new Viewport({
  element: document.getElementsByClassName('cube')[0],
  fps: 30,
  sensivity: .1,
  sensivityFade: .93,
  speed: 1,
  touchSensivity: 1.5
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
  element: document.getElementsByClassName('cube')[0]
});
