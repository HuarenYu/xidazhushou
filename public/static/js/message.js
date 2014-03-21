$(function() {

    var sock = new SockJS('/message');
    
    sock.onopen = function() {
        sock.send('{"action":"register", "id":' + shop.id + '}');
    };

    sock.onmessage = function(e) {
        var data = JSON.parse(e.data);
        if (data.action === 'newOrder') {
           $("#message").show();
        }
    };

});