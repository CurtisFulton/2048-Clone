/****************************************************/
/*				      Global Varibables                   */
/****************************************************/

var bgCanvas = document.getElementById("background");
var bgContext = bgCanvas.getContext("2d");

var fgCanvas = document.getElementById("foreground");
var fgContext = fgCanvas.getContext("2d");

var backgroundColor = "#A88768";
var tileColour = "#EEE4DA";
var emptyTileColour = "rgba(238, 228, 218, 0.5)";

// Used to get the size of the canvas
var numColumns = 4;
var numRows = 4;
var tileRadius = 4
var tileSize = 100;
var tilePadding = 12.5;
var actualTileSize = tileSize - tilePadding; 

var gameManager = new GameManager2048(numColumns, numRows);

window.addEventListener("load", function(e) {
  window.addEventListener('keyup', this.keyboardInput, false);

  resizeCanvases();
  drawBackground(bgCanvas, bgContext);
  
  gameManager.startNewGame();
  redrawTiles(fgContext);
});

/****************************************************/
/*                    Inputs                        */
/****************************************************/

function keyboardInput(e) {
	switch (e.keyCode) { 
		case 37:
		case 65:
			gameManager.moveLeft();
			break;
		case 38:
		case 87:
			gameManager.moveUp();
			break;
		case 39:
		case 68:
			gameManager.moveRight();
			break;
		case 40:
		case 83:
			gameManager.moveDown();
			break;
		default:
		  	return;
	}

	redrawTiles(fgContext);
}


/****************************************************/
/*                 Visuals/Drawing                  */
/****************************************************/

function resizeCanvases() {
	var canvasWidth = numColumns * tileSize + tilePadding;
	var canvasHeight = numRows * tileSize + tilePadding;

	bgCanvas.width = canvasWidth;
	bgCanvas.height = canvasHeight;

	fgCanvas.width = canvasWidth;
	fgCanvas.height = canvasHeight;
}

function drawBackground(canvas, context) {  
  context.fillStyle = emptyTileColour;
  
  // Everything gets drawn like a normal grid, but moved across and down by tilePadding.
  for (i = 0; i < numRows; i++) {
    for (j = 0; j < numColumns; j++) {
      var y = (i * tileSize) + tilePadding;
      var x = (j * tileSize) + tilePadding;
      
      drawRoundedRect(context, x, y, actualTileSize, tileRadius);
    }
  }
}

// Helper function to draw a rect with curved corners - Looks slightly nicer
function drawRoundedRect(ctx, x, y, size, radius) {
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

function redrawTiles(context) {
  if (!gameManager)
    return;

  context.clearRect(0, 0, fgCanvas.width, fgCanvas.height);

  for (i = 0; i < numColumns; i++) {
    for (j = 0; j < numRows; j++) {
      var xPos = (i * tileSize) + tilePadding;
      var yPos = (j * tileSize) + tilePadding;

      var val = gameManager.grid[i][j];
      drawTile(context, val, xPos, yPos, actualTileSize)
    }
  }
}
var max = 0
function drawTile(context, value, x, y, size) {
  if (value == 0)
    return;
  
  context.fillStyle = tileColour;
  drawRoundedRect(context, x, y, size, tileRadius);
  
  // Set up the text
  context.fillStyle = "#000";
  context.font = "25px Arial"
  context.textAlign = "center";
  context.textBaseline = "middle";

  var output = Math.pow(2, value);

  context.fillText(output, x + (size / 2.0), y + (size / 2.0));
}