var DBTemplate = require('./DBTemplate'),
	util = require('util'),
	async = require('async'),
	log = require('../lib/log'),
	message = require('../lib/message'),
	SMSSender = require('../lib/SMSSender');

exports.listByShop = function(options, fn) {
	var sql = 'select o.* from t_order as o '
            + 'where o.shop_id=? ';
	var params = [options.shop.id];
	if (options.query.date) {
		sql += 'and DATE(o.create_time)=? ';
		params.push(options.query.date);
	}
	if (options.query.state) {
		sql += 'and o.state=? ';
		params.push(options.query.state);
	}
	sql += 'order by o.id desc';
    DBTemplate.query(sql, params, function(error, orders) {
    	if (error) {
            fn(error);
            return;
        }
    	///查询订单对应的商品
		async.every(orders, queryItem, function(result) {
			if (result) {
				fn(null, orders);
			} else {
				fn(new Error('获取订单商品失败！'));
			}
		});
		function queryItem(order, callback) {
			DBTemplate.query('select * from t_order_item where order_id=?', [order.id], function(error, items) {
				if (error) {
					log.error(error);
					callback(false);
				} else {
					order.items = items;
					callback(true);
				}
			});
		}

    });
};

exports.send = function(id, fn) {
	DBTemplate.query('update t_order set state=\'完成\' where id=?', [id], function(error, rows){
		if (error) {
            fn(error);
            return;
        }
        fn(null, rows);
	});
};

exports.add = function(order, fn) {
	//拆分订单
	var shops = {};
	order.items.forEach(function(item, index) {
		if (shops[item.sid]) {
			shops[item.sid].items.push(item);
		} else {
			shops[item.sid] = {};
			shops[item.sid].items = [];
			shops[item.sid].items.push(item);
		}
	});
	
	for (var key in shops) {
		if (!util.isArray(shops[key].items)) {
			continue;
		}
		callback(key);
	}
	
	
	
	function callback(key) {
		DBTemplate.getConnection(function(error, connection) {
			if (error) {
	            fn(error);
	            return;
	        }
			connection.beginTransaction(function(error) {
				if (error) {
		            fn(error);
		            return;
		        }
				var totalPrice = 0;
				shops[key].items.forEach(function(item, index) {
	        		totalPrice += item.price * item.number;
	        	});
				shops[key].totalPrice = totalPrice;
				if (!order.comment) {
					order.comment = '无';
				}
				connection.query('insert into t_order values(null,?,?,?,?,?,?,?,?,?,?,null)',
						[order.comment, order.state, order.dstime + '-' + order.detime, order.create_time,
						 order.cname, order.caddr, order.cphone, totalPrice,
						 key, order.uid], function(error, newOrder) {
					if (error) {
						connection.rollback(function() {
							fn(error);
				            return;
					    });
			        } else {
			        	var sql = 'insert into t_order_item(order_id,item_id,item_name,item_price,number) values ';
			        	shops[key].items.forEach(function(item, index) {
			        		sql += util.format('(%s,%s,\'%s\',%s,%s),', newOrder.insertId, item.id, item.name,item.price, item.number);
			        	});
			        	sql = sql.substring(0, sql.length - 1);
			        	connection.query(sql, function(error, newOrderItem) {
			        		if (error) {
								connection.rollback(function() {
									fn(error);
						            return;
							    });
					        } else {
					        	connection.commit(function(err) {
					                if (err) {
					                  connection.rollback(function() {
					                	  fn(error);
								          return;
					                  });
					                } else {
					                	//订单提交成功
					                	message.send(key, '{"action": "newOrder", "message": "你有新的订单。"}');
					                	//生成订单通知短信
					                	var smstmp = "#id#=%s&#items#=%s&#name#=%s&#phone#=%s&#address#=%s&#sendTime#=%s";
					                	var orderId = newOrder.insertId;
					                	var name = order.cname;
					                	var phone = order.cphone;
					                	var address = order.caddr;
					                	var comment = order.comment;
					                	var sendTime = order.dstime + '-' + order.detime;
					                	var shopPhone = '';
					                	var smsItems = '';
					                	shops[key].items.forEach(function(item, index) {
					                		if (index === 0) {
					                			shopPhone = item.mobilephone;
					                		}
					                		smsItems += '[' + item.name + item.number +'份' +']';
					                	});
					                	smsItems += '[合计' + shops[key].totalPrice + '元]';
					                	smsItems += '[' + comment + ']';
					                	var smsContent = util.format(smstmp, orderId, smsItems,
					                			name, phone, address, sendTime);
					                	//SMSSender.send({mobile: shopPhone, content: smsContent, orderId: orderId});
					                	fn(null, newOrderItem);
					                }
					            });
					        }
			        	});
			        }
				});
			});
		});
	}

};

exports.listByUser = function(options, fn) {
	var sql = 'select o.id,o.create_time,o.state,o.total_cost,s.mobilephone,' +
			  's.name as sname ' +
			  'from t_order as o ' +
		      'left join t_shop as s on o.shop_id=s.id ' +
	          'where o.user_id=? ' +
			  'order by o.create_time desc limit ' + ((options.page - 1)*options.size) + ',' + options.size;
	DBTemplate.query(sql, [options.uid], function(error, orders) {
		if (error) {
            fn(error);
            return;
        }
		////////查询订单对应的商品
		async.every(orders, queryItem, function(result) {
			if (result) {
				fn(null, orders);
			} else {
				fn(new Error('获取订单商品失败！'));
			}
		});
		function queryItem(order, callback) {
			DBTemplate.query('select * from t_order_item where order_id=?', [order.id], function(error, items) {
				if (error) {
					log.error(error);
					callback(false);
				} else {
					order.items = items;
					callback(true);
				}
			});
		}
		//////////end
	});
};

exports.addSMSState = function(options, fn) {
	DBTemplate.query('update t_order set sms_reply=? where id=?', [options.reply, options.id], function(error, rows){
		if (error) {
            fn(error);
            return;
        }
        fn(null, rows);
	});	
};