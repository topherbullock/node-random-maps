ig.module(
	'game.main'
)
.requires(
	'impact.game',
	'impact.font'
)
.defines(function(){

MyGame = ig.Game.extend({
	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),
	setMapData : function(data){
		// Create BackgroundMap

		this.backgroundMaps[0] = new ig.BackgroundMap( 8, data, 'media/tiles_8.png' );

	},
	init: function(mapData) {
		// Initialize your game here; bind keys etc.
		this.setMapData(now.world);
		
		ig.input.bind( ig.KEY.UP_ARROW, 'up' );
		ig.input.bind( ig.KEY.W, 'up' );
		ig.input.bind( ig.KEY.DOWN_ARROW,'down');
		ig.input.bind( ig.KEY.S,'down');
		
		ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
		ig.input.bind( ig.KEY.A, 'left' );
		ig.input.bind( ig.KEY.RIGHT_ARROW,'right');
		ig.input.bind( ig.KEY.D,'right');

	},
	update: function() {
		// Update all entities and backgroundMaps
		this.parent();
		// In your game's or entity's update() method
		if( ig.input.state('left') ) {
			this.screen.x = this.screen.x-16;
		}

		if( ig.input.state('right') ) {
			this.screen.x = this.screen.x + 16;
		}

		if( ig.input.state('up') ) {
			this.screen.y = this.screen.y - 16;
		}
		if( ig.input.state('down') ) {
			this.screen.y = this.screen.y + 16;
		}

		this.setMapData(now.world);
		// Add your own, additional update code here
	},
	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();
		
		
		// Add your own drawing code here
		var x = ig.system.width/2,
			y = ig.system.height/2;

		this.backgroundMaps[0].setScreenPos(this.screen.x, this.screen.x);
		
	}
});


now.renderMap = function(map){
	console.log(now.world);
};

$(function(){
	now.ready(function(){
		now.getMap();

		// Start the Game with 60fps, a resolution of 320x240, scaled
		// up by a factor of 2
		var game = ig.main( '#canvas', MyGame, 60, 800, 600, 1 );

		});

		$('form').on('submit', function(data){
			var params = {
				seed : $('#seed').val()
			};

			now.setParams(params);
		});

	});
});