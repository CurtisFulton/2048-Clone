function Visuals2048(col, row, size, padding) {
  this.bgCanvas = document.getElementById("background");
  this.bgContext = this.bgCanvas.getContext("2d");

  this.fgCanvas = document.getElementById("foreground");
  this.fgContext = this.fgCanvas.getContext("2d");

  // Colours to use for drawing
  this.backgroundColor = "#BBADA0";
  this.tileColour = ["#CBC2B3", "#EEE6DB", "#ECE0C8", "#EFB27C", "#F39768", "#F37D63", "#F46042", "#EACF76", "#EDCB67", "#ECC85A", "#E7C258", "#E8BE4E"];

  // Game set up variables
  this.numColumns = col;
  this.numRows = row; 
  this.tileSize = size; // Size that each tile should take up, not including padding
  this.tilePadding = padding; 
  this.realTileSize = this.tileSize - this.tilePadding; // Tile size after adding padding

  this.gameManager = new GameManager2048(this.numColumns, this.numRows);
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

// Helper Lerp function
function lerp(value1, value2, amount) {
  amount = amount < 0 ? 0 : amount;
  amount = amount > 1 ? 1 : amount;
  return value1 + (value2 - value1) * amount;
};