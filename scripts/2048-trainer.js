var network;
var illegalMoves = 0;

window.addEventListener("load", function(e) {
	network = new NeuralNetwork(17, 4);
	network.randomizeNetwork(1, 16);
});

setInterval(function() {
	for (var x = 0; x < gameManager.numColumns; x++) {
		for (var y = 0; y < gameManager.numRows; y++) {
			var val = gameManager.grid[x][y];
			var index = (x * gameManager.numColumns) + y;

			network.setInput(index, val);
		}
	}
	network.setInput(network.input.length - 1, illegalMoves);
	network.feedForward();
	var outputs = network.getOutput();
	var networkIndex = 0;

	for (var i = 0; i < outputs.length; i++) {
		if (outputs[i] > outputs[networkIndex]) {
			networkIndex = i;
		}
	}

	var movedTiles;
	switch(networkIndex) {
		case 0: movedTiles = gameManager.moveLeft(); break;
		case 1: movedTiles = gameManager.moveRight(); break;
		case 2: movedTiles = gameManager.moveDown(); break;
		case 3: movedTiles = gameManager.moveUp(); break;
	}

	if (movedTiles == 0) {
		illegalMoves++;
	} else {
		illegalMoves = 0;
	}


	redrawTiles(fgContext);
}, 250);
