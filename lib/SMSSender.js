var request = require('request'),
	order = require('../model/OrderModel'),
	log = require('./log');

exports.send = function(message) {
	request({
		url: 'http://yunpian.com/v1/sms/tpl_send.json',
		method: 'post',
		form: {apikey:'aaf92e4e9bb22a8f3d3cc526741b4895', 
			mobile:message.mobile, tpl_id:'316963', tpl_value:message.content}
		},
		function(err, response, body) {
			var reply;
			if (err) {
				reply = 'network error.';
			} else {
				reply = body;
			}
			order.addSMSState({reply: reply, id: message.orderId}, function(error, rows) {
				if (error) {
					log.error(error);
				}
			});
		}
	);
};