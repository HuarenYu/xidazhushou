var os = require('os'),
	util = require('util'),
	fs = require('fs'),
	path = require('path'),
	moment = require('moment');


var logWriteStream = fs.createWriteStream(path.join(__dirname, 
	'../log/log.txt'), {flags : 'a',mode : '0666'});

var log = new console.Console(logWriteStream);

exports.info = function(info) {
	log.log(format(info));
};

exports.error = function(error) {
	log.error(format(error));
};

/**
 * 异常信息格式化
 * @param {obj}     error Error
 * @return {String}       异常信息
 */
function format(error) {
	var outpuStr = '';
	if (!error) {
		return outpuStr;
	}
	var date = moment(),
		time = date.format('YYYY-MM-DD HH:mm:ss.SSS');
	if (error instanceof Error) {
		outputStr = util.format('Time: %s\nHost: %s\nMessage: %s\n%s', time, os.hostname(), error.message, error.stack);
	} else {
		outputStr = time + ': ' + error + '\n';
	}
	return outputStr;
}