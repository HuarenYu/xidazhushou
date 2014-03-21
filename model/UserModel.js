var DBTemplate = require('./DBTemplate');

exports.isValid = function(user, fn) {
    DBTemplate.query('select u.id,u.name,u.password,s.id as sid,s.name as sname '
                   + 'from t_user as u left join t_shop as s on u.id=s.owner_id '
                   + 'where u.name=? and u.password=?',
                     [user.name, user.password],
        function(error, rows) {
            if (error) {
                fn(error);
                return;
            }
            var u = rows.length < 1 ? null : {id:rows[0]['id'], name:rows[0]['name'],
                password:rows[0]['password'], shop: {id: rows[0]['sid'], name: rows[0]['sname']}};
            fn(null, u);
    });
};

exports.updatePassword = function(params, fn) {
    DBTemplate.query('update t_user set password=? where id=?', [params.pwd, params.id], 
    	function(error, rows) {
    		if (error) {
    			fn(error);
    			return;
    		}
    		fn(null, rows);
    });
};