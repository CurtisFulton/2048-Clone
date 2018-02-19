var visuals;
var score;
var moves;

window.addEventListener("load", function(e) {
  visuals = new Visuals2048(4, 4, 100, 12.5);

  window.addEventListener('keyup', this.keyboardInput, false);
  //document.getElementById('restart').addEventListener('click', () => visuals.startNewGame());
  score = document.getElementById('score');
  moves = document.getElementById('moves');
});

function Visuals2048(col, row, size, padding) {
  this.bgCanvas = document.getElementById("background");
  this.bgContext = this.bgCanvas.getContext("2d");

  this.fgCanvas = document.getElementById("foreground");
  this.fgContext = this.fgCanvas.getContext("2d");

  this.backgroundColor = "#bbada0";
  this.tileColour = ["#EEE6DB", "#ECE0C8", "#EFB27C", "#F39768", "#F37D63", "#F46042", "#EACF76", "#EDCB67", "#ECC85A", "#E7C258", "#E8BE4E"];
  this.emptyTileColour = "#CBC2B3";

  this.numColumns = col;
  this.numRows = row;
  this.tileSize = size;
  this.tilePadding = padding;
  this.actualTileSize = this.tileSize - this.tilePadding; 

  this.gameManager = new GameManager2048(this.numColumns, this.numRows);

  this.animationTime = 0.5;
  this.movementQueue = [];
  this.gameManager.onTileMoved = this.tileMoved;

  this.startNewGame();
}

/****************************************************/
/*                    Inputs                        */
/****************************************************/

function keyboardInput(e) {
  var tilesMoved;
  if (visuals.movementQueue.length > 0){
    return;
  }

	switch (e.keyCode) { 
		case 37:
		case 65:
			tilesMoved = visuals.gameManager.moveLeft();
			break;
		case 38:
		case 87:
			tilesMoved = visuals.gameManager.moveUp();
			break;
		case 39:
		case 68:
			tilesMoved = visuals.gameManager.moveRight();
			break;
		case 40:
		case 83:
			tilesMoved = visuals.gameManager.moveDown();
			break;
		default:
		  	return;
	}

  if (tilesMoved) {
    score.innerHTML = visuals.gameManager.score;
    moves.innerHTML = parseInt(moves.innerHTML) + 1;

    visuals.animateMovement(0.1, visuals.movementQueue, visuals.fgContext);
    //visuals.redrawTiles(visuals.fgContext);
  }
}

/****************************************************/
/*                 Visuals/Drawing                  */
/****************************************************/

Visuals2048.prototype.startNewGame = function() {  
  this.resizeCanvases();
  this.drawBackground(this.bgCanvas, this.bgContext);

  this.gameManager.startNewGame(Math.random() * 10000);
  this.redrawTiles(this.fgContext);
}

Visuals2048.prototype.tileMoved = function(moveInfo) {  
  moveInfo["currentX"] = moveInfo.startX;
  moveInfo["currentY"] = moveInfo.startY;

  visuals.movementQueue.push(moveInfo);
}

Visuals2048.prototype.animateMovement = function(totalMoveTime, tiles, context) {
  var totalTime = 0;  
  var prevTime;

  function moveTiles(time) {
    if (!prevTime)
      prevTime = time;

    let deltaTime = (time - prevTime) / 1000;

    tiles.forEach((tile) => {
      context.clearRect((tile.currentX * visuals.tileSize) + visuals.tilePadding - 1, (tile.currentY * visuals.tileSize) + visuals.tilePadding - 1, 92, 92);
      var percent = totalTime / totalMoveTime;

      tile.currentX = visuals.lerp(tile.startX, tile.endX, percent);
      tile.currentY = visuals.lerp(tile.startY, tile.endY, percent);

      visuals.drawTile(context, tile.value, (tile.currentX * visuals.tileSize) + visuals.tilePadding, (tile.currentY * visuals.tileSize)+ visuals.tilePadding, visuals.actualTileSize)
    });

    totalTime += deltaTime;
    prevTime = time;
    if (totalTime > totalMoveTime) {
      visuals.redrawTiles(visuals.fgContext);
      visuals.movementQueue = [];
    } else {
      window.requestAnimationFrame(moveTiles);
    }
  }

  window.requestAnimationFrame(moveTiles);
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
  
  context.fillStyle = this.tileColour[Math.min(value - 1, this.tileColour.length - 1)];
  this.drawRoundedRect(context, x, y, size, 4);
  // Set up the text
  context.fillStyle = value < 3 ? "#736E60" : "#FFF";
  context.font = "bold 40px Open Sans"
  context.textAlign = "center";
  context.textBaseline = "middle";

  if (value > 6)
    context.font = "bold 35px Open Sans"
  if (value > 10)
    context.font = "bold 30px Open Sans"


  var output = Math.pow(2, value);

  context.fillText(output, x + (size / 2.0), y + (size / 2.0));
}

Visuals2048.prototype.lerp = function (value1, value2, amount) {
  amount = amount < 0 ? 0 : amount;
  amount = amount > 1 ? 1 : amount;
  return value1 + (value2 - value1) * amount;
};