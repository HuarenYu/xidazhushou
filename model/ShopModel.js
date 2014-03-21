var DBTemplate = require('./DBTemplate');

exports.findById = function(id, fn) {
	DBTemplate.query('select * from t_shop where id=?', [id], function(error, rows) {
		if (error) {
			fn(error);
			return;
		}
		fn(null, rows);
	});
};

exports.update = function(shop, fn) {
	DBTemplate.query('update t_shop ' +
			       	 'set name=?,description=?,address=?,telephone=?,mobilephone=? where id=?',
			         [shop.name, shop.description, shop.address, 
			          shop.telephone, shop.mobilephone, shop.id], 
	function(error, rows) {
		if (error) {
			fn(error);
			return;
		}
		fn(null, rows);
	});
};

exports.listByPage = function(options, fn) {
	var sql = 'select * from t_shop where state=\'online\' limit ' + ((options.page - 1)*options.size) + ',' + options.size;
	DBTemplate.query(sql, [], function(error, rows) {
		if (error) {
			fn(error);
			return;
		}
		fn(null, rows);
	});
};