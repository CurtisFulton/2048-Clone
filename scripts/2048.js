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
  
  addNewTile();
  redrawTiles(fgContext);
}

function moveLeft() {
  for (i = 1; i < numColumns; i++) {
    for (j = 0; j < numRows; j++) {
      if (grid[i][j] == 0) 
        continue;
      
      var tileVal = grid[i][j];
      grid[i][j] = 0;
      
      for (k = 1; k <= numColumns; k++) {
        var targetCol = i - k;
        
        if (targetCol == -1) {
          grid[0][j] = tileVal;
          break;
        }
        
        var targetVal = grid[targetCol][j];
        
        if (targetVal != 0) {
          if (targetVal == tileVal) {
            grid[targetCol][j] += tileVal;
          } else {
            grid[targetCol + 1][j] = tileVal; 
          }
          break;
        }
      }
    }
  }
}

function moveRight() {
  for (i = numColumns - 1; i >= 0; i--) {
    for (j = 0; j < numRows; j++) {
      if (grid[i][j] == 0) 
        continue;
      
      
      var tileVal = grid[i][j];
      grid[i][j] = 0;
      
      for (k = 1; k <= numColumns; k++) {
        var targetCol = i + k;
        
        if (targetCol >= numColumns) {
          grid[numColumns - 1][j] = tileVal; 
          break;
        }
        
        var targetVal = grid[targetCol][j]; 
        
        if (targetVal != 0) {
          if (targetVal == tileVal) {
            grid[targetCol][j] += tileVal;
          } else {
            grid[targetCol -1][j] = tileVal; 
          }
          break;
        }
      }
    }
  }
}

function moveUp() {
  for (j = 1; j < numRows; j++) {
    for (i = 0; i < numColumns; i++) {
      if (grid[i][j] == 0)
        continue;
      
      var tileVal = grid[i][j];
      grid[i][j] = 0;
      
      for (k = 1; k <= numRows; k++) {
        var targetRow = j - k;
        var targetVal = grid[i][targetRow];
        
        if (targetRow == -1) {
          grid[i][0] = tileVal; 
          break;
        }
        
        if (targetVal != 0) {
          if (targetVal == tileVal)
            grid[i][targetRow] += tileVal;
          else
            grid[i][targetRow + 1] = tileVal;  
          break;
        }
      }
    }
  }
}

function moveDown() {
  for (j = numRows - 1; j >= 0; j--) {
    for (i = 0; i < numColumns; i++) {
      if (grid[i][j] == 0)
        continue;
      
      var tileVal = grid[i][j];
      grid[i][j] = 0;
      
      for (k = 1; k <= numRows; k++) {
        var targetRow = j + k;
        var targetVal = grid[i][targetRow];
        
        if (targetRow >= numRows) {
          grid[i][targetRow - 1] = tileVal; 
          break;
        }
        
        if (targetVal != 0) {
          if (targetVal == tileVal)
            grid[i][targetRow] += tileVal;
          else
            grid[i][targetRow - 1] = tileVal;  
          break;
        }
      }
    }
  }
}