
now.renderMap = function(map){
	console.log(now.world);
	$('#canvas').html(map);
};

$(function(){
	now.ready(function(){
		now.getMap();

		$('form').on('submit', function(data){
			console.log('change');
			var params = {
				seed : $('#seed').val()
			};

			now.setParams(params);
		});

	});
});