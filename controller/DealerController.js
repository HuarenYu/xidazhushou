var auth  = require('../lib/auth'),
    item  = require('../model/ItemModel'),
    log   = require('../lib/log'),
    order = require('../model/OrderModel'),
    shop  = require('../model/ShopModel'),
    moment = require('moment');

module.exports = function(server) {
    
    server.get('/dealer', auth.isAuth, function(req, res) {
        res.redirect('/dealer/manageOrder');
    });

    server.get('/dealer/manageOrder', auth.isAuth, function(req, res) {
    	if (!req.query.date) {
    		req.query.date = moment().format('YYYY-MM-DD');
    	}
    	order.listByShop({shop: req.session.user.shop, query: req.query}, function(error, orderList){
            if (error) {
                log.error(error);
                res.render('error', {url: req.url});
                return;
            }
            res.render('dealer/manageOrder', {orderList: orderList, req: req});
        });
    });
    
    server.get('/dealer/manageItem', auth.isAuth, function(req, res) {
        item.listByShop(req.session.user.shop, function(error, itemList){
            if (error) {
                log.error(error);
                res.render('error', {url: req.url});
                return;
            }
            res.render('dealer/manageItem', {itemList: itemList, req: req});
        });
    });

    server.get('/item/list/c/:category', function(req, res) {
        if (!req.cookies.uid) {
            res.cookie('uid', req.query.uid, {maxAge: 1000*60*60*24*365});
        }
    	res.render('item', {category: req.params.category});
    });
    
    server.post('/item/list', function(req, res) {
    	item.listByPage({page: req.body.page, 
    		size: req.body.size,
    		category: req.body.category}, function(error, itemList) {
			if (error) {
				log.error(error);
				res.json({msg: {type: 'error', info: '获取商品失败，请稍后再试！'}});
				return;
			}
			res.json(itemList);
		});
    });
    
    server.get('/item/detail/:id', function(req, res) {
    	item.get(req.params.id, function(error, item) {
    		if (error) {
                log.error(error);
                res.render('error', {url: req.url});
                return;
            }
            res.render('itemDetail', {item: item});
    	});
    });
    
    server.post('/item/add', auth.isAuth, function(req, res) {
        req.body.item.state = '上架';
        req.body.item.sid = req.session.user.shop.id;
        item.add(req.body.item, function(error, insertId) {
            if (error) {
                log.error(error);
                res.json({msg: {type: 'error', info: '添加商品失败，请稍后再试！'}});
                return;
            }
            res.json({msg: {type: 'success', info: '添加商品成功！'}});
        });
    });

    server.get('/item/remove/:id', auth.isAuth, function(req, res) {
        item.remove(req.params.id, function(error, effectRow) {
        	item.onshelf(req.params.id, function(error, rows) {
            	if (error) {
            		log.error(error);
            		res.json({msg: {type: 'error', info: '删除架商品失败，请稍后重试。'}});
            		return;
            	}
            	res.json({msg: {type: 'success', info: '成功删除商品。'}});
            });
        });
    });

    server.post('/item/update', auth.isAuth, function(req, res) {
    	item.update(req.body.item, function(error, rows) {
    		if (error) {
                log.error(error);
                res.json({msg: {type: 'error', info: '编辑商品失败，请稍后再试！'}});
                return;
            }
            res.json({msg: {type: 'success', info: '编辑商品成功！'}});
    	});
    });

    server.get('/item/onshelf/:id', auth.isAuth, function(req, res) {
        item.onshelf(req.params.id, function(error, rows) {
        	if (error) {
        		log.error(error);
        		res.json({msg: {type: 'error', info: '上架架商品失败，请稍后重试。'}});
        		return;
        	}
        	res.json({msg: {type: 'success', info: '成功上架商品。'}});
        });
    });

    server.get('/item/offshelf/:id', auth.isAuth, function(req, res) {
        item.offshelf(req.params.id, function(error, rows) {
        	if (error) {
        		log.error(error);
        		res.json({msg: {type: 'error', info: '下架商品失败，请稍后重试。'}});
        		return;
        	}
        	res.json({msg: {type: 'success', info: '成功下架商品。'}});
        });
    });

    server.get('/shop/settings', auth.isAuth, function(req, res) {
    	shop.findById(req.session.user.shop.id, function(error, rows) {
    		if (error) {
    			log.error(error);
    			res.render('error', {url: url});
    		} else {
    			res.render('dealer/settings', {shop: rows[0] || {}, req: req});
    		}
    	});
    });

    server.post('/shop/updateSettings', auth.isAuth, function(req, res) {
    	req.body.shop.id = req.session.user.shop.id;
    	shop.update(req.body.shop, function(error, rows) {
    		if (error) {
    			log.error(error);
    			res.json({msg: {type: 'error', info: '修改商店信息出错！请稍后重试。'}});
    		} else {
    			res.json({msg: {type: 'success', info: '修改商店信息成功。'}});
    		}
    	});
    });
    
    server.get('/order/send/:id', auth.isAuth, function(req, res) {
    	order.send(req.params.id, function(error, rows) {
    		if (error) {
    			log.error(error);
    			res.json({msg: {type: 'error', info: '修改订单信息出错！请稍后重试。'}});
    		} else {
    			res.json({msg: {type: 'success', info: '修改订单信息成功。'}});
    		}
    	});
    });
    
    server.get('/order/list', auth.isAuth, function(req, res) {
    	order.listByShop(req.session.user.shop, function(error, orderList){
            if (error) {
                log.error(error);
                res.render('error', {url: req.url});
                return;
            }
            res.json(orderList);
        });
    });
    
    server.post('/order/listByUser', function(req, res) {
    	order.listByUser(req.body, function(error, orderList) {
    		if (error) {
				log.error(error);
				res.json({msg: {type: 'error', info: '获取订单失败，请稍后再试！'}});
				return;
			}
			res.json(orderList);
    	});
    });
    
    server.post('/order/add', function(req, res) {
    	/*
    	res.json({msg: {type: 'success', info: '明天正式开卖，敬请期待！'}});
    	return;
    	*/
    	req.body.order.create_time = new Date();
    	req.body.order.state = '未发货';
    	order.add(req.body.order, function(error, rows) {
    		if (error) {
    			log.error(error);
    			res.json({msg: {type: 'error', info: '提交订单出错！请稍后重试。'}});
    		} else {
    			res.json({msg: {type: 'success', info: '提交订单成功。'}});
    		}
    	});
    });
    
    server.get('/order/add', function(req, res) {
    	item.listByIds(req.query.sitems, function(error, items) {
    		if (error) {
    			log.error(error);
    			res.render('error', {url: req.url});
    		} else {
    			res.render('addOrder', {items: items});
    		}
    	});
    });
    
};
