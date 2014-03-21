$(function() {
    //添加商品
    var uploadImag,
        $imgdiv = $('#imgdiv'),
        $img = $imgdiv.children('img'),
        formAction;

    $('button[action=add]').click(function(e) {
        formAction = 'add';
    });
    $('#itemPic').fileupload({
        dataType: 'json',
        add: function(e, data) {
            var allowFileType = /\.(gif|jpe?g|png)$/i;
            if (allowFileType.test(data.files[0].name)) {
                if (data.files[0].size < 128 * 1024) {
                    data.submit();
                } else {
                    alert('请使用小于128kb的图片。');
                }
            } else {
                alert('你选择了不允许上传的文件类型，请重新选择。');
            }
        },
        done: function (e, data) {
            if (data.result.msg.type === 'success') {
                uploadImag = data.result.msg.newName;
                $img.attr('src', '/static/image/' + uploadImag);
                $imgdiv.show();
            } else {
                alert(data.result.msg.info);
            }
        },
        progressall: function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#progressBar').css('width', progress + '%');
        }
    });

    //jquery对象缓存
    var $itemName = $('#itemName'),
        $itemPrice = $('#itemPrice'),
        $itemDescription = $('#itemDescription'),
        $itemCategory = $('#itemCategory'),
        $itemSTime = $('#itemSTime'),
        $itemETime = $('#itemETime');
    //添加商品
    $('#addItemBtn').click(function(e) {
        if (uploadImag) {
            $.post('/item/' + formAction, {'item[name]': $itemName.val(),
                                         'item[price]': $itemPrice.val(),
                                         'item[description]': $itemDescription.val(),
                                         'item[cid]': $itemCategory.val(),
                                         'item[img]': uploadImag,
                                         'item[deliverTime]': $itemSTime.val() + '-' + $itemETime.val(),
                                         'item[id]': itemId},
                function(data) {
                    if (data.msg.type === 'success') {
                        alert(data.msg.info);
                        window.location.reload();
                    } else {
                        alert(data.msg.info);
                    }
            });
        } else {
            alert('还没有上传商品图片。');
        }                 
    });
    //下架商品
    $('button[action=offshelf]').click(function(e) {
        var sure = confirm('你确定要下架此商品吗？');
        if (sure) {
            $.get('/item/offshelf/' + $(this).data('id'), function(data) {
                if (data.msg.type === 'success') {
                    alert(data.msg.info);
                    window.location.reload();
                    return;
                }
                alert(data.msg.info);
            });
        }
    });
    //上架商品
    $('button[action=onshelf]').click(function(e) {
        var sure = confirm('你确定要上架此商品吗？');
        if (sure) {
            $.get('/item/onshelf/' + $(this).data('id'), function(data) {
                if (data.msg.type === 'success') {
                    alert(data.msg.info);
                    window.location.reload();
                    return;
                }
                alert(data.msg.info);
            });
        }
    });
    //编辑商品
    var itemId;
    $('button[action=edit]').click(function(e) {
        var item;
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === $(this).data('id')) {
                item = items[i];
            }
        }
        itemId = item.id;
        $itemName.val(item.name);
        $itemPrice.val(item.price);
        $itemDescription.val(item.description);
        $('option[value=' + item.cid + ']').attr('selected', 'selected');
        var deliverTime = item.deliver_time.split('-');
        $itemSTime.val(deliverTime[0]);
        $itemETime.val(deliverTime[1]);
        $img.attr('src', '/static/image/' + item.img);
        uploadImag = item.img;
        formAction = 'update';
        $imgdiv.show();
        $('#itemModal').modal('show');
    });
    //绑定对话框关闭事件
    $('#itemModal').on('hide.bs.modal', function(e) {
        //清空对话框
        $itemName.val('');
        $itemPrice.val('');
        $itemDescription.val('');
        $imgdiv.hide();
        $('#progressBar').css('width', '0%');
    });
});