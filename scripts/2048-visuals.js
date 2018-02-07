/****************************************************/
/*				Global Varibables                   */
/****************************************************/

var bgCanvas = document.getElementById("background");
var bgContext = bgCanvas.getContext("2d");

var fgCanvas = document.getElementById("foreground");
var fgContext = fgCanvas.getContext("2d");

var backgroundColor = "#A88768";
var tileColour = "#EEE4DA";
var emptyTileColour = "rgba(238, 228, 218, 0.5)";

// Used to get the size of the canvas
var numRows = 4;
var numColumns = 4;
var tileRadius = 4
var tileSize = 100;
var tilePadding = 12.5;
var actualTileSize = tileSize - tilePadding; 

resizeCanvases();
drawBackground(bgCanvas, bgContext);

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