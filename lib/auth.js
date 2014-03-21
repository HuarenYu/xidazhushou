var userModel = require('../model/UserModel');

exports.auth = function(user, fn) {
	userModel.isValid(user, function(error, user) {
        fn(error, user);
    });
};

exports.isAuth = function(req, res, next) {
    if (req.session.user) {
        next();
    } else {
    	res.locals.msg = '你访问的页面需要登录，请先登录！';
        res.render('login');
    }
};