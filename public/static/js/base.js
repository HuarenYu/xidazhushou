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
	////////////添加商品到购物车///////////////////////////////
	$('button[data-target=order]').live('tap click', function(e) {
		//获取选中的ID
		var sitems = getCookie('sitems');
		if (sitems) {
			sitems += ',' + $(this).data('item').itemId;
			setCookie('sitems', sitems, 1, '/');
		} else {
			sitems += $(this).data('item').itemId;
			setCookie('sitems', sitems, 1, '/');
		}
		showCart();
	});

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
	//////////end//////////////////////////////
	
	/////////////确认提交订单//////////////////
	$('button[data-target=insue]').on('tap click', function(e) {
		orderForm.submit();
	});
	////////////弹出菜单//////////////////////
	$('#menu').click(function(e) {
		$(this).parent('.dropdown').toggleClass('open');
		e.stopPropagation();
	});
	$(document).click(function(e) {
		$('.dropdown').removeClass('open');
	});
	//////////商品加载/////////////////////
	var page = 1,
		pageSize = 10,
		loading = false,
		loadFinish = false;
	function loadItem(p, s) {
		loding = true;
		$.post('/item/list', {page:p, size:s, category: category}, function(data, status) {
			if (status === 'success') {
				if (data.length < 1) {
					loadFinish = true;
					$('.finish').text('暂无更多');
					return;
				}
				for (var i = 0; i < data.length; i++) {
					var tmp = format(template, 
						[data[i].name, data[i].price, data[i].sname,data[i].id]);
					$('#itemList').append(tmp);
				}
				++page;
				var visibbleHeight = document.documentElement.clientHeight;
				if ($(document.body).height() <= visibbleHeight && !loadFinish) {
					loadItem(page, pageSize);
				}
			} else {
				alert('网络加载失败！');
			}
			loading = false;
		});
	}
	//初始加载
	loadItem(page, pageSize);
	///////////滑动到底部加载////////////////
	$(window).scroll(function(){
		var scrollTop = $(this).scrollTop();
		var scrollHeight = $(document).height();
		var windowHeight = $(this).height();
		if(scrollTop + windowHeight === scrollHeight && !loading && !loadFinish) {
			loadItem(page, pageSize);
		}
	});
	/*
	var template ='<div class="item clearfix">'
        +'<div class="item-img">'
          +'<img src="/static/image/{{0}}" alt="商品图片">'
        +'</div>'
        +'<div class="item-info">'
          +'<div class="item-name">{{1}}</div>'
          +'<div class="item-price">售价：<span>{{2}}元</span></div>'
          +'<div class="item-description">商家：{{3}}</div>'
          +'<div class="item-time">发货时间：<span>{{4}}</span></div>'
          +'<div class="item-operation">'
              +'<button class="btn" data-target="order" data-item=\'{"itemId":{{5}}}\'>添加</button>'
          +'</div></div></div>';
	*/
	var template = '<tr>'+
		              '<td>{{0}}</td>'+
		              '<td>{{1}}元</td>'+
		              '<td>{{2}}</td>'+
		              '<td><button class="btn btn-small" data-target="order" data-item=\'{"itemId":{{3}}}\'>添加</button></td>'+
		            '</tr>';
	function format(str, list) {
	    return str.replace(/{{(\d+)}}/g, function(match, number) { 
	      return typeof list[number] != 'undefined'
	        ? list[number]
	        : match;
	    });
  	}
});