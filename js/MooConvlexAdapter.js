var inputPoints = JSON.decode(sessionStorage.getItem('inputPoints')) || [{"x":344,"y":326},{"x":195,"y":354},{"x":210,"y":236},{"x":411,"y":375},{"x":462,"y":212}],
	activeRenderers = {};

window.addEvent('load', function() {
	var canvas = new window.convlexEnvelop.Viewer($('canvas'));
	var outputs = {}; // rendererName -> textarea
		
	function activateRenderer(name, button) {
		if (button)
			button.set('active', 'active');
			
		var subject = new AvailableRenderers.registered[name](inputPoints);
		activeRenderers[name] = subject;
		
		sessionStorage.setItem('activeRenderers', Object.keys(activeRenderers));
		
		updateOutput();
	}
	
	function deactivateRenderer(name, button) {
		if (button)
			button.set('active', '');
		
		delete activeRenderers[name];
		
		sessionStorage.setItem('activeRenderers', Object.keys(activeRenderers));
		
		updateOutput();	
	}


	// init renderers
	
	var previousRenderers = sessionStorage.getItem('activeRenderers') || '';
	
	Object.each(AvailableRenderers.registered, function(rendererType, name) {
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
			if (button.get('active') != 'active')
				activateRenderer(name, button);
			else
				deactivateRenderer(name, button);
		});
		
		button.inject($('renderers'));
		
		if (previousRenderers.contains(name))
			activateRenderer(name, button);
	});
	
	delete previousRenderers;
	
	
	function updateOutput() {
		var encodedInput = JSON.encode(inputPoints);
		
		$('input_json').set('value', encodedInput);
		sessionStorage.setItem('inputPoints', encodedInput);
		
		$('points_count').set('text', inputPoints.length);
		
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
	
	$('clear').addEvent('click', function() {
		inputPoints = [];
		updateOutput();
	});
});
