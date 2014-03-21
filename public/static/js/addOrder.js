$(function() {
    /////////////隐藏微信底部/////////////
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
    /////////////模态对话框//////////////
    var Dialog = function(selector) {
        this._init(selector);
    };
    Dialog.prototype = {
        constructor : Dialog,
        _init : function(selector) {
            this.dialogWraper = $(selector);
            this.dialog = this.dialogWraper.children('.dialog');
            this.content = this.dialog.children('.dialog-content');
            this.dialog.on('tap click', '[data-target="cancel"]', $.proxy(function(e) {
                this.hide();
            }, this));
            this.dialog.on('tap click', '[data-target="close"]', $.proxy(function(e) {
                this.hide();
            }, this));
            this.dialogWraper.on('tap click', $.proxy(function(e) {
                if (e.target === this.dialogWraper[0]) this.hide();
            }, this));
        },
        show : function(content) {
            if (content) {
                this.content.text(content);
            }
            this.dialogWraper.show();
            this.resize();
        },
        hide : function() {
            if (this.action && this.action === 'toOrder') {
                window.location.href = '/user/order';
            }
            this.dialogWraper.hide();
        },
        toggle : function() {
            this.dialogWraper.toggle();
        },
        resize : function() {
            var visibleWidth = document.documentElement.clientWidth,
                visibleHeight = document.documentElement.clientHeight,
                height = this.dialog.height(),
                top = visibleHeight > height ? (visibleHeight - height) / 2 : 0,
                left = visibleWidth > 320 ? (visibleWidth - 320) / 2 : 0;
            this.dialog.css({
                top : top,
                left : left
            });
        }
    };
    var dialog = new Dialog('#dialog');
    var infoDialog = new Dialog('#infoDialog');
    /////////////模态对话框end//////////////
    /////////////消息框//////////////////
    var Message = function(selector) {
        this._init(selector);
    };
    Message.prototype = {
        constructor: Message,
        _init: function(selector) {
            this.message = $(selector);
        },
        show: function(content) {
            this.message.show();
            var visibleWidth = document.documentElement.clientWidth,
                visibleHeight = document.documentElement.clientHeight,
                height = this.message.height(),
                top = visibleHeight > height ? (visibleHeight - height) / 2 : 0,
                left = visibleWidth > 160 ? (visibleWidth - 160) / 2 : 0;
            this.message.css({
                top : top,
                left : left
            });
            
        },
        hide: function() {
            this.message.hide();
        },
        toggle: function() {
            this.message.toggle();
        }
    };
    var message = new Message('#message');
    /////////////消息框end///////////////
    ////////////弹出菜单//////////////////////
    $('#menu').click(function(e) {
        $(this).parent('.dropdown').toggleClass('open');
        e.stopPropagation();
    });
    $(document).click(function(e) {
        $('.dropdown').removeClass('open');
    });
    /////////////订单表单处理///////////////
    var OrderForm = function() {
        this._init();
    };
    OrderForm.prototype = {
        constructor: OrderForm,
        _init: function() {
            //初始化信息
            this.order = {items: items};
            this.consumer = $('input[name=consumer]');
            this.consumerPhone = $('input[name=consumerPhone]');
            this.consumerPhone2 = $('input[name=consumerPhone2]');
            this.consumerAddress = $('input[name=consumerAddress]');
            this.deliverSTime = $('select[name=deliverSTime]');
            this.deliverETime = $('select[name=deliverETime]');
            this.comment = $('input[name=comment]');
            this.totalPrice = $('#totalPrice');
        },
        submit:function() {
            this.order.cname = $.trim(this.consumer.val());
            this.order.cphone = $.trim(this.consumerPhone.val());
            this.order.cphone2 = $.trim(this.consumerPhone2.val());
            this.order.caddr = $.trim(this.consumerAddress.val());
            this.order.detime = this.deliverETime.val();
            this.order.dstime = this.deliverSTime.val();
            this.order.comment = $.trim(this.comment.val());
            this.order.uid = getCookie('uid');
            if (this.validate()) {
                message.show();
                setCookie('cname', this.order.cname, 365, '/');
                setCookie('cphone', this.order.cphone, 365, '/');
                setCookie('cphone2', this.order.cphone2, 365, '/');
                setCookie('caddr', this.order.caddr, 365, '/');
                if (this.order.cphone2) {
                    this.order.cphone += ';' + this.order.cphone2;
                }
                $.ajax({
                    url: '/order/add',
                    type: 'post',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    data: '{"order":' + JSON.stringify(this.order) + '}',
                    success: function(data, status) {
                        if (data.msg.type === 'success') {
                            setCookie('sitems', '', -365, '/');
                            message.hide();
                            //infoDialog.action = 'toOrder';
                            infoDialog.show(data.msg.info);
                        } else {
                           message.hide();
                           infoDialog.show('提交订单失败！请稍后重试！');
                        }
                    },
                    error: function(xhr, errorType, error) {
                        message.hide();
                        infoDialog.show('提交订单失败！请稍后重试！');
                    }
                });

            }
        },
        validate:function() {
            if (!this.order.cname) {
                infoDialog.show('收货人不能为空！');
                return false;
            }
            if (!this.order.cphone) {
                infoDialog.show('联系电话不能为空！');
                return false;
            }
            if (!this.order.caddr) {
                infoDialog.show('收货地址不能为空！');
                return false;
            }
            if (this.order.items.length <= 0) {
                infoDialog.show('商品不能为空！');
                return false;
            }
            return true;
        },
        removeItem:function(id) {
            var tmp = this.order.items;
            tmp.forEach(function(item, index) {
                if (item.id === id) {
                    tmp.splice(index, 1);
                }
            });
        },
        calcTotalPrice:function() {
            var tmp = 0;
            this.order.items.forEach(function(item, index) {
                var input = $('input[name="' + item.id + '"]').val();
                if (!isNaN(input)) {
                    item.number = input;
                }
                tmp += item.price * item.number;
            });
            this.order.totalPrice = tmp;
            this.totalPrice.text(tmp);
        }
    };
    var orderForm = new OrderForm();
    $('button[action=delItem]').live('click', function(e) {
        orderForm.removeItem($(this).data('id'));
        orderForm.calcTotalPrice();
        $(this).parent('td').parent('tr').remove();
    });
    $('input').live('keyup', function(e) {
        orderForm.calcTotalPrice();
    });
    $('button[action=submitOrder]').click(function(e) {
        orderForm.submit();
    });
    /////////////订单表单处理end///////////////
    //////////渲染订单商品///////////////////
    var template1 = '<tr><td colspan="5">以下商品由{{0}}发货</td></tr>';
    var template2 = '<tr><td>{{0}}</td>' +
            '<td>{{1}}元</td><td>' +
            '<input type="text" value="1" name="{{2}}" data-role="small"> 份</td>' +
            '<td><button action="delItem" class="btn btn-small" data-id="{{3}}">删除</button></td>';
    var itemGroup = {};
    items.forEach(function(item, index) {
        if (itemGroup[item.sid]) {
            var tmp = format(template2, [item.name, item.price, item.id, item.id]);
            itemGroup[item.sid] += tmp;
        } else {
            itemGroup[item.sid] = '';
            var tmp = format(template1, [item.sname]);
            itemGroup[item.sid] += tmp;
            tmp = format(template2, [item.name, item.price, item.id, item.id]);
            itemGroup[item.sid] += tmp;
        }
    });
    for (var key in itemGroup) {
        if (typeof itemGroup[key] == 'string') {
            $('#itemGroup').append(itemGroup[key]);
        }
    }
    orderForm.calcTotalPrice();
    orderForm.consumer.val(getCookie('cname'));
    orderForm.consumerPhone.val(getCookie('cphone'));
    orderForm.consumerPhone2.val(getCookie('cphone2'));
    orderForm.consumerAddress.val(getCookie('caddr'));
    ////////格式化函数
    function format(str, list) {
        return str.replace(/{{(\d+)}}/g, function(match, number) { 
          return typeof list[number] != 'undefined'
            ? list[number]
            : match;
        });
    }
    //////生成送货开始时间和结束时间
    var sendTime = items[0].send_time;
    var times = sendTime.split('-');
    var stime = parseInt(times[0]);
    var etime = parseInt(times[1]);
    var timeOptionStr = '';
    for (var i = stime; i <= etime; i++) {
        timeOptionStr += '<option>'+ i +':00</option>';
    }
    $('#deliverSTime').append(timeOptionStr);
    $('#deliverETime').append(timeOptionStr);
});
