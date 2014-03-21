var http = require('http'),
	express = require('express'),
	ejs = require('ejs'),
    config = require('../config/config'),
    fs = require('fs'),
    path = require('path'),
    log = require('./log'),
    productionErrorHandler = require('./productionErrorHandler'),
    message = require('./message');

/**
 * 应用程序对象构造函数
 * @return {null} null
 */
var application = function() {
	this.config = config;
	this.server = express();
	this.http = http.createServer(this.server);
	message.createWSServer(this.http);
};
/**
 * 加载控制器
 * @return {null} null
 */
application.prototype.__loadController = function() {
	var controllerDir = path.join(__dirname, '../controller/'),
		controllers = fs.readdirSync(controllerDir);
	for (var i = 0; i < controllers.length; i++) {
		require(path.join(controllerDir, controllers[i]))(this.server);
	}
};
/**
 * 应用程序初始化
 * @return {null} null
 */
application.prototype.__boot = function() {
	var application = this;
	this.server.use(function(req, res, next){
		req.application = application;
		next();
	});
	this.server.set('env', process.NODE_ENV || this.config['environment']);
	this.server.use(express.logger('dev'));
	this.server.use(express.compress());
	this.server.engine('.html', ejs.__express);
	this.server.set('views', path.join(__dirname, '../view'));
	this.server.set('view engine', 'html');
	this.server.use(express.cookieParser('letumeishi'));
	this.server.use(express.session());
	this.server.use(express.bodyParser());
	this.server.use(express.methodOverride());
	this.server.use(this.server.router);
	this.server.use(express.static(path.join(__dirname, '../public')));
	if ('development' == this.server.get('env')) {
		this.server.enable('verbose errors');
	  	this.server.use(express.errorHandler());
	} else {
		this.server.use(productionErrorHandler);
	}
	require('./ejsFilters')(ejs);
	this.__loadController();
};
/**
 * 启动应用程序
 * @return {null} null
 */
application.prototype.start = function() {
	this.__boot();
	this.http.listen(80);
	console.log('application started on port:80');
};

module.exports = application;