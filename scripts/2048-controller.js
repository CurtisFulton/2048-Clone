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

  this.startNewGame = function() {  
    this.resizeCanvases();
    this.drawBackground(this.bgCanvas, this.bgContext);

    this.gameManager.startNewGame(Math.random() * 10000);
    this.redrawTiles(this.fgContext);
    this.gameManager.onTileMoved = this.tileMoved;
  }

  this.tileMoved = function(moveInfo) {  
    moveInfo["currentX"] = moveInfo.startX;
    moveInfo["currentY"] = moveInfo.startY;

    visuals.movementQueue.push(moveInfo);
  }

  this.moveLeft = function() {  
    var movement = this.gameManager.moveLeft();

    this.animateMovement(0.1, this.movementQueue, this.fgContext);
    return movement;
  }

  this.moveRight = function() {  
    var movement = this.gameManager.moveRight();

    this.animateMovement(0.1, this.movementQueue, this.fgContext);
    return movement;
  }

  this.moveUp = function() {  
    var movement = this.gameManager.moveUp();

    this.animateMovement(0.1, this.movementQueue, this.fgContext);
    return movement;
  }

  this.moveDown = function() {  
    var movement = this.gameManager.moveDown();

    this.animateMovement(0.1, this.movementQueue, this.fgContext);
    return movement;
  }

  this.animateMovement = function(totalMoveTime, tiles, context) {
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
        visuals.animateMerges(0.15, tiles, context);
      } else {
        window.requestAnimationFrame(moveTiles);
      }
    }

    window.requestAnimationFrame(moveTiles);
  }

  this.animateMerges = function(totalMergeTime, tiles, context) {
    var totalTime = 0;  
    var prevTime;

    function moveTiles(time) {
      if (!prevTime)
        prevTime = time;
      
      let deltaTime = (time - prevTime) / 1000;
      context.clearRect(0, 0, visuals.fgCanvas.width, visuals.fgCanvas.height);
      visuals.redrawTiles(visuals.fgContext);

      tiles.forEach((tile) => {
        if (!tile.combined)
          return;

        let percent = totalTime / (totalMergeTime / 2);
        let size = 0;
        let x, y;

        if (percent < 1){
          size = visuals.lerp(visuals.actualTileSize, visuals.tileSize, percent);
          x = visuals.lerp((tile.currentX * visuals.tileSize) + visuals.tilePadding, tile.currentX * visuals.tileSize + (visuals.tilePadding / 2), percent);
          y = visuals.lerp((tile.currentY * visuals.tileSize) + visuals.tilePadding, tile.currentY * visuals.tileSize + (visuals.tilePadding / 2), percent);
        } else {
          size = visuals.lerp(visuals.tileSize, visuals.actualTileSize, percent % 1);
          x = visuals.lerp((tile.currentX * visuals.tileSize) + (visuals.tilePadding / 2), (tile.currentX * visuals.tileSize) + visuals.tilePadding, percent % 1);
          y = visuals.lerp((tile.currentY * visuals.tileSize) + (visuals.tilePadding / 2), (tile.currentY * visuals.tileSize) + visuals.tilePadding, percent % 1);
        }

        visuals.drawTile(context, tile.value + 1, x, y, size)
      });

      totalTime += deltaTime;
      prevTime = time;

      if (totalTime > totalMergeTime) {
        visuals.redrawTiles(visuals.fgContext);
        visuals.movementQueue = [];
      } else {
        window.requestAnimationFrame(moveTiles);
      }
    }

    window.requestAnimationFrame(moveTiles);

  }

  this.resizeCanvases = function() {
    var canvasWidth = this.numColumns * this.tileSize + this.tilePadding;
    var canvasHeight = this.numRows * this.tileSize + this.tilePadding;

    this.bgCanvas.width = canvasWidth;
    this.bgCanvas.height = canvasHeight;

    this.fgCanvas.width = canvasWidth;
    this.fgCanvas.height = canvasHeight;
  }

  this.drawBackground = function(canvas, context) {  
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
  this.drawRoundedRect = function(ctx, x, y, size, radius) {
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

  this.redrawTiles = function(context) {
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

  this.drawTile = function(context, value, x, y, size) {
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

  this.lerp = function (value1, value2, amount) {
    amount = amount < 0 ? 0 : amount;
    amount = amount > 1 ? 1 : amount;
    return value1 + (value2 - value1) * amount;
  };
}