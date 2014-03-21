$(function() {
    var query = queryString.parse(window.location.search);
    if (query.date) {
        var today = new Date(),
            todayStr = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();;
        if (query.date === todayStr) {
            $('#orderDate').text('今日订单');
        } else {
            $('#orderDate').text(query.date + '日订单');
        }
    }
    $('#datepicker').datepicker({
        language: 'zh-CN',
        todayHighlight: true,
        autoclose: true
    }).on('changeDate', function(e) {
        var d = $(this).datepicker('getDate');
        query.date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
        window.location.search = queryString.stringify(query);
    });

    $('button[action=send]').click(function(e) {
        var sure = confirm('你确定发货了吗？');
        if (sure) {
            $.get('/order/send/' + $(this).data('id'), function(data) {
                if (data.msg.type === 'success') {
                    alert(data.msg.info);
                    window.location.reload();
                    return;
                }
                alert(data.msg.info);
            });
        }
    });
    
    $('#unsend').click(function(e) {
        query.state = '未发货';
        window.location.search = queryString.stringify(query);
    });

    $('#sended').click(function(e) {
        query.state = '完成';
        window.location.search = queryString.stringify(query);
    });


});