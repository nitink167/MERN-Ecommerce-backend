var braintree = require('braintree');

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: "2wq4v6h2mjy4c4yz",
  publicKey: "836hjqzrdbry8q4y",
  privateKey: "	f5f81be4cb42bb450c864622d5a3d0cf"
});

exports.getToken = (req, res) => {
	gateway.clientToken.generate({}, function (err, response) {
		// var clientToken = response.clientToken
		if(err) {
			res.status(500).send(err)
		} else {
			res.send(response)
		}
	});
}

exports.processPayment = (req, res) => {
	let nonceFromTheClient = req.body.paymentMethodNonce
	let amountFromTheClient = req.body.amount
	gateway.transaction.sale({
		amount: amountFromTheClient,
		paymentMethodNonce: nonceFromTheClient,
		options: {
			submitForSettlement: true
	  	}
	}, function (err, result) {
		if(err) {
			res.status(500).send(error)
		} else {
			res.send(result)
		}
	});
}
