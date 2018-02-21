var visuals;
var score;
var moves;

window.addEventListener("load", function(e) {
  visuals = new Visuals2048(4, 4, 100, 15);

  window.addEventListener('keyup', keyboardInput, false);
  document.getElementById('restart').addEventListener('click', () => visuals.startNewGame());
  score = document.getElementById('score');
  moves = document.getElementById('moves');

  visuals.startNewGame();
  updateScore();
});

/****************************************************/
/*                    Inputs                        */
/****************************************************/

function keyboardInput(e) {
	let direction = "";

	switch (e.keyCode) { 
		case 37:
		case 65:
			direction = "Left";
			break;
		case 38:
		case 87:
			direction = "Up";
			break;
		case 39:
		case 68:
			direction = "Right";
			break;
		case 40:
		case 83:
			direction ="Down";
			break;
		default:
		  	return;
	}

	let tilesMoved = visuals.moveBoard(direction);

	score.innerHTML = visuals.gameManager.score;
	moves.innerHTML = visuals.gameManager.numMoves;
	
}

function updateScore() {
	score.innerHTML = visuals.gameManager.score;
	moves.innerHTML = visuals.gameManager.numMoves;

	window.requestAnimationFrame(updateScore);
}