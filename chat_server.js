var io = require('socket.io')();

var userList=[];//在线的人集合
function RemoveNickname(nickname){
    for (var i = 0; i < userList.length; i++) {
        if (userList[i] == nickname)
            userList.splice(i, 1);
    }
}
io.on('connection', function (_socket) {
    _socket.nickname=null;


    _socket.emit('user_list',userList);
    _socket.on('disconnect', function () {
        console.log('userList is:',userList);
        console.log(_socket.id + ': disconnect');
        console.log("socket.nickname:",_socket.nickname);
        if (_socket.nickname !== null) {

            RemoveNickname(_socket.nickname);
            _socket.broadcast.emit('user_quit', _socket.nickname,userList);
        }
    })



    //function notify(msg){
    //    _socket.emit('new_message',msg);
    //}


    _socket.on('banker_confirm',function(banker){
        _socket.broadcast.emit('banker_confirm',banker);
        _socket.emit('banker_confirm',banker);
    })
    _socket.on('broadcastModifyProp',function(k,v){
        _socket.broadcast.emit('broadcastModifyProp',k,v);
        _socket.emit('broadcastModifyProp',k,v);
    })
    _socket.on('broadcastInvokeFun',function(funName,paramArr){
        _socket.broadcast.emit('broadcastInvokeFun',funName,paramArr);
        _socket.emit('broadcastInvokeFun',funName,paramArr);
    })
    _socket.on('read_card_info',function(cardInfo){
        _socket.broadcast.emit('read_card_info',cardInfo);
        _socket.emit('read_card_info',cardInfo);
    })
    _socket.on('start_game',function(){
        _socket.broadcast.emit('start_game');
        _socket.emit('start_game');
    });
    _socket.on('banker_set',function(banker){
        _socket.broadcast.emit('banker_set',banker);
        _socket.emit('banker_set',banker);
    })
    _socket.on('restart',function(){
        console.log('will restart');
        var obj=null;
        obj.name;
    })


    _socket.on('send_message',function(msg,type,isPlayerMsg){
        _socket.broadcast.emit('send_message',msg, _socket.nickname,type,isPlayerMsg);
        _socket.emit('send_message',msg, _socket.nickname,type,isPlayerMsg);
    })
    _socket.on('new_comer',function(nickname){

        _socket.nickname=nickname;
        if(userList.indexOf(nickname)===-1){
            userList.push(nickname);
            _socket.broadcast.emit('join',nickname,userList);
            _socket.emit('join',nickname,userList);
            console.log(nickname+'加入游戏');
        }else{
            _socket.emit('nickname_error',nickname,userList);

        }
    })
    //_socket.on('fapai_end',function(){
    //    _socket.broadcast.emit('fapai_end');
    //    //_socket.emit('fapai_end');
    //})



});

exports.listen = function (_server) {
    return io.listen(_server);
};