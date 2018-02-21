var visuals;
var score;
var moves;

var startPos;
var endPos;

window.addEventListener("load", function(e) {
  visuals = new Visuals2048(4, 4, 100, 15);

  window.addEventListener('keyup', keyboardInput, false);
  document.getElementById('restart').addEventListener('click', () => visuals.startNewGame());
  score = document.getElementById('score');
  moves = document.getElementById('moves');

  visuals.fgCanvas.addEventListener("touchstart", touchStart);
  visuals.fgCanvas.addEventListener("touchmove", touchMove);
  visuals.fgCanvas.addEventListener("touchend", touchEnd);

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
			console.log(e.keyCode);
		  	return;
	}

	let tilesMoved = visuals.moveBoard(direction);

	score.innerHTML = visuals.gameManager.score;
	moves.innerHTML = visuals.gameManager.numMoves;
	
}

function touchStart(e) {
  	startPos = e.touches[0];
  	endPos = startPos;
  	e.preventDefault();
}

function touchMove(e) {
  	endPos = e.touches[0];
  	e.preventDefault();
}

function touchEnd(e) {
	if (endPos == startPos)
		return;

	let dist = {
		x : endPos.clientX - startPos.clientX,
		y : endPos.clientY - startPos.clientY,
	}

	let key = 0;

	// Determine which direction the swipe was in.
	if (Math.abs(dist.x) > Math.abs(dist.y)) {
		if (dist.x < 0)
			key = 65;
		else 
			key = 68;
	} else {
		if (dist.y < 0)
			key = 87
		else 
			key = 83;
	}

	// Create an object with keycode to route it through the keypress function
    keyboardInput({ keyCode : key });
}

function updateScore() {
	score.innerHTML = visuals.gameManager.score;
	moves.innerHTML = visuals.gameManager.numMoves;

	window.requestAnimationFrame(updateScore);
}