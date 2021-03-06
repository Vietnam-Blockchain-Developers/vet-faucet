module.exports = function(app) {
	let getConfig = app.getConfig;
	let Web3 = app.Web3;
	let generateErrorResponse = app.generateErrorResponse;

	app.configureWeb3 = configureWeb3;
	app.getTxCallBack = getTxCallBack;

	function configureWeb3(config, cb) {
		let web3;
		if (typeof web3 !== 'undefined') web3 = new Web3(web3.currentProvider);
		else web3 = new Web3(new Web3.providers.HttpProvider(config.Ethereum[config.environment].rpcLocal));

		if (!web3.isConnected()) return cb({code: 500, title: 'Error', message: 'check RPC'}, web3);

		cb(null, web3);
	}

	function getTxCallBack(txHash, response) {
		getConfig(function(config) {
			getConfigResponse(config, txHash, response);
		});
	};

	function getConfigResponse(config, txHash, response) {
		configureWeb3(config, function(err, web3) {
			configureWeb3Response(err, web3, txHash, response);
		});
	}

	function configureWeb3Response(err, web3, txHash, response) {
		if (err) return generateErrorResponse(response, err);

		web3.eth.getTransaction(txHash, function(err, txDetails) {
			getTransactionResponse(err, txDetails, response);
		});
	}

	function getTransactionResponse(err, txDetails, response) {
	    if (err) return generateErrorResponse(response, err);
	    if (!txDetails.blockNumber) return generateErrorResponse(response, {code: 500, title: 'Warning', message: 'Tx is not signed yet'});

	    response.send({
    		code: 200,
    		title: 'Success',
    		message: config.Ethereum.etherToTransfer + ' ETH successfully sent',
    	});
	}
};
