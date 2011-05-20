window.addEvent('load', function() {
	var canvas = new window.convlexEnvelop.Viewer($('canvas'));
	var inputPoints = [
		{"x": 29, "y":119},
		{"x": 105, "y":65},
		{"x": 257, "y":322},
		{"x": 259, "y":445},
		{"x": 525, "y":257}
	];
	
	function updateOutput() {
		$("input_json").set('value', JSON.encode(inputPoints));
		canvas.clear();
		canvas.displayAllPoints(inputPoints);
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
		}
		
		if (! data.points) {
			showColor('orange');
		} else {
			showColor('green');
			inputPoints = data.points;
			updateOutput();
		}
	});

	var canvasCoords = $('canvas').getCoordinates();	
	$('canvas').addEvent('click', function(evt) {
		var scroll = window.getScroll();
		var point = {
			x: evt.client.x - canvasCoords.left - scroll.x,
			y: canvasCoords.bottom - evt.client.y - scroll.y
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
	
	$('execute_button').addEvent('click', function() {
		var subject = new Divider(inputPoints);
		canvas.displayPolygon(subject.envelope());
	});
});