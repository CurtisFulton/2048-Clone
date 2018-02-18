/****************************************************/
/*				    2048 Prototype                  */
/****************************************************/
function GameManager2048(columns, rows, seed) {
	this.numColumns = columns;
	this.numRows = rows;

	this.grid;
	this.onGameOver;

	this.score = 0;
	this.seed = seed || Math.random() * 1092381024;
	this.myRng = new Math.seedrandom(this.seed);
}

GameManager2048.prototype.startNewGame = function(seed) {
	var newGrid = new Array(this.numColumns);

	// Initialize the grid, and set all the values to 0 (So they are all empty)
	for (i = 0; i < this.numColumns; i++) {
		newGrid[i] = new Array(this.numRows)

		for (j = 0; j < this.numRows; j++) {
		  newGrid[i][j] = 0;
		}
	}
	
	this.grid = newGrid;
	this.score = 0;
	this.myRng = new Math.seedrandom(seed || this.seed);

	// Add 2 tiles to the starting board
	this.addNewTile();
	this.addNewTile();
}

GameManager2048.prototype.addNewTile = function() {
	var possibleIndexes = []

	for (i = 0; i < this.numColumns; i++) {
		for (j = 0; j < this.numRows; j++) {
			if (this.grid[i][j] == 0) {
				possibleIndexes.push({ 
					x : i,
					y : j
				});
			}
		}
	}

	var newIndex = Math.floor(this.myRng.quick() * possibleIndexes.length);
	var newPos = possibleIndexes[newIndex];

    var startingVal = Math.floor((this.myRng.quick() * 2) + 1);
    this.grid[newPos.x][newPos.y] = startingVal;

    if (possibleIndexes.length <= 1 && !this.movementPossible() && this.onGameOver) {
		this.onGameOver();
		return;
	}
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
						this.score += Math.pow(2, this.grid[targetX][targetY]);
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

GameManager2048.prototype.movementPossible = function() {
	for (x = 0; x < this.numColumns; x++) {
		for (y = 0; y < this.numRows; y++) {
			var tileVal = this.grid[x][y];
			// If there is a single free space, there is possible movement
			if (tileVal == 0)
				return true;

			// Only need to check down and right. Left and up were checked before or weren't possible.
			// This is only because that is the order the loops run in.

			// Check down
			if (y != (this.numRows - 1) && this.grid[x][y + 1] == tileVal)
				return true;

			// Check right
			if (x != (this.numColumns - 1) && this.grid[x + 1][y] == tileVal)
				return true;
		}
	}

	return false;
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

