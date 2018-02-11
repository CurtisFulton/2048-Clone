var networks;

var numNetworks = 1000;
var numHiddenLayers = 2;
var hiddenNodes = 20;

var intervalID = 0;
var delayBetweenMoves = 0;

var gamesToPlay = 10;
var genCount = 0;
var gameNum = 0;
var avg = 0;

var seeds = [];

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

	for (var i = 0; i < gamesToPlay; i++) {
		seeds.push(Math.random() * 10000);
	}

	for (var i = 0; i < networks.length; i++) {
		networks[i] = new NetworkInstance(null, seeds[0]);
	}
	gameManager = networks[0].gameManager;
	redrawTiles(fgContext);

	networks.forEach(function(network) {
		network.gameManager.onGameOver = function() {
			network.gameFinished = true;
		}
	});

	//intervalID = setInterval(trainingLoop, delayBetweenMoves);
	trainingLoop();
});

function trainingLoop() {
	var gamesStillRunning = 0;
	var bestNetwork = 0;

	for (var i = 0; i < networks.length; i++) {
		if (!networks[i].gameFinished){
			if (networks[i].gameManager.score > networks[bestNetwork].gameManager.score && networks[bestNetwork].gameFinished)
				bestNetwork = i;

			networks[i].nextMove();
			gamesStillRunning++;
		}
	}
			delayBetweenMoves = 0;

	gameManager = networks[bestNetwork].gameManager;


	if (gamesStillRunning == 0) {
		if (gameNum < gamesToPlay){
			gameNum++;
			seed = Math.random() * 10000;//seeds[gameNum];
			for (var i = 0; i < networks.length; i++) {
				networks[i].scores.push(networks[i].gameManager.score);
				networks[i].gameManager.startNewGame(seed);
				networks[i].gameFinished = false;
			}
		} else {

			gameNum = 0;
			avg = 0;


			for (var i = 0; i < networks.length; i++) {
				networks[i].gameManager.score = networks[i].scores.reduce((sum, x) => sum + x) / gamesToPlay;

				avg += networks[i].gameManager.score;
				if (networks[i].gameManager.score > gameManager.score) {
					gameManager = networks[i].gameManager;
				}
			}

			document.getElementById('current-high-score').innerHTML = gameManager.score;

			avg /= networks.length;

			chart.options.data[0].dataPoints.push({y : avg});
			chart.options.data[1].dataPoints.push({y : gameManager.score});

			chart.render();
			genCount++;
			let newNetworks = createNewGeneration(networks, Math.ceil(networks.length / 4), Math.ceil(networks.length / 8));

			for (var i = 0; i < newNetworks.length; i++) {
				newNetworks[i] = new NetworkInstance(newNetworks[i], seeds[0]);
			}

			networks = newNetworks;

			networks.forEach(function(network) {
				network.gameManager.onGameOver = function() {
					network.gameFinished = true;
				}
			});
			gameManager = networks[0].gameManager;

			redrawTiles(fgContext);
			delayBetweenMoves = 0;
		}
	}

	document.getElementById('gen-num').innerHTML = genCount;
	document.getElementById('game-num').innerHTML = gameNum;
	document.getElementById('pev-avg').innerHTML = avg;
  	redrawTiles(fgContext);

  	window.setTimeout(trainingLoop, delayBetweenMoves);
};

function createNewGeneration(oldNetworks, popToKeep, newPop) {
	oldNetworks = oldNetworks.sort((a, b) => {
		if (a.gameManager.score < b.gameManager.score)
			return 1;

		if (a.gameManager.score > b.gameManager.score)
			return -1;

		return 0;
	});

	let newNetworks = new Array(oldNetworks.length);
	let cumTotal = 0;

	for (var i = 0; i < oldNetworks.length; i++) {
		cumTotal += oldNetworks[i].gameManager.score;
	}

	for (var i = 0; i < popToKeep; i++) {
		newNetworks[i] = oldNetworks[i].neuralNetwork;
	}

	for (var i = popToKeep; i < popToKeep + newPop; i++) {
		newNetworks[i] = new NeuralNetwork(16, 4);
		newNetworks[i].randomizeNetwork(numHiddenLayers, hiddenNodes);
	}

	// Breed new networks
	for (var i = popToKeep + newPop; i < newNetworks.length; i++) {
		var netAIndex = Math.floor(Math.random() * (popToKeep));
		let netA = newNetworks[netAIndex];
		let netB = getWeightedNetwork(oldNetworks, cumTotal);

		if (Math.random() < 0.5) 
			newNetworks[i] = netA.combineNetworks(netB, 0.1); 
		else
			newNetworks[i] = netB.combineNetworks(netA, 0.1); 
	}

	

	return newNetworks;
}

function getWeightedNetwork(networks, cumTotal) {
	let random = Math.floor(Math.random() * (cumTotal + 1));

	for (var j = 0; j < networks.length; j++) {
		random -= networks[j].gameManager.score;

		if (random <= 0){
			return networks[j].neuralNetwork;
		}
	}
}

// Class to contain a single instance of a neural network and game
function NetworkInstance(network, seed) {
	this.gameFinished = false;
	this.gameManager = new GameManager2048(numColumns, numRows, seed);
	this.scores = [];

	this.numIllegalMoves = 0;
	if (!network || network == null){
		this.neuralNetwork = new NeuralNetwork(16, 4);
		this.neuralNetwork.randomizeNetwork(numHiddenLayers, hiddenNodes);
	} else {
		this.neuralNetwork = network;
	}

	this.gameManager.startNewGame();
}

NetworkInstance.prototype.nextMove = function() {
	let max = 0;

	for (var x = 0; x < this.gameManager.numColumns; x++) {
		for (var y = 0; y < this.gameManager.numRows; y++) {
			var val = this.gameManager.grid[x][y];

			if (val > max)
				max = val;
		}
	}

	for (var x = 0; x < this.gameManager.numColumns; x++) {
		for (var y = 0; y < this.gameManager.numRows; y++) {
			var val = this.gameManager.grid[x][y];
			var index = (x * this.gameManager.numColumns) + y;

			this.neuralNetwork.setInput(index, val / max);
		}
	}

	//this.neuralNetwork.setInput(this.neuralNetwork.input.length - 1, this.numIllegalMoves);
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