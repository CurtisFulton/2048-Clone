function Visuals2048(col, row, size, padding) {
  this.bgCanvas = document.getElementById("background");
  this.bgContext = this.bgCanvas.getContext("2d");

  this.fgCanvas = document.getElementById("foreground");
  this.fgContext = this.fgCanvas.getContext("2d");

  // Colours to use for drawing
  this.backgroundColour = "#BBADA0";
  this.tileColour = ["#CBC2B3", "#EEE6DB", "#ECE0C8", "#EFB27C", "#F39768", "#F37D63", "#F46042", "#EACF76", "#EDCB67", "#ECC85A", "#E7C258", "#E8BE4E"];

  // Game set up variables
  this.numColumns = col;
  this.numRows = row; 
  this.tilePadding = padding; 
  this.tileSize; // Size that each tile should take up, not including padding
  this.realTileSize; // Tile size after adding padding
  this.canvasMultipler = 1.5;

  this.gameManager = new GameManager2048(this.numColumns, this.numRows);
  this.drawBackground();
}

Visuals2048.prototype.drawBackground = function() {
  let ctx = this.bgContext;

  // Increase pixel density of canvas to make it look sharper
  this.bgCanvas.width = this.bgCanvas.scrollWidth * this.canvasMultipler;
  this.bgCanvas.height = this.bgCanvas.scrollHeight * this.canvasMultipler;

  this.fgCanvas.width = this.fgCanvas.scrollWidth * this.canvasMultipler;
  this.fgCanvas.height = this.fgCanvas.scrollHeight * this.canvasMultipler;

  this.tilePadding = this.tilePadding * this.canvasMultipler;

  // Set the background colour
  ctx.fillStyle = this.backgroundColour;
  drawRoundedRect(ctx, 0, 0, this.bgCanvas.width, this.bgCanvas.height, 7 * this.canvasMultipler);

  // Calculate the tile size. This needs to be dynamic because the canvas can be different sizes
  this.tileSize = (this.bgCanvas.width - this.tilePadding) / this.numColumns;
  this.realTileSize = this.tileSize - (this.tilePadding);

  // Set the tile colour
  ctx.fillStyle = this.tileColour[0];
  // Draw all tiles
  for (let i = 0; i < this.numColumns; i++) {
    for (let j = 0; j < this.numRows; j++) {
      let x = (i * this.tileSize) + this.tilePadding;
      let y = (j * this.tileSize) + this.tilePadding;

      drawRoundedRect(ctx, x, y, this.realTileSize, this.realTileSize, 5 * this.canvasMultipler);
    }
  }
}


/****************************************************/
/*               Helper Functions                   */
/****************************************************/

// Helper function to draw a rect with curved corners - Looks slightly nicer
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

// Helper Lerp function
function lerp(value1, value2, amount) {
  amount = amount < 0 ? 0 : amount;
  amount = amount > 1 ? 1 : amount;
  return value1 + (value2 - value1) * amount;
};