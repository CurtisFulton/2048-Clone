var visuals;

window.addEventListener("load", function(e) {
  visuals = new Visuals2048(4, 4, 100, 12.5);

  window.addEventListener('keyup', this.keyboardInput, false);
  document.getElementById('restart').addEventListener('click', () => visuals.startNewGame());
});

function Visuals2048(col, row, size, padding) {
  this.bgCanvas = document.getElementById("background");
  this.bgContext = this.bgCanvas.getContext("2d");

  this.fgCanvas = document.getElementById("foreground");
  this.fgContext = this.fgCanvas.getContext("2d");

  this.backgroundColor = "#A88768";
  this.tileColour = "#EEE4DA";
  this.emptyTileColour = "rgba(238, 228, 218, 0.5)";

  this.numColumns = col;
  this.numRows = row;
  this.tileSize = size;
  this.tilePadding = padding;
  this.actualTileSize = this.tileSize - this.tilePadding; 

  this.gameManager = new GameManager2048(this.numColumns, this.numRows);

  this.resizeCanvases();
  this.drawBackground(this.bgCanvas, this.bgContext);

  this.gameManager.startNewGame();
  this.redrawTiles(this.fgContext);
}

/****************************************************/
/*                    Inputs                        */
/****************************************************/

function keyboardInput(e) {
	switch (e.keyCode) { 
		case 37:
		case 65:
			visuals.gameManager.moveLeft();
			break;
		case 38:
		case 87:
			visuals.gameManager.moveUp();
			break;
		case 39:
		case 68:
			visuals.gameManager.moveRight();
			break;
		case 40:
		case 83:
			visuals.gameManager.moveDown();
			break;
		default:
		  	return;
	}

	visuals.redrawTiles(visuals.fgContext);
}

/****************************************************/
/*                 Visuals/Drawing                  */
/****************************************************/

Visuals2048.prototype.startNewGame = function() {
  this.gameManager.startNewGame(Math.random() * 10000);

  this.redrawTiles(this.fgContext);
}

Visuals2048.prototype.resizeCanvases = function() {
	var canvasWidth = this.numColumns * this.tileSize + this.tilePadding;
	var canvasHeight = this.numRows * this.tileSize + this.tilePadding;

	this.bgCanvas.width = canvasWidth;
	this.bgCanvas.height = canvasHeight;

	this.fgCanvas.width = canvasWidth;
	this.fgCanvas.height = canvasHeight;
}

Visuals2048.prototype.drawBackground = function(canvas, context) {  
  context.fillStyle = this.emptyTileColour;
  
  // Everything gets drawn like a normal grid, but moved across and down by tilePadding.
  for (i = 0; i < this.numRows; i++) {
    for (j = 0; j < this.numColumns; j++) {
      var y = (i * this.tileSize) + this.tilePadding;
      var x = (j * this.tileSize) + this.tilePadding;
      
      this.drawRoundedRect(context, x, y, this.actualTileSize, 4);
    }
  }
}

// Helper function to draw a rect with curved corners - Looks slightly nicer
Visuals2048.prototype.drawRoundedRect = function(ctx, x, y, size, radius) {
  ctx.beginPath();
  ctx.moveTo(x+radius, y);
  ctx.lineTo(x+size-radius, y);
  ctx.quadraticCurveTo(x+size, y, x+size, y+radius);
  ctx.lineTo(x+size, y+size-radius);
  ctx.quadraticCurveTo(x+size, y+size, x+size-radius, y+size);
  ctx.lineTo(x+radius, y+size);
  ctx.quadraticCurveTo(x, y+size, x, y+size-radius);
  ctx.lineTo(x, y+radius);
  ctx.quadraticCurveTo(x, y, x+radius, y);
  ctx.fill();  
}

Visuals2048.prototype.redrawTiles = function(context) {
  context.clearRect(0, 0, this.fgCanvas.width, this.fgCanvas.height);

  for (i = 0; i < this.numColumns; i++) {
    for (j = 0; j < this.numRows; j++) {
      var xPos = (i * this.tileSize) + this.tilePadding;
      var yPos = (j * this.tileSize) + this.tilePadding;

      var val = this.gameManager.grid[i][j];
      this.drawTile(context, val, xPos, yPos, this.actualTileSize)
    }
  }
}

Visuals2048.prototype.drawTile = function(context, value, x, y, size) {
  if (value == 0)
    return;
  
  context.fillStyle = this.tileColour;
  this.drawRoundedRect(context, x, y, size, 4);
  
  // Set up the text
  context.fillStyle = "#000";
  context.font = "25px Arial"
  context.textAlign = "center";
  context.textBaseline = "middle";

  var output = Math.pow(2, value);

  context.fillText(output, x + (size / 2.0), y + (size / 2.0));
}