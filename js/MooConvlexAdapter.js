var availableRenderers = { // used to generate GUI
	'Basic': Divider
}

Divider.implement({
	color: 'blue'
});

window.addEvent('load', function() {
	var canvas = new window.convlexEnvelop.Viewer($('canvas'));
	var inputPoints = [
		{"x": 29, "y":119},
		{"x": 105, "y":65},
		{"x": 257, "y":322},
		{"x": 259, "y":445},
		{"x": 525, "y":257}
	];
	
	var activeRenderers = {};
	
	function updateOutput() {
		$("input_json").set('value', JSON.encode(inputPoints));
		canvas.clear();
		canvas.displayAllPoints(inputPoints);
		
		Object.each(activeRenderers, function(renderer) {
			renderer.setInput(inputPoints.clone());
			canvas.displayPolygon(renderer.envelope(), renderer.color);
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
			inputPoints.each(function(inputPoint, index) {
				if (inputPoint.x == point.x
					&& inputPoint.y == point.y) {
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
		var button = new Element('button', {
			text: name,
			styles: {
				color: new rendererType([]).color
			}
		});
		
		button.addEvent('click', function(evt) {
			if (button.get('active') != 'active') {
				button.set('active', 'active');
				var subject = new rendererType(inputPoints.clone());
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