var networks;

var numNetworks = 20;
var numHiddenLayers = 1;
var hiddenNodes = 40;

var intervalID = 0;
var delayBetweenMoves = 0;

var genCount = 0;
var avg = 0;

var chart = new CanvasJS.Chart("chartContainer", {
	theme: "light1", // "light2", "dark1", "dark2"
	animationEnabled: false, // change to true		
	title:{
		text: "Avg"
	},
    legend: {
       horizontalAlign: "center", // "center" , "right"
       verticalAlign: "bottom",  // "top" , "bottom"
       fontSize: 15
    },
	data: [
	{
		type: "line",      
		showInLegend: true,
      	legendText: "avg",
		dataPoints: []
	}, 
	{
		type: "line",
		showInLegend: true,
      	legendText: "High score",
		dataPoints: []
	}
	]
});
chart.render();

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


	if (gamesStillRunning == 0) {
		avg = 0;
		for (var i = 0; i < networks.length; i++) {
			avg += networks[i].gameManager.score;
			if (networks[i].gameManager.score > gameManager.score) {
				gameManager = networks[i].gameManager;
			}
		}

		avg /= networks.length;

		chart.options.data[0].dataPoints.push({y : avg});
		chart.options.data[1].dataPoints.push({y : gameManager.score});

		chart.render();
		genCount++;
		let newNetworks = createNewGeneration(networks, Math.floor(networks / 4), Math.floor(networks / 8));

		for (var i = 0; i < newNetworks.length; i++) {
			newNetworks[i] = new NetworkInstance(newNetworks[i]);
		}

		networks = newNetworks;

		networks.forEach(function(network) {
			network.gameManager.onGameOver = function() {
				network.gameFinished = true;
			}
		});
	}

	document.getElementById('gen-num').innerHTML = genCount;
	document.getElementById('current-high-score').innerHTML = gameManager.score;
	document.getElementById('pev-avg').innerHTML = avg;
  	redrawTiles(fgContext);
};

function createNewGeneration(oldNetworks, popToKeep, newPop) {
	let newNetworks = new Array(oldNetworks.length);
	let cumTotal = 0;

	for (var i = 0; i < oldNetworks.length; i++) {
		cumTotal += oldNetworks[i].gameManager.score;
	}

	for (var i = 0; i < popToKeep; i++) {
		let random = Math.floor(Math.random() * (cumTotal + 1));

		for (var j = 0; j < oldNetworks.length; j++) {
			random -= oldNetworks[j].gameManager.score;

			if (random <= 0){
				newNetworks[i] = oldNetworks[j].neuralNetwork;
				break;
			}
		}
	}

	// Breed new networks
	for (var i = popToKeep; i < oldNetworks.length - newPop; i++) {
		let netA = getWeightedNetwork(oldNetworks, cumTotal);
		let netB = getWeightedNetwork(oldNetworks, cumTotal);

		newNetworks[i] = netA.combineNetworks(netB);
	}

	// Breed new networks
	for (var i = oldNetworks.length - newPop; i < oldNetworks.length; i++) {
		newNetworks[i] = new NeuralNetwork(17, 4);
		newNetworks[i].neuralNetwork.randomizeNetwork(numHiddenLayers, hiddenNodes);
	}

	return newNetworks;
}

function getWeightedNetwork(networks, cumTotal) {
	let random = Math.floor(Math.random() * (cumTotal + 1));

	for (var j = 0; j < networks.length; j++) {
		random -= networks[j].gameManager.score;

		if (random <= 0){
			return oldNetworks[j].neuralNetwork;
		}
	}
}

// Class to contain a single instance of a neural network and game
function NetworkInstance(network) {
	this.gameFinished = false;
	this.gameManager = new GameManager2048(numColumns, numRows);

	this.numIllegalMoves = 0;
	if (!network){
		this.neuralNetwork = new NeuralNetwork(17, 4);
		this.neuralNetwork.randomizeNetwork(numHiddenLayers, hiddenNodes);
	} else {
		this.neuralNetwork = network;
	}

	this.gameManager.startNewGame();
}

NetworkInstance.prototype.nextMove = function() {
	let min = 100;
	let max = 0;

	for (var x = 0; x < this.gameManager.numColumns; x++) {
		for (var y = 0; y < this.gameManager.numRows; y++) {
			var val = this.gameManager.grid[x][y];

			if (val > max)
				max = val;

			if (val < min) 
				min = val;
		}
	}

	for (var x = 0; x < this.gameManager.numColumns; x++) {
		for (var y = 0; y < this.gameManager.numRows; y++) {
			var val = this.gameManager.grid[x][y];
			var index = (x * this.gameManager.numColumns) + y;

			this.neuralNetwork.setInput(index, val / (max - min));
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

	for (var i = 0; i < 4; i++) {
		switch(networkIndex) {
			case 0: movedTiles = this.gameManager.moveLeft(); break;
			case 1: movedTiles = this.gameManager.moveRight(); break;
			case 2: movedTiles = this.gameManager.moveDown(); break;
			case 3: movedTiles = this.gameManager.moveUp(); break;
			default: console.log("Error"); break;
		}
		if (movedTiles == 0){
			networkIndex = (networkIndex + 1) % 4;
		}
		else
			break;
	}


	if (movedTiles == 0) {
		this.numIllegalMoves++;
	} else {
		this.numIllegalMoves = 0;
	}

	if (this.numIllegalMoves > 10) {
		this.gameManager.onGameOver();
	}
}