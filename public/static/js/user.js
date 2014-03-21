$(function() {
    /////////////隐藏微信底部栏
    document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
        WeixinJSBridge.call('hideToolbar');
    });
    /////////////检查临时id//////////////
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
    ////////////弹出菜单//////////////////////
    $('#menu').click(function(e) {
        $(this).parent('.dropdown').toggleClass('open');
        e.stopPropagation();
    });
    $(document).click(function(e) {
        $('.dropdown').removeClass('open');
    });
    ///////////加载订单//////////////////////
    var page = 1,
        pageSize = 5,
        loading = false,
        loadFinish = false;
    function loadItem(p, s) {
        loding = true;
        $.post('/order/listByUser', {page:p, size:s, uid: getCookie('uid')}, function(data, status) {
            if (status === 'success') {
                if (data.length < 1) {
                    loadFinish = true;
                    $('.finish').text('暂无更多');
                    return;
                }
                
                for (var i = 0; i < data.length; i++) {
                    var date = new Date(data[i].create_time);
                    var dateStr = date.getFullYear() + '-' 
                                + (date.getMonth()+ 1) + '-'
                                + date.getDate() + ' '
                                + date.getHours() + ':';
                    if (date.getMinutes() < 10) {
                        dateStr += '0' + date.getMinutes();
                    } else {
                        dateStr += date.getMinutes();
                    }
                    var tmp = '<div class="order">'+
                                '<fieldset class="order-set">'+
                                '<legend>' + dateStr + '</legend>';
                    for (var j = 0; j < data[i].items.length; j++) {
                        tmp += '<div class="order-item">'+
                                data[i].items[j].item_name+' '+data[i].items[j].item_price+'元/份 '+
                                data[i].items[j].number+'份'+
                                '</div>';
                    }
                    tmp += '<div class="order-item">'+
                            ' <span class="item-title">商家：</span>'+data[i].sname+
                            ' <span class="item-title">联系电话：</span>'+data[i].mobilephone+
                            '</div>'+
                            '<div class="order-item">'+
                            ' <span class="item-title">合计：</span>'+data[i].total_cost+'元'+
                            ' <span class="item-title">状态：</span>已通知商家'+
                            '</div>'+
                            '</fieldset>'+
                            '</div>'
                    $('#orders').append(tmp);

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

    function format(str, list) {
        return str.replace(/{{(\d+)}}/g, function(match, number) { 
          return typeof list[number] != 'undefined'
            ? list[number]
            : match;
        });
    }
    
});
