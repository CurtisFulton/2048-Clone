/****************************************************/
/*				    2048 Prototype                  */
/****************************************************/
function GameManager2048(columns, rows) {
	this.numColumns = numColumns;
	this.numRows = rows;

	this.grid;
}

GameManager2048.prototype.startNewGame = function() {
	var newGrid = new Array(numColumns);
	// Initialize the grid, and set all the values to 0 (So they are all empty)
	for (i = 0; i < numColumns; i++) {
		newGrid[i] = new Array(numRows)

		for (j = 0; j < numRows; j++) {
		  newGrid[i][j] = 0;
		}
	}
	this.grid = newGrid;

	// Add 2 tiles to the starting board
	this.addNewTile();
	this.addNewTile();
}

GameManager2048.prototype.addNewTile = function() {
	// Sometimes this picks the same value twice. 
    var x = Math.floor(Math.random() * numColumns);
    var y = Math.floor(Math.random() * numRows); 
    
    // Make sure we find a grid spot that hasn't been chosen before.
    var numAttempts = 0
    while (this.grid[x][y] != 0) {
      var x = Math.floor(Math.random() * numColumns);
      var y = Math.floor(Math.random() * numRows); 
      
      if (numAttempts++ > 100)
        break;
    }
    
    var startingVal = Math.floor((Math.random() * 2) + 1);
    this.grid[x][y] = startingVal;
}

GameManager2048.prototype.moveBoard = function(xMov, yMov) {
	var startX = (xMov == 1 ? this.numColumns - 1 : 0);
	var endX = (xMov == 1 ? -1 : this.numColumns);

	var startY = (yMov == 1 ? this.numRows - 1 : 0);
	var endY = (yMov == 1 ? -1 : this.numRows);

	var xStep = (xMov == 1 ? -1 : 1);
	var yStep = (yMov == 1 ? -1 : 1);

	// Keep track of how many tiles have been moved
	var numMovedTiles = 0;

	for (x = startX; x != endX; x += xStep) {
		for (y = startY; y != endY; y += yStep) {
			// Check if the tile is empty
			if (this.grid[x][y] == 0)
				continue;

			// Cache the grid value and remove it from the board
			var tileVal = this.grid[x][y];
			this.grid[x][y] = 0;

			// Search for where to put it.
			for (k = 1; k <= Math.max(this.numColumns, this.numRows); k++) {
				var targetX = x + (k * xMov);
				var targetY = y + (k * yMov);

				if (targetX <= -1 || targetY <= -1 || targetX >= this.numColumns || targetY >= this.numRows) {
					// Make sure the targets are within the grid.
					targetX = Math.min(Math.max(0, targetX), this.numColumns - 1);
					targetY = Math.min(Math.max(0, targetY), this.numRows - 1);

					this.grid[targetX][targetY] = tileVal;

					if (targetX != x || targetY != y) 
						numMovedTiles++;
					
					break;
				}

				if (this.grid[targetX][targetY] != 0) {
					if (this.grid[targetX][targetY] == tileVal) {
						this.grid[targetX][targetY] += 1;

						if (targetX != x || targetY != y) 
							numMovedTiles++;
					} else {
						this.grid[targetX - xMov][targetY - yMov] = tileVal;

						if (targetX - xMov != x || targetY - yMov != y) 
							numMovedTiles++;
					}

					break;
				}
			}
		}
	}

	if (numMovedTiles > 0)
  		this.addNewTile();

  	return numMovedTiles;
}

GameManager2048.prototype.moveLeft = function() {
	return (this.moveBoard(-1, 0) > 0 ? true : false);
}

GameManager2048.prototype.moveRight = function() {
	return (this.moveBoard(1, 0) > 0 ? true : false)
}

GameManager2048.prototype.moveUp = function() {
	return (this.moveBoard(0, -1) > 0 ? true : false)
}

GameManager2048.prototype.moveDown = function() {
	return (this.moveBoard(0, 1) > 0 ? true : false)
}