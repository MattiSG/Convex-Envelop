var availableRenderers = { // used to generate GUI
	'Basic': Divider,
	'Random': Randomer
}

Divider.implement({
	color: 'blue'
});

Randomer.implement({
	color: 'green'
});

var inputPoints = [],
	activeRenderers = {};

window.addEvent('load', function() {
	var canvas = new window.convlexEnvelop.Viewer($('canvas'));
	inputPoints = [{"x":344,"y":326},{"x":195,"y":354},{"x":210,"y":236},{"x":411,"y":375},{"x":462,"y":212}];
	
	var outputs = {}; // rendererName -> textarea
	
	function updateOutput() {
		$("input_json").set('value', JSON.encode(inputPoints));
		canvas.clear();
		canvas.displayAllPoints(inputPoints);
		
		Object.each(activeRenderers, function(renderer, name) {
			renderer.setInput(inputPoints);
			var envelope = renderer.envelope();
			
			canvas.displayPolygon(envelope, renderer.color);
			outputs[name].set('value', JSON.encode(envelope));
		});
	}
	
	updateOutput();

	function showColor(color) {
		$("input_json").setStyle('-webkit-box-shadow', '0 0 10px ' + color);
	}
	
	var input = $("input_json").addEvent('keyup', function() {
		try {
			var data = JSON.parse($("input_json").get('value'));
		} catch (e) {
			showColor('red');
			return false;
		}
	
		showColor('green');
		inputPoints = data;
		updateOutput();
	});

	var canvasCoords = $('canvas').getCoordinates();	
	$('canvas').addEvent('click', function(evt) {
		var scroll = window.getScroll();
		var point = {
			x: evt.client.x - canvasCoords.left - scroll.x - 6, // - 2 because of the roundings; a bit better
			y: canvasCoords.bottom - evt.client.y - scroll.y - 5
		};
		
		var shouldPush = true;

		if (inputPoints.length < 100) {
			var removalDistance = 3;
			inputPoints.each(function(inputPoint, index) {
				if (point.x == inputPoint
					&& point.y == inputPoint.y)
				{
					shouldPush = false;
					inputPoints.splice(index, 1);
				}
			});
		}
		
		if (shouldPush)
			inputPoints.push(point);
			
		updateOutput();
	});
	
	Object.each(availableRenderers, function(rendererType, name) {
		var colorStyle = {
			color: new rendererType([]).color
		};
		
		var button = new Element('button', {
			text: name,
			styles: colorStyle
		});
		
		new Element('h3', {
			text: name,
			styles: colorStyle
		}).inject('output');
		
		outputs[name] = new Element('textarea', {
			readonly: true,
			styles: colorStyle
		}).inject('output');
		
		button.addEvent('click', function(evt) {
			if (button.get('active') != 'active') {
				button.set('active', 'active');
				var subject = new rendererType(inputPoints);
				activeRenderers[name] = subject;
				
				updateOutput();
			} else {
				button.set('active', '');
				delete activeRenderers[name];
				
				updateOutput();
			}
		});
		
		button.inject($('renderers'));
	});
});
