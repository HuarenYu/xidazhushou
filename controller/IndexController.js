
module.exports = function(server) {
    
	server.get('/', function(req, res) {
		res.redirect('/shop/list');
    });
	
	server.get('/about', function(req, res) {
		res.render('about');
	});
	
};