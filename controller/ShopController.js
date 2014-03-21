var shop = require('../model/ShopModel'),
	item = require('../model/ItemModel'),
	log  = require('../lib/log');

module.exports = function(server) {
	
	server.get('/shop/list', function(req, res) {
		if (!req.cookies.uid) {
            res.cookie('uid', req.query.uid, {maxAge: 1000*60*60*24*365});
        }
		res.render('shop');
	});
	
	server.post('/shop/list', function(req, res) {
		shop.listByPage({page:req.body.page, size:req.body.size}, function(error, shops) {
			if (error) {
				log.error(error);
				res.json({msg: {type: 'error', info: '获取商家失败，请稍后再试！'}});
				return;
			}
			res.json(shops);
		});
	});
	
	server.get('/shop/menu/:sid/:sname', function(req, res) {
		res.render('shopMenu', {sid:req.params.sid, sname:req.params.sname});
	});
	
	server.post('/shop/menu/:sid', function(req, res) {
		item.listShopMenu({page:req.body.page, size:req.body.size, sid: req.params.sid},
		function(error, items) {
			if (error) {
				log.error(error);
				res.json({msg: {type: 'error', info: '获取商家失败，请稍后再试！'}});
				return;
			}
			res.json(items);
		});
	});
	
};

