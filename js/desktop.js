
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
		html.img().setAttribute('src', './img/ff.png').click(function () {openIntroduction()}).asJQuery().appendTo(tool.asJQuery());
		html.img().setAttribute('src', './img/config.png').asJQuery().appendTo(tool.asJQuery());
		html.img().setAttribute('src', './img/home.png').asJQuery().appendTo(tool.asJQuery());
		html.img().setAttribute('src', './img/desktops.png').asJQuery().appendTo(tool.asJQuery());
		tool.asJQuery().appendTo(toolbar.asJQuery());
	}
	
	function openIntroduction() {
		Dialog(Introduction()).appendTo($(".board.current"));
	}
	
	return that;
}

function Dialog (aWidget) {
	
	var that = htmlCanvas.widget();
	var dialog;

	that.renderOn = function (html) {
		dialog = html.div().addClass("dialog").asJQuery();
		head = html.div().addClass("head").asJQuery();
		head.appendTo(dialog);
		html.span("x").asJQuery().click(function () { close($(this))}).appendTo(head);
		html.span("\u25a0").addClass("close").asJQuery().appendTo(head);
		content = html.div().addClass("content").asJQuery();
		aWidget.appendTo(content);
		content.appendTo(dialog);
		increaseIndex(dialog);
		dialog.draggable({
			cancel: ".content",
			start: function () {increaseIndex(dialog)},
			stop: function () {updatePosition(dialog)}
		});
		dialog.resizable({
			autoHide: true,
			start: function () {increaseIndex(dialog)},
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
			increaseIndex(dialog);
		});
	}

	function increaseIndex(anElement) {
		children = anElement.parent().children();
		var index = 0;
		for(var i=0; i<children.length; i++) {
			if($(children[i]).hasClass("dialog")) {
				index = Math.max(index, Number($(children[i]).css("z-index")));
			}
		}
		anElement.css("z-index", index + 1);
	}
	
	function close(element) {
		element.parent().parent().remove();
	}
	
	function updatePosition(dialog) {
		var l = ( 100 * parseFloat(dialog.position().left / parseFloat(dialog.parent().width())) ) + "%" ;
		var t = ( 100 * parseFloat(dialog.position().top / parseFloat(dialog.parent().height())) ) + "%" ;
		dialog.css("left", l);
		dialog.css("top", t);
	}

	return that;
}

function Introduction () {	
	
	var that = htmlCanvas.widget();
	
	that.renderOn = function (html) {
		html.span("How to display cube ?").addClass("title");
		html.span('Long press on "ctrl" and move the mouse...');
	}
	
	return that;
}
