$(function() {
	/////////////隐藏微信底部栏///////////
  	document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
  		WeixinJSBridge.call('hideToolbar');
  	});
	/////////////检查用户id//////////////
	if (!getCookie('uid')) {
		$.get('/user/genTmpId', function(data, status) {
			if (status === 'success') {
				setCookie('uid', data.tmpId, 365, '/');
			}
		});
	}
	/////////////cookie操纵函数///////////
	function setCookie(c_name,value,expiredays,path)
	{
		var exdate=new Date()
		exdate.setDate(exdate.getDate()+expiredays)
		document.cookie=c_name+ "=" +escape(value)+
		((expiredays==null) ? "" : ";expires="+exdate.toGMTString()) +
		((path==null) ? "" : ";path="+path)
	}
	function getCookie(c_name)
	{
		if (document.cookie.length>0)
		  {
		  c_start=document.cookie.indexOf(c_name + "=")
		  if (c_start!=-1)
		    { 
		    c_start=c_start + c_name.length+1 
		    c_end=document.cookie.indexOf(";",c_start)
		    if (c_end==-1) c_end=document.cookie.length
		    return unescape(document.cookie.substring(c_start,c_end))
		    } 
		  }
		return ""
	}
	////////////购物车////////////////////////
	function showCart() {
		var sitems = getCookie('sitems');
		if (sitems) {
			var tmp = sitems.split(',');
			$('.pay-number').text(tmp.length);
			$('.pay-notic').show();
		}
	}
	function clearCart() {
		setCookie('sitems', '', -365, '/');
		$('.pay-notic').hide();
	}
	showCart();
	$('#clearSitems').click(function(e) {
		clearCart();
	});
	$('#goPay').click(function(e) {
		window.location.href = '/order/add?sitems=' + getCookie('sitems');
	});
	////////////弹出菜单//////////////////////
	$('#menu').click(function(e) {
		$(this).parent('.dropdown').toggleClass('open');
		e.stopPropagation();
	});
	$(document).click(function(e) {
		$('.dropdown').removeClass('open');
	});
	//////////商家加载/////////////////////
	var page = 1,
		pageSize = 5,
		loading = false,
		loadFinish = false;
	function loadItem(p, s) {
		loding = true;
		$.post('/shop/list', {page:p, size:s}, function(data, status) {
			if (status === 'success') {
				if (data.length < 1) {
					loadFinish = true;
					$('.finish').text('暂无更多');
					return;
				}
				for (var i = 0; i < data.length; i++) {
					var tmp = format(template, 
						[data[i].img, data[i].name, data[i].description,
						 data[i].address, data[i].send_time,
						 data[i].id, data[i].name]);
					$('#items').append(tmp);
				}
				++page;
				if ($(document.body).height() < $(window).height() && !loadFinish) {
					loadItem(page, 5);
				}
			} else {
				alert('网络加载失败！');
			}
			loading = false;
		});
	}
	//初始加载
	loadItem(page, 5);
	///////////滑动到底部加载////////////////
	$(window).scroll(function(){
	var scrollTop = $(this).scrollTop();
	var scrollHeight = $(document).height();
	var windowHeight = $(this).height();
	if(scrollTop + windowHeight === scrollHeight && !loading && !loadFinish) {
		loadItem(page, 5);
	}
	});
	var template ='<div class="item clearfix">'
        +'<div class="item-img">'
          +'<img src="/static/image/{{0}}" alt="商家图片">'
        +'</div>'
        +'<div class="item-info">'
          +'<div class="item-name">{{1}}</div>'
          +'<div class="item-description">简介：{{2}}</div>'
          +'<div class="item-description">地址：{{3}}</div>'
          +'<div class="item-time">送货时间：<span>{{4}}</span></div>'
          +'<div class="item-operation">'
              +'<a class="btn" href="/shop/menu/{{5}}/{{6}}">他的菜单</button>'
          +'</div></div></div>';
	function format(str, list) {
	    return str.replace(/{{(\d+)}}/g, function(match, number) { 
	      return typeof list[number] != 'undefined'
	        ? list[number]
	        : match;
	    });
  	}
});