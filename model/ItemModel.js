var DBTemplate = require('./DBTemplate');

exports.listByShop = function(shop, fn) {
        DBTemplate.query('select i.id,i.name,i.state,i.price,i.description,i.img,i.deliver_time,c.id as cid,c.name as cname from t_item as i '
                       + 'left join t_category as c on i.category_id=c.id '
                       + 'where i.shop_id=? order by i.id desc', [shop.id], function(error, rows) {
            if (error) {
                fn(error);
                return;
            }
            fn(null, rows);
        });
};

exports.add = function(item, fn) {
    DBTemplate.query('insert into t_item values(null,?,?,?,?,?,?,?,?,?)', 
        [item.name, item.state,item.price, item.description, item.deliverTime,
        item.img, new Date(),item.cid, item.sid], function(error, rows) {
            if (error) {
                fn(error);
                return;
            }
            fn(null, rows.insertId);
    });
};

exports.remove = function(id, fn) {
    DBTemplate.query('delete from t_item where id=?', 
        [id], function(error, effectRow) {
            if (error) {
                fn(error);
                return;
            }
            fn(null, effectRow);
    });
};

exports.onshelf = function(id, fn) {
	DBTemplate.query('update t_item set state=\'上架\' where id=?', [id], 
			function(error, rows) {
		if (error) {
			fn(error);
			return;
		}
		fn(null,rows);
	});
};

exports.offshelf = function(id, fn) {
	DBTemplate.query('update t_item set state=\'下架\' where id=?', [id], 
			function(error, rows) {
		if (error) {
			fn(error);
			return;
		}
		fn(null,rows);
	});
};

exports.update = function(item, fn) {
	DBTemplate.query('update t_item set name=?,description=?,price=?,deliver_time=?,img=?,category_id=? where id=?', 
			[item.name, item.description, item.price, item.deliverTime, item.img, item.cid, item.id], 
			function(error, rows) {
		if (error) {
			fn(error);
			return;
		}
		fn(null,rows);
	});
};

exports.listByPage = function(options, fn) {
	var sql = 'select i.id,i.name,i.price,i.description,i.img,i.deliver_time,i.shop_id,s.name as sname from t_item as i '
        + 'left join t_shop as s on i.shop_id=s.id '
        + 'where i.state=\'上架\' ';
	var params = [];
	if (options.category !== 'all') {
		sql += 'and i.category_id=? ';
		params.push(options.category);
	}
	sql += 'order by i.id desc limit ' + ((options.page - 1)*options.size) + ',' + options.size;
	DBTemplate.query(sql, params, function(error, rows) {
		 if (error) {
		     fn(error);
		     return;
		 }
		 fn(null, rows);
	});
};

exports.get = function(id, fn) {
	DBTemplate.query('select * from t_item where id=?', [id], function(error, rows) {
		if (error) {
			fn(error);
			return;
		}
		fn(null, rows);
	});
};

exports.listByIds = function(ids, fn) {
	var sql = 'select i.id,i.name,i.price,s.id as sid,s.name as sname,s.mobilephone,s.send_time ' + 
			  'from t_item as i left join t_shop as s on i.shop_id=s.id ' + 
			  'where i.id in(' + ids + ')';
	DBTemplate.query(sql, [], function(error, rows) {
		if (error) {
			fn(error);
			return;
		}
		fn(null, rows);
	});
};

exports.listShopMenu = function(options, fn) {
	var sql = 'select * from t_item where shop_id=? and state=\'上架\' order by id desc limit ' + ((options.page - 1)*options.size) + ',' + options.size;
	DBTemplate.query(sql, [options.sid], function(error, rows) {
		if (error) {
			fn(error);
			return;
		}
		fn(null, rows);
	});
};