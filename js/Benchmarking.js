var suite;
//extern activeRenderers (defined in MooConvlexAdapter)
//extern inputPoints (defined in MooConvlexAdapter)

function initBench() {
	suite = new Benchmark.Suite;
	
	$('bench_results').empty();
	
	suite.on('cycle', function(bench) {
		$('bench_results').grab(new Element('li', {
			text: String(bench)
		}));
	})
	.on('complete', function() {
		$('bench_results').grab(new Element('li', {
			text: 'Fastest is ' + this.filter('fastest').pluck('name'),
			'class': 'result'
		}));
		$('bench_start').set('text', 'Start again');
		$('bench').set('class', '');
	});
}

window.addEvent('domready', function() {
	$('bench_start').addEvent('click', function() {
		if (Object.getLength(activeRenderers) == 0) {
			$('bench_results').set('html', 'Please activate at least one renderer to benchmark it!');
			return false;
		}
		
		initBench();
		Object.each(activeRenderers, function(renderer, name) {
			suite.add(name, function() {
				renderer.setInput(inputPoints);
				renderer.envelope();
			});
		});
		
		$('bench_start').set('text', 'Working…');
		$('bench').set('class', 'working');
		suite.run(true);
	});
});
