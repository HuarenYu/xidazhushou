var wechat = require('wechat'),
	express = require('express'),
	request = require('request'),
	log = require('../lib/log'),
	citys = require('../lib/cityparser');

var helpInfo = 	'欢迎关注西大助手，西大小兔为你提供以下功能：\n' +
				'1.回复“菜单”叫外卖\n' +
				'2.回复“快递”查物流\n' +
				'3.回复“翻译”中英互译\n' +
				'4.回复“笑话”查看笑话\n' +
				'5.回复“火车”看时刻表\n' +
				'6.回复“星座”看运势\n' +
				'7.回复“电脑”免费维修电脑\n' +
				'8.回复“天气”查询天气\n' +
				'9.回复任意内容可以和我聊天\n' +
				'如果忘了，回复“帮助”可以看到以上说明；西大小兔等你来玩转。';

module.exports = function(app) {
	app.use(express.query());
	app.use('/wechat', wechat('fourblock', function (req, res, next) {
	  var message = req.weixin;
	  if (message.MsgType === 'event' && message.Event === 'subscribe') {
		res.reply({
			type: 'text',
			content: helpInfo
		});  
	  } else if (message.MsgType === 'text' && message.Content === '帮助') {
		  res.reply({
				type: 'text',
				content: helpInfo
			});
	  } else if (message.MsgType === 'text' && message.Content === '菜单' || message.Content === '1') {
		  res.reply([
		             {
		            	 title: '西大小兔为你准备了丰富的美食',
		            	 description: '点击图片进入菜单页面',
		            	 picurl: 'http://115.29.233.65/static/image/food.png',
		            	 url: 'http://115.29.233.65/shop/list?uid=' + message.FromUserName
		             }
		 ]);
	  } else if (message.MsgType === 'text' && message.Content === '电脑' || message.Content === '7') {
		  res.reply({type: 'text', content: '------技术宅1------\n联系电话:18996231352\nQQ:1340814358\n'+
			  								'------技术宅2------\n联系电话:13650538469\nQQ:1245026147'});
	  } else if (message.MsgType === 'text' && message.Content === '星座' || message.Content === '6') {
		  res.reply({type: 'text', content: '请直接回复星座名例如：狮子座'});
	  } else if (message.MsgType === 'text' && message.Content === '天气' || message.Content === '8') {
		  res.reply({type: 'text', content: '天气查询请回复天气加地名例如：天气北碚'});
	  } else if (message.MsgType === 'text' && /^天气.+$/.test(message.Content)) {
		  var city = message.Content.substring(message.Content.indexOf('气') + 1);
		  if (citys[city]) {
			  request({
				  url: 'http://www.weather.com.cn/data/cityinfo/' + citys[city] + '.html',
				  method: 'get'
			  }, function(err, response, body) {
				  if (err) {
					  res.reply({type: 'text', content: '天气查询失败，请稍后重试！'}); 
				  } else {
					  var cityWeather = JSON.parse(body);
					  res.reply({type: 'text', content: 
						  cityWeather.weatherinfo.city + '\n' +
						  cityWeather.weatherinfo.weather + ' ' +
						  cityWeather.weatherinfo.temp1 + '~' + cityWeather.weatherinfo.temp2});
				  }
			  });
		  } else {
			  res.reply({type: 'text', content: '你查询的城市不存在！'});
		  }
	  } else {
		  if (message.Content === '2') {
			  message.Content = '快递';
		  } else if (message.Content === '3') {
			  message.Content = '翻译';
		  } else if (message.Content === '4') {
			  message.Content = '笑话';
		  } else if (message.Content === '5') {
			  message.Content = '火车';
		  } else if (message.Content === '6') {
			  message.Content = '星座';
		  }
		  request({url: 'http://www.xiaohuangji.com/ajax.php',
		        method: 'post',
		        form: {para: message.Content}}, function(err, response, body) {
			    if (err) {
			    	log.error(err);
			    	res.reply({type: 'text', content: '靠！调戏我的小伙伴太多了无法及时回复你请重试。'});
			    	return;
			    }
			    res.reply({type: 'text', content: body});
		  });
	  }
	}));
};