var auth   = require('../lib/auth'),
    log    = require('../lib/log'),
    crypto = require('crypto'),
    user   = require('../model/UserModel'),
    fs     = require('fs'),
    path   = require('path'),
    uuid   = require('uuid');

module.exports = function(server) {
    
    server.get('/login', function(req, res) {
        res.render('login');
    });

    server.post('/login', function(req, res) {
        var shasum = crypto.createHash('sha1');
        var password = shasum.update(req.body.password).digest('hex');
        var loginUser = {name:req.body.name, password:password};
        auth.auth(loginUser, function(error, user) {
            if (error) {
            	res.locals.msg = '登录验证失败，请稍后重试！';
                res.render('login');
                throw error;
            }
            if(!user) {
            	res.locals.msg = '用户名或者密码错误，请重试！';
                res.render('login');
            } else {
                req.session.user = user;
                res.redirect('/dealer');
            }
        });
    });

    server.get('/logout', function(req, res) {
        if (req.session.user) {
            delete req.session.user;
        }
        res.redirect('/login');
    });

    server.get('/user/security', auth.isAuth, function(req, res) {
        res.render('dealer/security', {req: req});
    });

    server.post('/user/updatepPassword', auth.isAuth, function(req, res) {
    	var shasum1 = crypto.createHash('sha1');
    	var oldPwd = shasum1.update(req.body.oldPwd).digest('hex');
    	if (oldPwd === req.session.user.password) {
    		if (req.body.newPwd === req.body.renewPwd) {
    			var shasum = crypto.createHash('sha1');
    	        var newPwd = shasum.update(req.body.newPwd).digest('hex');
    	    	user.updatePassword({pwd:newPwd, id:req.session.user.id}, function(error, rows) {
    	    		if (error) {
    	    			log.error(error);
    	                res.json({msg: {type: 'error', info: '修改密码失败，请稍后再试！'}});
    	                return;
    	    		}
    	    		req.session.user.passwrod = newPwd;
    	    		res.json({msg: {type: 'success', info: '修改密码成功。'}});
    	    	});
    		} else {
    			res.json({msg: {type: 'error', info: '您两次输入的新密码不一致。'}});
    		}
    	} else {
    		res.json({msg: {type: 'error', info: '您输入的旧密码不正确。'}});
    	}
    	
    });
    
    server.get('/user/order', function(req, res) {
    	res.render('user/order');
    });
    
    server.get('/user/genTmpId', function(req, res) {
    	res.json({tmpId: uuid.v1()});
    });
    
    server.post('/file/upload', auth.isAuth, function(req, res) {
        if (req.files.files) {
            var image = req.files.files[0];
            fs.readFile(image.path, function(error, data) {
                if (error) {
                	log.error(error);
                    res.json({msg: {type: 'error', info: '图片上传失败，请稍后再试！'}});
                    return;
                }
                var time = new Date();
                var newName = time.getTime() + image.name.substring(image.name.indexOf('.'));
                fs.writeFile(path.join(__dirname, '../public/static/image/' + newName), 
                    data, function(error) {
                    if (error) {
                    	log.error(error);
                        res.json({msg: {type: 'error', info: '图片上传失败，请稍后再试！'}});
                        return;
                    }
                    res.json({msg: {type: 'success', info: '图片上传完成。', newName: newName}});
                });
            });
        }
    });
    
};