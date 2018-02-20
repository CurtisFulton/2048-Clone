var visuals;
var score;
var moves;

window.addEventListener("load", function(e) {
  visuals = new Visuals2048(4, 4, 100, 12.5);

  window.addEventListener('keyup', keyboardInput, false);
  //document.getElementById('restart').addEventListener('click', () => visuals.startNewGame());
  score = document.getElementById('score');
  moves = document.getElementById('moves');

  visuals.startNewGame();
});

/****************************************************/
/*                    Inputs                        */
/****************************************************/

function keyboardInput(e) {
	var tilesMoved;

	switch (e.keyCode) { 
		case 37:
		case 65:
			tilesMoved = visuals.moveLeft();
			break;
		case 38:
		case 87:
			tilesMoved = visuals.moveUp();
			break;
		case 39:
		case 68:
			tilesMoved = visuals.moveRight();
			break;
		case 40:
		case 83:
			tilesMoved = visuals.moveDown();
			break;
		default:
		  	return;
	}

	if (tilesMoved) {
		score.innerHTML = visuals.gameManager.score;
		moves.innerHTML = parseInt(moves.innerHTML) + 1;
	}
}