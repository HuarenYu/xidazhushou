$(function() {
	
	$('#updateSettings').click(function(e) {
        var sure = confirm('你确定要更新商店信息吗？');
        if (sure) {
            $.post('/shop/updateSettings', 
                {'shop[name]': $('#sname').val(), 'shop[description]': $('#sdesc').val(), 
                'shop[address]': $('#saddr').val(), 'shop[telephone]': $('#tel').val(), 
                'shop[mobilephone]': $('#mphone').val()}, 
                function(data) {
                    if (data.msg.type === 'success') {
                        alert(data.msg.info);
                        window.location.reload();
                    } else {
                        alert(data.msg.info);
                    }
            });
        }
    });
	
});