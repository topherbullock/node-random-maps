/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    now = require('now');
    Game = require('./game');

var Map = new Game.RandomMap({cols: 200, rows :200, initVal : 2, seed : 1000, vals: [1,2,3,4] , valWeight : [10,0,2,2]});

var app = module.exports = express.createServer(),
    everyone = now.initialize(app);

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

var world;

everyone.now.getMap = function(){
  this.now.world = Map.matrix.elements;
  this.now.renderMap(Map.matrix.inspect());
};

everyone.now.setParams = function(params){
  Map.init(params);
  Map.randomize();
  console.log(params);
  
  everyone.now.getMap();

};

now.on('connect', function() {
  Map.randomize();
  setInterval(function(){Map.randomize(); everyone.now.getMap(); }, 20000 );
});

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
