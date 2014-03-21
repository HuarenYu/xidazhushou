var fs = require('fs'); 
var filePath = __dirname + '/city.txt';
var citys = {};
var cityStr = fs.readFileSync(filePath).toString();
cityStr = cityStr.replace(/\r/g,'');
var cityList = cityStr.split('\n');
cityList.forEach(function(item, index) {
	if (item) {
		var tmp = item.split('=');
		citys[tmp[1]] = tmp[0];
	}
});
module.exports = citys;