function NeuralNetwork(numInputs, numOutputs) {
	this.input = new Array(numInputs);
	this.internalLayers;
	this.weights;

	this.numOutputs = numOutputs;
}

NeuralNetwork.prototype.setInput = function(index, value) {
	this.input[index] = value;
};

NeuralNetwork.prototype.feedForward = function() {
	// Feeds the current input through the network
	var inputs = this.input;

	for (var i = 0; i < this.internalLayers.length; i++) {
		var numNodes = this.internalLayers[i].length
		for (var k = 0; k < numNodes; k++) {
			this.internalLayers[i][k] = this.calcNodeVal(this.weights[i][k], inputs);
		}

		inputs = this.internalLayers[i];
	}
};

NeuralNetwork.prototype.calcNodeVal = function(weights, inputs) {
	var sum = 0;

	for (var i = 0; i < inputs.length; i++) {
		sum += weights[i] * inputs[i];
	}
	// Fast sigmoid
	return sum / (1 + Math.abs(sum));
};

NeuralNetwork.prototype.getOutput = function() {
	// Helper function that returns the last layer's values
	return this.internalLayers[this.internalLayers.length - 1];
};

NeuralNetwork.prototype.randomizeNetwork = function(numHiddenLayers, nodesPerLayer) {
	this.internalLayers = [];
	this.weights = [];

	// First layer uses the Input variable, so it needs to be done separately
	var newLayer = this.createLayer(nodesPerLayer, this.input.length); 
	this.internalLayers.push(newLayer.nodes);
	this.weights.push(newLayer.weights);

	for (i = 1; i < numHiddenLayers; i++) {
		newLayer = this.createLayer(nodesPerLayer, nodesPerLayer); 

		this.internalLayers.push(newLayer.nodes);
		this.weights.push(newLayer.weights);
	}

	// The last layer (output layer) has a different number of nodes in it, so it needs to be done separately
	var newLayer = this.createLayer(this.numOutputs, nodesPerLayer); 
	this.internalLayers.push(newLayer.nodes);
	this.weights.push(newLayer.weights);
};

NeuralNetwork.prototype.createLayer = function(numNodes, numInputs) {
	var nodes = new Array(numNodes);
	var weights = new Array(numNodes);

	for (i = 0; i < numNodes; i++) {
		nodes[i] = 0;

		// Make the weight between -1 and 1
		weights[i] = new Array(numInputs);
		for (k = 0; k < numInputs; k++) {
			var newWeight = (Math.random() - 0.5) * 2;
			weights[i][k] = newWeight;
		}
	}

	return { nodes : nodes, weights: weights };
};

// Assumes both networks are the same size
NeuralNetwork.prototype.combineNetworks = function(networkB, mutationChance) {
	// Use this networks input/output count as blueprint
	let newNet = new NeuralNetwork(this.input.length, this.numOutputs);
	newNet.randomizeNetwork(this.internalLayers.length - 1, this.weights[0].length);

	for (let i = 0; i < this.weights.length; i++) {
		// Makes it so at least 1/4 of each network is included
		let crossOverIndex = Math.floor((Math.random() * (inputCount / 2)) + (inputCount / 4));
		for (let j = 0; j < this.weights[i].length; j++) {
			let inputCount = this.weights[i].length;

			if (k < crossOverIndex)
				newNet.weights[i][j] = this.weights[i][j];
			else
				newNet.weights[i][j] = networkB.weights[i][j];

			// If theres a mutation
			if (Math.random() < mutationChance) {
				newNet.weights[i][j][Math.floor(Math.random() * (newNet.weights[i][j].length + 1))] = (Math.random() - 0.5) * 2;
			} 
		}
	}

	return newNet;
};