var sockjs  = require('sockjs');
var sockjs_opts = {sockjs_url: 'http://cdn.sockjs.org/sockjs-0.3.min.js'};
var users = {};
var sockjs = sockjs.createServer(sockjs_opts);

sockjs.on('connection', function(conn) {
	
	conn.on('data', function(data) {
		var jdata = JSON.parse(data);
		switch (jdata.action) {
		case 'register':
			conn.uid = jdata.id;
			users[jdata.id] = conn;
			break;
		default:
			break;
		}
		
	});
	
	conn.on('close', function() {
		delete users[conn.uid];
	});
	
});

exports.createWSServer = function(http) {
	sockjs.installHandlers(http, {prefix:'/message'});
	return sockjs;
};

exports.send = function(uid, data) {
	if (users[uid]) {
		users[uid].write(data);
	}
};

exports.WSServer = sockjs;