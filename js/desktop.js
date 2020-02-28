
function Cube() {
	
	var that = htmlCanvas.widget();
	
	that.renderOn = function(html) {
		wrapper = html.div().setAttribute('id', 'wrapper').asJQuery();
		viewport = html.div().addClass('viewport').asJQuery();
		viewport.appendTo(wrapper);
		cube = html.div().addClass('cube').asJQuery();
		cube.appendTo(viewport);
		for(var i=0; i<6; i++) {
			side = html.div().addClass('side').asJQuery();
			side.appendTo(cube);
			if(i == 0 && i == 5) {
				side.css('opacity', '0.6');
			}
		}
		$($('.side')[1]).addClass("active");
	}
	
	return that;
}

function Desktop() {

	var that = htmlCanvas.widget();

	that.renderOn = function (html) {
		desktop = html.div().addClass("desktop").asJQuery();
		Cube().appendTo($("body"));	
		Board().appendTo(desktop);
		for(var i=2; i<5; i++) {
			Board().appendTo($($('.side')[i]));
		}
		mainBoard = $(desktop.children()[0]);
		mainBoard.addClass("current");
		Dialog(Introduction()).appendTo(mainBoard);
	}

	return that;

}

function Board () {
	
	var that = htmlCanvas.widget();

	that.renderOn = function (html) {
		board = html.div().addClass("board").asJQuery();
		Toolbar().appendTo(board);
	}
	
	return that;
}

function Toolbar() {
	
	var that = htmlCanvas.widget();
	
	that.renderOn = function(html) {
		toolbar = html.div().addClass("toolbar");
		html.div().addClass("pedestal").asJQuery().appendTo(toolbar.asJQuery());
		tool = html.div().addClass("tool");
		html.img().setAttribute('src', './img/help.png').click(function () {help()}).asJQuery().appendTo(tool.asJQuery());
		html.img().setAttribute('src', './img/desktops.png').asJQuery().appendTo(tool.asJQuery());
		html.img().setAttribute('src', './img/player.png').click(function () {openPlayer()}).asJQuery().appendTo(tool.asJQuery());
		html.img().setAttribute('src', './img/config.png').asJQuery().appendTo(tool.asJQuery());
		tool.asJQuery().appendTo(toolbar.asJQuery());
	}
	
	function help() {
		// Have to append at random place
		Dialog(Introduction()).appendTo($(".board.current"));
	}
	
	function openPlayer() {
		// Have to append at random place
		Dialog(Player()).appendTo($(".board.current"));
	}
	
	return that;
}

function Dialog (aWidget) {
	
	var that = htmlCanvas.widget();
	var dialog;

	that.renderOn = function (html) {
		dialog = html.div().addClass("dialog").setAttribute("id", shortId()).asJQuery();
		head = html.div().addClass("head").asJQuery();
		head.appendTo(dialog);
		html.span("x").click(function () { close($(this))}).asJQuery().appendTo(head);
		html.span("\u25a0").click(function () { grow($(this))}).asJQuery().appendTo(head);
		content = html.div().addClass("content").asJQuery();
		aWidget.appendTo(content);
		content.appendTo(dialog);
		up(dialog);
		dialog.draggable({
			cancel: ".content",
			start: function () {up(dialog)},
			stop: function () {updatePosition(dialog)}
		});
		dialog.resizable({
			autoHide: true,
			start: function () {up(dialog)},
			stop: function(e, ui) {
					var parent = ui.element.parent();
					ui.element.css({
						width: ui.element.width()/parent.width()*100+"%",
						height: ui.element.height()/parent.height()*100+"%"
					});
					updatePosition(dialog);	
			}
		});
		dialog.click(function () {
			up(dialog);
		});
	}

	function up(anElement) {
		children = anElement.parent().children(".dialog");
		var index = 0;
		for(var i=0; i<children.length; i++) {
			index = Math.max(index, Number($(children[i]).css("z-index")));
			$(children[i]).css("opacity", "0.9");
		}
		anElement.css("z-index", index + 1);
		anElement.css("opacity", "1");
		children.sort(function(a, b) {return(Number(a.style.zIndex) - Number(b.style.zIndex))});
		for(var i in children) {
			$(children[i]).css("z-index", new Number(i) + 1);
		}
	}
	
	function close(element) {
		element.parent().parent().remove();
	}
	
	function grow(element) {
		dialog = element.parent().parent();
		widthInPercent = Math.round(dialog.width() * 100 / parseFloat(dialog.parent().width()));
		heightInPercent = Math.round(dialog.height() * 100 / parseFloat(dialog.parent().height()));
		if(widthInPercent == 90 && heightInPercent == 80) {
			dialog.css("width", "30%");
			dialog.css("height", "40%");
			element.text("\u25a0");
		} else {
			dialog.css("width", "90%");
			dialog.css("height", "80%");
			dialog.css("top", "5%");
			dialog.css("left", "5%");
			element.text("\u2013");
		}
	}
	
	function updatePosition(dialog) {
		var l = ( 100 * parseFloat(dialog.position().left / parseFloat(dialog.parent().width())) ) + "%" ;
		var t = ( 100 * parseFloat(dialog.position().top / parseFloat(dialog.parent().height())) ) + "%" ;
		dialog.css("left", l);
		dialog.css("top", t);
	}

	return that;
}

function Clone(aDialog) {

	var that = htmlCanvas.widget();
	
	that.renderOn = function (html) {
		clone = html.div().addClass("clone").setAttribute("id", "clone-" + aDialog.attr("id")).asJQuery();
		clone.css("height", aDialog.height());
		clone.css("top", aDialog.css("top"));
		if(aDialog.css("right")[0] == '-') {
			clone.css("left", diff(aDialog, aDialog.css("right")))
		}	
		if(aDialog.css("left")[0] == '-') {
			clone.css("right", diff(aDialog, aDialog.css("left")))
		}	
		clone.css("background", "-moz-element(#" + aDialog.attr("id") + ") no-repeat")
	}

	function diff(anElement, aStringPixelFormat) {
		v = anElement.css("width");
		v = new Number(v.substring(0, v.length - 2));
		arg = new Number(aStringPixelFormat.substring(0, aStringPixelFormat.length - 2));
		return  "-" + (v + arg + 6) + "px"
	}	

	return that
}

function Introduction () {	
	
	var that = htmlCanvas.widget();
	
	that.renderOn = function (html) {
		html.span("How to display cube ?").addClass("title");
		html.span('Long press on "ctrl" and move the mouse...');
	}
	
	return that;
}

function Player () {	
	
	var that = htmlCanvas.widget();
	var uuid = generateUUID();
	
	that.renderOn = function (html) {
		player = html.div().addClass("player").asJQuery();
		html.video().setAttribute("id", uuid).setAttribute("src", "./videos/rohirrim1080p.mp4").asJQuery().appendTo(player);
		buttons = html.div().addClass("buttons").asJQuery();
		html.img().setAttribute('src', './img/pause.png').click(function () {pause()}).asJQuery().appendTo(buttons);
		html.img().setAttribute('src', './img/play.png').click(function () {play()}).asJQuery().appendTo(buttons);
		buttons.appendTo(player);	
	}
	
	function pause() {
		document.getElementById(uuid).pause();
	}

	function play() {
		document.getElementById(uuid).play();
	}
	

	return that;
}
	
function generateUUID() {
	var d = new Date().getTime();
	if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
		d += performance.now(); 
	}
	return 'xxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
}
	
function shortId() {
	var d = new Date().getTime();
	if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
		d += performance.now(); 
	}
	return 'cxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
}
