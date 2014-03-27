/**
 * Created by codegeek on 13-10-3.
 */

var Dialog = function() {

}

Dialog.prototype = {
    init:function(){
        console.log('hello');
    },
    show:function(){

    }
}

var str = '';

function addEvent (element, eventName, callback, useCapture) {
    if (element.addEventListener) {
        element.addEventListener(eventName, callback, useCapture);
    } else if (element.attachEvent) {
        element.attachEvent('on' + eventName, callback);
    } else {
        element['on' + eventName] = callback;
    }
}




