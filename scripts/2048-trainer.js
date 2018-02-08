var networks;

var numNetworks = 50;
var numHiddenLayers = 2;
var hiddenNodes = 16;

var intervalID = 0;
var delayBetweenMoves = 0;

window.addEventListener("load", function(e) {
	networks = new Array(numNetworks);

	for (var i = 0; i < networks.length; i++) {
		networks[i] = new NetworkInstance();
	}

	networks.forEach(function(network) {
		network.gameManager.onGameOver = function() {
			network.gameFinished = true;
		}
	});

	intervalID = setInterval(trainingLoop, delayBetweenMoves);
});


function trainingLoop() {
	var gamesStillRunning = 0;
	var bestNetwork = 0;

	for (var i = 0; i < networks.length; i++) {
		if (!networks[i].gameFinished){
			if (networks[i].gameManager.score > networks[bestNetwork].gameManager.score || networks[bestNetwork].gameFinished)
				bestNetwork = i;

			networks[i].nextMove();
			gamesStillRunning++;
		}


	}

	gameManager = networks[bestNetwork].gameManager;
  	redrawTiles(fgContext);

	if (gamesStillRunning == 0) {
		clearInterval(intervalID);
		var highscore = 0;
		for (var i = 0; i < networks.length; i++) {
			if (networks[i].gameManager.score > highscore) {
				highscore = networks[i].gameManager.score;
			}
		}
		alert("Game Finished. Highscore: " + highscore);
	}
};


// Class to contain a single instance of a neural network and game
function NetworkInstance() {
	this.gameFinished = false;

	this.numIllegalMoves = 0;
	this.neuralNetwork = new NeuralNetwork(17, 4);
	this.gameManager = new GameManager2048(numColumns, numRows);

	this.neuralNetwork.randomizeNetwork(numHiddenLayers, hiddenNodes);
	this.gameManager.startNewGame();
}

NetworkInstance.prototype.nextMove = function() {

	for (var x = 0; x < this.gameManager.numColumns; x++) {
		for (var y = 0; y < this.gameManager.numRows; y++) {
			var val = this.gameManager.grid[x][y];
			var index = (x * this.gameManager.numColumns) + y;

			this.neuralNetwork.setInput(index, val);
		}
	}
	this.neuralNetwork.setInput(this.neuralNetwork.input.length - 1, this.numIllegalMoves);
	this.neuralNetwork.feedForward();
	var outputs = this.neuralNetwork.getOutput();
	var networkIndex = 0;

	for (var i = 0; i < outputs.length; i++) {
		if (outputs[i] > outputs[networkIndex]) {
			networkIndex = i;
		}
	}

	var movedTiles;
	switch(networkIndex) {
		case 0: movedTiles = this.gameManager.moveLeft(); break;
		case 1: movedTiles = this.gameManager.moveRight(); break;
		case 2: movedTiles = this.gameManager.moveDown(); break;
		case 3: movedTiles = this.gameManager.moveUp(); break;
		default: console.log("Error"); break;
	}

	if (movedTiles == 0) {
		this.numIllegalMoves++;
	} else {
		this.numIllegalMoves = 0;
	}

	if (this.numIllegalMoves > 100) {
		this.gameManager.onGameOver();
	}
}