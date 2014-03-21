$(function() {
	$('#updatePwd').click(function(e) {
		var sure = confirm('你确定要修改密码吗？');
		if (sure) {
			var oldPwd = $('#oldPwd').val(),
				newPwd = $('#newPwd').val(),
				renewPwd = $('#renewPwd').val();
			$.post('/user/updatepPassword',
					{oldPwd: $('#oldPwd').val(), newPwd: $('#newPwd').val(), renewPwd: $('#renewPwd').val()}, 
					function(data) {
				alert(data.msg.info);
			});
		}
	});
});