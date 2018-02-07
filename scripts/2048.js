/****************************************************/
/*				Global Varibables                   */
/****************************************************/

// Stores the state of the game
var grid;

var numStartingTiles = 2;
var numRows = 4;
var numColumns = 4;


/****************************************************/
/*				    Game Logic                      */
/****************************************************/
window.addEventListener("load", function(e) {
	resetGame();
	window.addEventListener('keyup', this.keyboardInput, false);
})

function resetGame() {
  grid = new Array(numColumns);
  // Initialize the grid, and set all the values to 0 (So they are all empty)
  for (i = 0; i < numColumns; i++) {
    grid[i] = new Array(numRows)
    
    for (j = 0; j < numRows; j++) {
      grid[i][j] = 0;
    }
  }
  
  // Set the starting tiles
  for (i = 0; i < numStartingTiles; i++) {
    addNewTile();
  }
}

function addNewTile() {
    // Sometimes this picks the same value twice. 
    var x = Math.floor(Math.random() * numColumns);
    var y = Math.floor(Math.random() * numRows); 
    
    // Make sure we find a grid spot that hasn't been chosen before.
    var numAttempts = 0
    while (grid[x][y] != 0) {
      var x = Math.floor(Math.random() * numColumns);
      var y = Math.floor(Math.random() * numRows); 
      
      if (numAttempts++ > 100)
        break;
    }
    
    var startingVal = Math.floor((Math.random() * 2) + 1);
    grid[x][y] = startingVal;
}

function keyboardInput(e) {
  switch (e.keyCode) { 
    case 37:
    case 65:
      moveLeft();
      break;
    case 38:
    case 87:
      moveUp();
      break;
    case 39:
    case 68:
      moveRight();
      break;
    case 40:
    case 83:
      moveDown();
      break;
    default:
      return;
  }
  
  redrawTiles(fgContext);
}

function moveBoard(xMov, yMov) {
	var startX = (xMov == 1 ? numColumns - 1 : 0);
	var endX = (xMov == 1 ? -1 : numColumns);

	var startY = (yMov == 1 ? numRows - 1 : 0);
	var endY = (yMov == 1 ? -1 : numRows);

	var xStep = (xMov == 1 ? -1 : 1);
	var yStep = (yMov == 1 ? -1 : 1);

	// Keep track of how many tiles have been moved
	var numMovedTiles = 0;

	for (x = startX; x != endX; x += xStep) {
		for (y = startY; y != endY; y += yStep) {
			// Check if the grid is empty
			if (grid[x][y] == 0)
				continue;

			// Cache the grid value and remove it from the board
			var tileVal = grid[x][y];
			grid[x][y] = 0;

			// Search for where to put it.
			for (k = 1; k <= Math.max(numColumns, numRows); k++) {
				var targetX = x + (k * xMov);
				var targetY = y + (k * yMov);

				if (targetX <= -1 || targetY <= -1 || targetX >= numColumns || targetY >= numRows) {
					// Make sure the targets are within the grid.
					targetX = Math.min(Math.max(0, targetX), numColumns - 1);
					targetY = Math.min(Math.max(0, targetY), numRows - 1);

					grid[targetX][targetY] = tileVal;

					if (targetX != x || targetY != y) 
						numMovedTiles++;
					
					break;
				}

				if (grid[targetX][targetY] != 0) {
					if (grid[targetX][targetY] == tileVal) {
						grid[targetX][targetY] += tileVal;

						if (targetX != x || targetY != y) 
							numMovedTiles++;
					} else {
						grid[targetX - xMov][targetY - yMov] = tileVal;

						if (targetX - xMov != x || targetY - yMov != y) 
							numMovedTiles++;
					}

					break;
				}
			}
		}
	}

	if (numMovedTiles > 0)
  		addNewTile();
  	else 
  		console.log("Illegal move");
}

function moveLeft() {
	moveBoard(-1, 0);
}

function moveRight() {
	moveBoard(1, 0);
}

function moveUp() {
	moveBoard(0, -1);
}

function moveDown() {
	moveBoard(0, 1);
}