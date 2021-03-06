function Visuals2048(col, row, size, padding) {
  this.bgCanvas = document.getElementById("background");
  this.bgContext = this.bgCanvas.getContext("2d");

  this.fgCanvas = document.getElementById("foreground");
  this.fgContext = this.fgCanvas.getContext("2d");

  // Colours to use for drawing
  this.backgroundColour = "#BBADA0";
  this.tileColour = ["RGBA(238, 228, 218, 0.35)", "#EEE6DB", "#ECE0C8", "#EFB27C", "#F39768", "#F37D63", "#F46042", "#EACF76", "#EDCB67", "#ECC85A", "#E7C258", "#E8BE4E"];

  // Game set up variables
  this.numColumns = col;
  this.numRows = row; 
  this.tilePadding = padding; 
  this.tileSize; // Size that each tile should take up, not including padding
  this.realTileSize; // Tile size after adding padding
  this.canvasMultipler = 1;

  this.gameManager = new GameManager2048(this.numColumns, this.numRows);
  this.nextInput = "";

  this.animationMoveTime = 0.1;
  this.animationMergeTime = 0.2;
  this.isAnimating = false;

  this.moveQueue = [];
  this.mergeQueue = [];

  this.drawBackground();

  // This is private so it cannot be forced to move during an animation. 
  // Arrow function used to preserve 'this' context
  var applyMovement = (direction) => {
    let movement = false;

    switch (direction.toLowerCase()) {
      case "up":
        movement = this.gameManager.moveBoard(0, -1);
        break;
      case "down":
        movement = this.gameManager.moveBoard(0, 1);
        break;
      case "left":
        movement = this.gameManager.moveBoard(-1, 0);
        break;
      case "right":
        movement = this.gameManager.moveBoard(1, 0);
        break;
      default:
        console.log("Error - " + direction + " is not a valid movement");
    }

    return movement;
  }

  // Private animation loop. Arrow function used to preserve 'this' context
  var inputLoop = () => {
    if (!this.isAnimating && this.nextInput && this.nextInput != "") {
      // If the merging animation has been cut short, re-draw the board so there are no artifacts.
      if (this.mergeQueue.length != 0) {
        this.mergeQueue = [];
      }
      // Make sure the game board is up to date
      this.drawGameBoard();

      // Handle any input
      if (applyMovement(this.nextInput)) {
        window.requestAnimationFrame(animationLoop);
        this.nextInput = "";
      }
    }

    window.requestAnimationFrame(inputLoop);
  }

  var animationLoop = (time, startTime, prevTotal) => {
    if (!startTime) {
      startTime = time;
    }

    let totalTime = (time - startTime) / 1000;

    // If this is the frame it finished animating the movement
    if (prevTotal <= this.animationMoveTime && totalTime > this.animationMoveTime) {
      this.mergeQueue = this.moveQueue.filter(tile => tile.combined);
      this.moveQueue = [];

      this.drawGameBoard();
      this.isAnimating = false;
    }


    if (totalTime <= this.animationMoveTime) {
      this.isAnimating = true;

      let percent = totalTime / this.animationMoveTime;

      moveTiles(percent);

    } else if (!this.isAnimating && totalTime <= this.animationMoveTime + this.animationMergeTime && this.mergeQueue.length > 0) {
      let percent = totalTime / (this.animationMoveTime + this.animationMergeTime) * 2;
      
      if (percent > 1) 
        percent = 2 - percent;

      mergeTiles(percent);
    } else {
      // Animation is finished, clear queue and exit loop.
      this.mergeQueue = [];
      return;
    }

    window.requestAnimationFrame((timeStamp) => {
      animationLoop(timeStamp, startTime, totalTime);
    })
  }

  var moveTiles = (percent) => {
    let ctx = this.fgContext;

    this.moveQueue.forEach((tile) => {
      let prevX = (tile.currentX * this.tileSize) + this.tilePadding - 1;
      let prevY = (tile.currentY * this.tileSize) + this.tilePadding - 1;

      ctx.clearRect(prevX, prevY, this.realTileSize + 2, this.realTileSize + 2);

      tile.currentX = lerp(tile.startX, tile.endX, percent);
      tile.currentY = lerp(tile.startY, tile.endY, percent);

      this.drawTile(tile.currentX, tile.currentY, tile.value, this.realTileSize);
    });
  }

  var mergeTiles = (percent) => {
    let ctx = this.fgContext;
    let percentIncrease = 0.1;

    ctx.clearRect(0, 0, this.fgCanvas.width, this.fgCanvas.height);
    this.drawGameBoard();

    this.mergeQueue.forEach((tile) => {
      let x = lerp(tile.endX, tile.endX - (percentIncrease / 2), percent);
      let y = lerp(tile.endY, tile.endY - (percentIncrease / 2), percent);

      let size = lerp(this.realTileSize, this.realTileSize * (1 + percentIncrease), percent);

      this.drawTile(x, y, tile.value + 1, size);
    });
  }

  inputLoop();
  this.gameManager.onTileMoved = (moveInfo) => {
    moveInfo["currentX"] = moveInfo.startX;
    moveInfo["currentY"] = moveInfo.startY;

    this.moveQueue.push(moveInfo);
  };
}

Visuals2048.prototype.startNewGame = function() {
  console.log("Test");
  this.gameManager.startNewGame();
  this.drawGameBoard();
}

Visuals2048.prototype.moveBoard = function(direction) {
  this.nextInput = direction;
}

Visuals2048.prototype.animateMovement = function() {
  this.gameManager.startNewGame();
  this.drawGameBoard();
}

// Draws what the current gameboard looks like.
Visuals2048.prototype.drawGameBoard = function() {
  let ctx = this.fgContext;
  ctx.clearRect(0, 0, this.fgCanvas.width, this.fgCanvas.height);

  // Loop through all tiles and draw any that aren't empty
  for (let i = 0; i < this.numColumns; i++) {
    for (let j = 0; j < this.numRows; j++) {
      // If the tile is empty (value of 0) skip this loop
      if (this.gameManager.grid[i][j] == 0)
        continue;

      this.drawTile(i, j, this.gameManager.grid[i][j], this.realTileSize);
    }
  }
}

Visuals2048.prototype.drawTile = function(x, y, value, size) {
  let ctx = this.fgContext;
  let bgColour = this.tileColour[Math.min(value, this.tileColour.length)];

  // Convert from grid to canvas space
  let xPos = (x * this.tileSize) + this.tilePadding;
  let yPos = (y * this.tileSize) + this.tilePadding;

  // Draw the tile
  ctx.fillStyle = bgColour;
  drawRoundedRect(ctx, xPos, yPos, size, size, 4 * this.canvasMultipler);

  // Set the font size
  let fontSize = 55;
  if (value > 6) fontSize = 45;
  if (value > 10) fontSize = 35;

  fontSize *= this.canvasMultipler;
  // The font colour is white for all tiles above 2 (Board value of 4)
  ctx.fillStyle = value < 3 ? "#736E60" : "#FFF";
  ctx.font = "bolder " + fontSize + "px Open Sans";

  // Center the text so it shows up in the middle of the tile.
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Draw the value inside tile. We need to raise 2 to the power of the tile value to get the display value.
  ctx.fillText(Math.pow(2, value), xPos + (size / 2.0), yPos + (size / 2.0));
}

// Draws what the current gameboard looks like.
Visuals2048.prototype.resizeCanvases = function() {
}

// Draws the background for the game board. This includes the empty tiles.
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

      drawRoundedRect(ctx, x, y, this.realTileSize, this.realTileSize, 4 * this.canvasMultipler);
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