
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
			cubeImage = html.div().addClass('cube-image').asJQuery();
			cubeImage.appendTo(side);
			if(i == 0 && i == 5) {
				side.css('opacity', '0.6');
			}
		}
		$($('.cube-image')[1]).parent().addClass("active");
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
		Dialog().appendTo(mainBoard);
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
		html.img().setAttribute('src', './img/ff.png').asJQuery().appendTo(tool.asJQuery());
		html.img().setAttribute('src', './img/config.png').asJQuery().appendTo(tool.asJQuery());
		html.img().setAttribute('src', './img/home.png').asJQuery().appendTo(tool.asJQuery());
		html.img().setAttribute('src', './img/desktops.png').asJQuery().appendTo(tool.asJQuery());
		tool.asJQuery().appendTo(toolbar.asJQuery());
	}
	
	
	return that;
}

function Dialog () {
	
	var that = htmlCanvas.widget();

	that.renderOn = function (html) {
		dialog = html.div().addClass("dialog").asJQuery();
		dialog.draggable({
			stop: function () {
				var l = ( 100 * parseFloat($(this).position().left / parseFloat($(this).parent().width())) ) + "%" ;
				var t = ( 100 * parseFloat($(this).position().top / parseFloat($(this).parent().height())) ) + "%" ;
				$(this).css("left", l);
				$(this).css("top", t);
			}
		});
	}
	
	return that;
}

