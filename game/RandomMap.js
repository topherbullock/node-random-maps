var s = require('sylvester');
var srand = require('srand');

/**
 * RandomMap :: Class
 *
 * @param {Object} params
  => @param {Number} cols
  => @param {Number} rows
  => @param {Number} seed
  => @param {Number[]} vals
  => @param {Number[]} valWeight
 *
 */

/**
 * Initialize RandomMap parse params and create initial state for matrix
 */

function RandomMap(params) {
	this.init(params);
	this.matrix = null;
	this.sparks = {};
	this.sparkMs = [];

	this.usedSparks = null;
	
	this.initialSpark = null;
	this.sparkCount = 0;
	this.threads = 4;

	this.createMatrix();
	//this.createSparkMs();
    
    if(false === (this instanceof RandomMap)) {
        return new RandomMap();
    }
}

/* RandomMap prototype.*/

RandomMap.prototype = {
	/*Initialize the RandomMap with paramter object*/
	init : function(params)
	{
		this.vals = params.vals || this.vals || [1,2];
		this.valWeight = params.valWeight || this.valWeight || [8,1];
		if(typeof params.initVal == "number"){
			this.initVal = params.initVal;
		} else {
			this.initVal = 0;
		}
	
		this.valChance = this.vals;
		var val = 0,
			weight = 0,
			valCount = this.vals.length;

		//Populate the valChance array with weighted values
		for(val = 0; val < valCount; val++){
			for(valWeight = 1; valWeight < this.valWeight[val]; valWeight++)
			{
				this.valChance.push(this.vals[val]);
			}
		}
		
		this.chance = this.valChance.length;

		this.cols = params.cols || this.cols || 10;
		this.rows = params.rows || this.rows || 10;

		this.cols = this.cols - (this.cols % 2);
		this.rows = this.rows - (this.rows % 2);
 
		this.seed = params.seed || this.seed || Date.now();
		this.sparkRatio = this.sparkRatio || this.sparkRatio || 200;
		this.initialSparkCount = Math.floor((this.rows*this.cols/this.sparkRatio));

		this.sparkMatrix = this._matrixFactory(false);
	},
	scale : function(thread){

	},
	_scale : function(n){
		var M = s.Matrix.Fill(this.rows*n, this.cols*n, null);
		var rol ,col;
		
		for(row = 0; row < this.rows*n; row++ ){
			for(col = 0; col < this.cols*n; col++){
				M.elements[row][col] = this.matrix.e(Math.floor(row/n) ,Math.floor(col/n));
			}
		}
		this.matrix = M;
		this.rows = this.rows*n;
		this.cols = this.cols*n;
	},
	_matrixFactory : function(val, rows, cols){
		if (typeof rows === "undefined"){} rows = this.rows;
		if (typeof cols === "undefined") cols = this.cols;
		return s.Matrix.Fill(rows,cols,val);
	},
	createMatrix : function()
	{
		this.matrix = this._matrixFactory(this.initVal);
		return this.matrix;
	},
	createSparkMs : function()
	{
		var thread,
			i = 1 , j = 1,
			height = 6 / (this.threads/2),
			width = 6 / (this.threads/2),
			matrix = this.sparkMatrix;

		for(thread = 0; thread < this.threads; thread++){
			this.sparkMs [thread] = matrix.minor(i,j,width, height).inspect();
			if(thread % 2 == 1)
				i = i + width-1;
			else
				j = j + height-1;
		}
	},
	setVal : function (row,col,val){
		if(typeof row !== "string")
			row = row.toString();
		if(typeof col !== "string")
			col = col.toString();
		
		this.matrix.elements[row][col] = val;
	},
	getRandomVal : function(){
		var i = Math.floor((srand.random()*this.chance));
		return this.valChance[i];
	},
	setRandomVal : function(row,col){
		this.setVal(row,col, this.getRandomVal());
	},
	addSpark : function(row,col){
		if(typeof row !== "string")
			row = row.toString();
		if(typeof col !== "string")
			col = col.toString();
		
		if(this.hasSparkBeenUsed(row,col)){
			return false;
		}
		
		if(!this.sparks[row]){
			this.sparks[row] = {};
			this.usedSparks[row] = {};
        }

		//this.sparkMatrix.elements[row][col] = true;
		
		this.sparks[row][col] = true;
		this.usedSparks[row][col] = true;

		this.sparkCount++;
		return true;
	},
	deleteSpark : function(row,col){

		if(typeof row !== "string" && typeof row === "number")
			row = row.toString();
		if(typeof col !== "string" && typeof col === "number")
			col = col.toString();
			
		delete this.sparks[row][col];

		this.sparkCount--;
	},
	hasSparkBeenUsed : function(row,col){
		if(typeof row !== "string")
			row = row.toString();
		if(typeof col !== "string")
			col = col.toString();
		
		
		if(typeof this.usedSparks[row] !== "undefined" && this.usedSparks[row][col]){
			return true;
		} else {
			return false;
		}
	},
	genInitialSparks: function(seed)
	{
		this.sparks = {};
		this.usedSparks = {};
		this.sparkCount = 0;

		var i = 0,
			x,y,
			dimensions = this.matrix.dimensions();

		while(i < this.initialSparkCount){
			x = Math.floor((srand.random()*dimensions.rows));
			y = Math.floor((srand.random()*dimensions.cols));
			
			if(this.addSpark(x,y))
			{
				this.setVal(x,y,this.getRandomVal());
				i++;
			}
		}
	},
	randomize : function(){
		srand.seed(this.seed);
		// this._scale(0.25);
		this.createMatrix();
		this.genInitialSparks();
		this.iterateSparks();
		this.scale(2);
	},
	eachNeighbor: function(row,col,func){
		if(typeof row === "string")
			row = parseFloat(row);
		if(typeof col === "string")
			col = parseFloat(col);

		var startRow, startCol,
			endRow, endCol;

		startRow = (row === 0) ? row : row - 1;
		startCol = (col === 0) ? col : col - 1;

		endRow = (row === this.rows-1) ? row : row + 1;
		endCol = (col === this.cols-1) ? col : col + 1;
		
		
		var n, m;
		for(n = startRow; n <= endRow; n++){
			for(m = startCol; m <= endCol; m++){
				if( !(n === row && m === col))
				{
					func.call(this,n,m);
				}
				
			}
		}
	},
	iterateSparks : function(){
		var row,col,target,
			keys, keyCount,
			val = this.getRandomVal();

		var generateTile = function(n,m){
			
			if(this.addSpark(n,m)){
				this.setVal(n,m,val);
			}
		};

		while(this.sparkCount !== 0) {
			keys = Object.keys(this.sparks);
			keyCount = keys.length;
			target =  Math.floor((srand.random()*keyCount));
			row = keys[target];

			keys = Object.keys(this.sparks[row]);
			keyCount = keys.length;
			target =  Math.floor((srand.random()*keyCount));
			col = keys[target];
			val = this.matrix.elements[row][col];

			if(val !== 2 && this.getRandomVal() === 1)
				val = this.getRandomVal();


			this.eachNeighbor(row,col, generateTile);

			this.deleteSpark(row,col);
		}
	}
};

module.exports = RandomMap;