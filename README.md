有一天早上，无意中看到了一个牛逼的游戏，需要程序猿使敲代码才可以玩游戏，代码越牛逼，游戏玩起来就越顺手，感觉听起来很牛逼的样子。受此启发，我突然想到了开发一个网络版的斗地主游戏可以在上班无聊的时候玩。

既然可以在上班时候玩，最基本的要求就是你玩游戏的时候你的老板不会轻易的看出来你在玩游戏，或者说基本上看不出来你在玩游戏。所以，嘿嘿，我就把游戏做成了“命令行”的模样，通过输入“命令”去操作斗地主；同时为了增加趣味性，做成了一个网络版的斗地主。

先来一个游戏截图：

QQ截图20150831102007

好了，言归正传，这并不是真正的命令行，这实际上是一个网页，作成了命令行的模样；至于你为什么看不到浏览器的踪迹，哈哈，这就得归功于node-webkit的功劳了：



{
    "name": "nw-demo",
    "main": "example1.html",
    "window":{
    "toolbar":false,
        "width":677,
        "height":462,
        "resize":false,
        "resizable":false,
        "icon":"ico.ico",
        "cache":false
}
}


通过在package.json中加入toolbar:false的配置就可以隐藏任务栏；然后在通过icon属性吧图标换成cmd.exe的样子，基本上接近于完美了。

接下来，分享一下这个游戏的大致制作过程；目前里面还有一些无关紧要的bug，不过完全不影响玩游戏。

游戏采用nodejs和socket技术实现即时通信，前端基于jquery实现，实现的功能如下：

1 即时聊天
2 斗地主功能
3 催牌
4 得分统计
5 允许三个参战者之外的人观战
6 模拟一下常用的命令行功能，包括上下箭头切换命令，Ctrl+c取消命令，cls,help帮助等等
7 各种状态的提醒，以及一些辅助查看状态的命令等等，比如查看我的牌，查看得分情况，玩家情况等等
我并没有做黑名单之类的功能，所以程序一运行就相当于系统中多了一个在线的人，如果他是前三个人进入系统的就可以成为斗地主参与者，后续的人只能是观战者；然后离开的时候如果是玩家，这游戏就没法完了，在线玩家的页面需要刷新，如果是观战者就无伤大雅；同时，server端会对各种事件进行相应，比如开始游戏，玩家离开，确定地主等等。

server端：

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

    _socket.on('banker_confirm',function(banker){
        _socket.broadcast.emit('banker_confirm',banker);
        _socket.emit('banker_confirm',banker);
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

});
后来由于功能的逐渐壮大，这么下去一个事件对应一段代码，由某个用户触发，提交到server端然后通知其它用户的方式会导致代码量实在太大，于是我发明了两个看起来很不错的事件：broadcastModifyProp和broadcastInvokeFun，在前端的表现里采用面向对象的方式开发，所以broadcastModifyProp可以用来修改对象的某个属性，而broadcastInvokeFun用来调用对象的某些行为（函数）,这样，所有的玩家都可以收到这些事件请求并在客户端作出对应的动作了：

server端：

_socket.on('broadcastModifyProp',function(k,v){
    _socket.broadcast.emit('broadcastModifyProp',k,v);
    _socket.emit('broadcastModifyProp',k,v);
})
_socket.on('broadcastInvokeFun',function(funName,paramArr){
    _socket.broadcast.emit('broadcastInvokeFun',funName,paramArr);
    _socket.emit('broadcastInvokeFun',funName,paramArr);
})
客户端：

socket.on('broadcastInvokeFun', function (funName, paramArr) {
    o[funName].apply(o, paramArr);
})
socket.on('broadcastModifyProp', function (k, v) {
    o[k] = v;
    var msg = {
        'YAO_DI_ZHU': '请' + o.banker + '决定是否要地主,输入y抢地主,不要地主输入n'
    }
    if (typeof(msg[v]) !== 'undefined') {
        o.notify(msg[v])
    }

})
刨除css的部分，第一个功能就是构建一个“命令”系统了。这里我巧妙的利用了一个文本框，将他隐藏掉，通过监控文板框的文字实现命令文字和文本框文字的同步，同时监控回车键调用命令。然后通过判断各种命令调用不同的函数。这里用到的一些关键变量如下，读者可以自行体会：

nickname: null,//当前玩家昵称
    pre: 'c:\\Users\\USER>',//最新命令前的占位符
    isExecuteEverCmd: false,//是否是执行曾经执行过的命令
    cmds: [],//曾经执行过的所有命令都存放在这儿
    cmd_index: 0,//当前执行的命令的索引，每执行一次增加1，可用于上下箭头的命令更换
    totalMsg: '',//总消息
    lastMsg: '',//上一次回车键按下之前的总消息
    tmpMsg: '',//临时消息
    lastCmd: '',//上一次执行的命令
接下来最简单的就是即时聊天了，这个最简单，某人想要聊天的时候通过按照一定的规则输入文字会触发send_message事件，其他人就收到消息了。

而区分参赛者和观战者很简单，只需要看看他是不是前三个进入系统的玩家了。

而状态提醒，就是在合适的时间显示不同的提示信息，主要有notify方法和error方法完成，字体颜色也可以标记成不同颜色以达到醒目的目的。

而得分统计的功能也很简单，就是在游戏结束的时候判断输赢然后更新玩家的分数了。

催牌也很简单，实际上就是发送了一个及时聊天的信息，默认消息是：快点儿啊，我等的花儿都谢了。

而最关键的，也是最难的部分，就是和斗地主有关的一切元素了。为了实现这个功能，我使用到的关键变量如下：

相信通过看这些变量以及注释，亲们可以从中体会到一些奥秘。接下来对于设计的某些算法或者行为，我进行简单的阐述。

首先游戏的开始需要管理员执行sg命令开始，然后系统随机抽选一名临时地主，有临时地主执行fp命令发牌，发牌完了就是要地主阶段，临时地主优先选择要不要，然后依次往后，谁要了就是谁的，都不要就重新开局。

最终的地主确定之后，系统会自动为你整牌，然后就是出牌阶段，出牌规则就是：
1 判断出的牌在不在本人的牌手中
2 判断出的牌合不合发，不合法就禁止下牌
3 如果合法，判断是否能压得住上家的牌
4 出牌结束，如果手里还有牌，而且只剩一两张就是报警了，系统要作出对应 提示让所有玩家知道
5 如果出牌接受手里没有牌了，就结束游戏，并且更新玩家分数等

判断出的牌在不在出牌人手中，实际上就是判断数组a中的元素是否全部被包含在数组b中：

isArrBInArrA: function (arrB, arrA) {

    lib.arrEle2String(arrB);
    lib.arrEle2String(arrA);
    var result = true;

    var countMapB = lib.setArrEleCount2Map(arrB), countMapA = lib.setArrEleCount2Map(arrA);
    for (var i in countMapB) {
        if ((arrA.indexOf('' + i) === -1) || (arrA.indexOf(i) !== -1 && countMapA[i] < countMapB[i])) {
            result = false;
            break;
        }
    }
    return result;
}
而判断牌是否合法，是一个非常关键的动作。首先对于斗地主的出牌规则，我讲它分成了一下几类

1 单
2 王炸
3 对
4 三带一
5 三带二(只能带一个对子)
6 三不带（除非三不带出了手头没牌了，否则不能出三不带）
7 四带二
8 炸弹
9 单顺子
10 连对顺子
11 飞机
然后我的思路是，将除了飞机之外的所有出牌的可能，放在一个大的map中，然后判断飞机对应一个方法；首先判断是否在map中，在了就可以知道牌的大小，类型，步长（顺子时候要用），最小值（顺子时候要用）等信息，如果不在就判断是不是飞机。

发牌的抽象如下：

fapai: function (options) {
    if (o.isBegin === false) {
        o.error('游戏没开始，无权发牌哦');
        return false;
    }
    if (o.nickname !== o.banker) {
        o.error('你不是庄家，无权发牌哦');
        return false;
    }
    var cards = '111122223333444455556666777788889999ttttjjjjqqqqkkkkzZ'.split('');
    if (options.p && md5(options.p) === o.md5pwd && options.me && lib.isArrBInArrA(options.me.split(''), cards)) {
        cards = lib.arrSubtraction(cards, options.me.split(''));
    }
    cards = xipai(cards);
    o.cardInfo[o.nicknameList[0]] = {
        initialCards: cards.slice(0, 17),//被发到的牌
        remainCards: cards.slice(0, 17),//剩余的牌
        sentCards: []//已经发出去的牌
    };
    o.cardInfo[o.nicknameList[1]] = {
        initialCards: cards.slice(17, 34),//被发到的牌
        remainCards: cards.slice(17, 34),//剩余的牌
        sentCards: []//已经发出去的牌
    };
    o.cardInfo[o.nicknameList[2]] = {
        initialCards: cards.slice(34, 51),//被发到的牌
        remainCards: cards.slice(34, 51),//剩余的牌
        sentCards: []//已经发出去的牌
    };

    if (options.p && md5(options.p) === o.md5pwd && options.me && lib.isArrBInArrA(options.me.split(''), cards.concat(options.me.split('')))) {

        console.log("hello world");
        o.cardInfo[o.banker].initialCards = o.zhengpai(o.cardInfo[o.banker].initialCards.concat(options.me.split('')));
        o.cardInfo[o.banker].remainCards = o.zhengpai(o.cardInfo[o.banker].remainCards.concat(options.me.split('')));
    }
    o.cardInfo.dipai = cards.slice(51);
    socket.emit('read_card_info', o.cardInfo);
    socket.emit('send_message', '发牌完毕,翻开的牌是:' + (o.cardInfo[o.banker].initialCards[Math.floor(Math.random() * 17)]) + '请按[wdp]显示您的牌', null, false);
    o.broadcastModifyProp('status', statusMap['YAO_DI_ZHU'])
}
这个是收集除了飞机外所有可能到一个map中：

var allSituationExceptPlane = (function () {

//首先列举所有的王炸
    var map = {
        'zZ': {
            value: 'zZ',
            type: 'wang_zha'
//,
//value:'zZ'
        },
        'Zz': {
            value: 'Zz',
            type: 'wang_zha'
//,
//value:'Zz'
        }
    };

//var index=2;
//列举所有的单
    for (var i in cardMap) {
        map['' + i] = {
            value: '' + i,
            type: 'dan',
//value:i,
            zIndex: cardMap[i],//真实的大小
        }
//count1++++;
//index++;
    }
//列举所有的对,不含王炸
    for (var i in cardMap) {
        if (i !== 'z' && i !== 'Z') {

            map[i + '' + i] = {
                value: i + '' + i,
                type: 'dui',
//value:i+''+i,
                zIndex: cardMap[i],//真实的大小
            }
//count1++++;
//index++;
        }
    }

//列举所有三不带的可能性
    for (var i in cardMap) {
        if (i !== 'z' && i !== 'Z') {

            map[i + '' + i + '' + i] = {
                value: i + '' + i + '' + i,
                type: 'san_bu_dai',
//value:i+''+i+''+i,
                zIndex: cardMap[i],//真实的大小
            }
//count1++++;
//index++;
        }
    }
//列举所有炸弹不含王炸的可能性
    for (var i in cardMap) {
        if (i !== 'z' && i !== 'Z') {

            map[i + '' + i + '' + i + '' + i] = {
                value: i + '' + i + '' + i + '' + i,
                type: 'zha_dan',
//value:i+''+i+''+i+''+i,
                zIndex: cardMap[i],//真实的大小
            }
//count1++++;
//index++;
        }
    }
//列举所有单张顺子的可能性:
    for (var i = 3; i <= 12; i++) {
        for (var step = 4; step < 15 - i; step++) {
            var val = getCardByRange(i, i + step);
            map[val] = {

                type: 'dan_shun',
                value: val,
                step: step,
                min: i
//,
//max:step+i
            }
//count1++++;
//index++;
        }
    }
//列举所有连对的可能性:
    for (var i = 3; i <= 12; i++) {
        for (var step = 2; step < 15 - i; step++) {
            var val = getCardByRange(i, i + step, 2);
            if (step * 2 > 18) {
                continue;
            }
            map[val] = {
                type: 'lian_dui',
                value: val,
                step: step,
                min: i,
//max:step+i
            }
//count1++++;
//index++;
        }
    }
//列举所有三带一的可能性
    for (var i in cardMap) {
        if (i !== 'z' && i !== 'Z') {
            var danArr = [];
            for (var j in cardMap) {
                if (j !== i) {
                    danArr.push(j);
                }
            }

            for (var k in danArr) {
                var dan = danArr[k];

                map[i + '' + i + '' + i + '' + dan] = {
                    type: 'san_dai_yi',
                    value: i + '' + i + '' + i + '' + dan,
                    zIndex: cardMap[i],//真实的大小
                }
//count1++++;
//index++;

            }
        }
    }
//列举所有三代二的可能性
    for (var i in cardMap) {
        if (i !== 'z' && i !== 'Z') {
            var danArr = [];
            for (var j in cardMap) {
                if (j !== i) {
                    danArr.push(j);
                }
            }

            for (var k in danArr) {
                var dan = danArr[k];
                if (dan !== 'z' && dan !== 'Z') {
                    map[i + '' + i + '' + i + '' + dan + '' + dan] = {
                        type: 'san_dai_er',
                        value: i + '' + i + '' + i + '' + dan + '' + dan,
                        zIndex: cardMap[i],//真实的大小
                    }
//count1++++;
//index++;
                }
            }
        }
    }

//列举所有四带二的可能性
    for (var i in cardMap) {
        if (i !== 'z' && i !== 'Z') {

            var danArr = [];
            for (var j in cardMap) {
                if (j !== i) {
                    danArr.push(j);
                }
            }

            for (var k in danArr) {
                var dan = danArr[k];

                if (['zz', 'ZZ'].indexOf('' + dan + dan) === -1) {
                    map['' + i + i + i + i + (dan + dan)] = {
                        type: 'si_dai_er',
                        value: i + '' + i + '' + i + '' + dan,
                        zIndex: cardMap[i],//真实的大小
                    }
//count1++++;
//index++;
                }

                for (var p in cardMap) {
                    if ((cardMap[p] > cardMap[dan]) && (['zZ', 'Zz'].indexOf('' + dan + p) === -1)) {
                        map['' + i + i + i + i + (dan + p)] = {
                            type: 'si_dai_er',
                            value: '' + i + i + i + i + (dan + p),
                            zIndex: cardMap[i],//真实的大小
                        }
//count1++++;
//index++;
                    }

                }
            }
        }
    }
//不列举所有飞机的可能性,因为飞机的组合太多了，另外检查
    return map;
})();
然后判断飞机：

var getPlaneMsg = function (p) {
    var isValid = true, arr = p.split(''), numArr = [], msg = false;
    for (var i in arr) {
        if (cardMap[arr[i]]) {
            numArr.push(cardMap[arr[i]]);
        } else {
            o.error(o.nicknameList[o.playerIndex] + '出的牌里包含[' + arr[i] + ']这个字符，怎么这么二逼呢，这肯定是不合法的');
            isValid = false;
            break;
        }
    }
    if (isValid === false) {
        return false;
    } else {
        var countMap = lib.setArrEleCount2Map(numArr);
        var countMapSortByCount = {};
        for (var i in countMap) {
            if (!countMapSortByCount[countMap[i]]) {
                countMapSortByCount[countMap[i]] = [parseInt(i, 10)];
            } else {
                countMapSortByCount[countMap[i]].push(parseInt(i, 10));
            }
        }
        if (countMapSortByCount['4']) {
            o.error(o.nicknameList[o.playerIndex] + '出的牌是不合法[lg3-at-planeMode]');
        } else if (!countMapSortByCount['3']) {
            o.error(o.nicknameList[o.playerIndex] + '出的牌不合法[sg3-at-planeMode]');
        }
        else {
            var threeArr = countMapSortByCount['3'];
            lib.bubbleSort(threeArr);
            var len = threeArr.length;
            if (threeArr[len - 1] - threeArr[0] + 1 !== len) {
                o.error(o.nicknameList[o.playerIndex] + '出的牌不合法[max reduce min not equal to step length]');
            } else {
                var danArr = [];
                for (var i in numArr) {
                    var n = numArr[i];
                    if (threeArr.indexOf(n) === -1) {
                        danArr.push(n);
                    }
                }
                if (danArr.length !== threeArr.length) {
                    o.error(o.nicknameList[o.playerIndex] + '出的牌不合法[step not equal 2 singleCard length]');
                } else {
                    var wangCount = 0;
                    for (var i in danArr) {
                        if ([16, 17].indexOf(danArr[i]) !== -1) {
                            wangCount++;
                        }
                    }
                    if (wangCount > 1) {
                        o.error(o.nicknameList[o.playerIndex] + '出的牌不合法[more than 2 king]');
                    } else {
                        var step = threeArr[threeArr.length - 1] - threeArr[0];
                        if (step < 1) {
                            o.error(o.nicknameList[o.playerIndex] + '出的牌不合法[step less than 2]');
                        }
                        else {
                            msg = {
                                value: p,
                                type: 'fei_ji',
                                min: parseInt(threeArr[0], 10),
                                step: step
                            }
                        }
                    }
                }
            }
        }
        return msg;
    }

}
好了，出牌规则合法的情况下就是判断是否可以压得住上家的牌了：

compareCardZindex: function (oCur) {
    var oLast = o.lastCardMsg;
    var isBigerThanLast = true;

    if (o.lastCardMsg !== null) {
        switch (oLast.type) {
            case 'dan':
            {
                isBigerThanLast = oCur.type === 'dan' && oCur.zIndex > oLast.zIndex;
                break;
            }
            case 'dui':
            {
                isBigerThanLast = oCur.type === 'dui' && oCur.zIndex > oLast.zIndex;
                break;
            }
            case 'san_bu_dai':
            {
                isBigerThanLast = oCur.type === 'san_bu_dai' && oCur.zIndex > oLast.zIndex;
                break;
            }
            case 'zha_dan':
            {
                isBigerThanLast = oCur.type === 'zha_dan' && oCur.zIndex > oLast.zIndex;
                break;
            }
            case 'dan_shun':
            {
                isBigerThanLast = oCur.type === 'dan_shun' && oCur.min > oLast.min && oCur.step === oLast.step;
                break;
            }
            case 'lian_dui':
            {
                isBigerThanLast = oCur.type === 'lian_dui' && oCur.min > oLast.min && oCur.step === oLast.step;
                break;
            }
            case 'san_dai_yi':
            {
                isBigerThanLast = oCur.type === 'san_dai_yi' && oCur.zIndex > oLast.zIndex;
                break;
            }
            case 'san_dai_er':
            {
                isBigerThanLast = oCur.type === 'san_dai_er' && oCur.zIndex > oLast.zIndex;
                break;
            }
            case 'si_dai_er':
            {
                isBigerThanLast = oCur.type === 'si_dai_er' && oCur.zIndex > oLast.zIndex;
                break;
            }
            default :
            {
                isBigerThanLast = false;
                break;
            }
        }
    } else {
        isBigerThanLast = true;
    }
    if (oCur.type === 'zha_dan') {
        isBigerThanLast = (['wang_zha', 'zha_dan'].indexOf(oLast.type) === -1) || (oLast.type === 'zha_dan' && oCur.zIndex > oLast.zIndex);
    }
    if (oCur.type === 'wang_zha') {
        isBigerThanLast = true;
    }
    return isBigerThanLast;
}
这些是关键的步骤，总的来说一个完整的出牌动作包含如下具体判断：

broadcastChupai: function (p, nickname) {

    if (o.lastWUDIer === nickname) {
        o.lastWUDIer = null;
        o.buYaoPai(null);//清空不要牌的计数器
    }
    if (o.status !== statusMap.CHU_PAI) {
        o.error('@' + nickname + ',都没到出牌阶段，你出个蛋蛋啊', false);
        return false;
    }
    var obj = o.cardInfo[nickname];
    if (obj.remainCards.join('').trim() === '') {
        o.error('@' + nickname + ',牌都出完了，你赢了，你出个蛋蛋啊', false);
        return false;
    }
//判断出的牌是否在出牌的人剩余的牌的数组里
    if (lib.isArrBInArrA(p.split(''), obj.remainCards)) {
        var nextIndex = o.getNextPlayerIndex(o.playerIndex);
        var isValid = null;//出的牌是否合法
        var pMsg;
        var currentCardMsg = null;
        if (pMsg = allSituationExceptPlane['' + p]) {
            isValid = true;
            currentCardMsg = pMsg;
        } else {
            var planeMsg = getPlaneMsg(p);
            if (planeMsg === false) {
                isValid = false;
            } else {
                isValid = true;
                currentCardMsg = planeMsg;
            }
        }
        if (isValid === true) {
////var obj= o.cardInfo[nickname];
////判断出的牌是否在出牌的人剩余的牌的数组里
//if(lib.isArrBInArrA(p.split(''),obj.remainCards)){
            var isBigerThanLast = o.compareCardZindex(currentCardMsg);//是否比上家的牌大
            if (isBigerThanLast === true) {

                var isRight = true;
                if (currentCardMsg.type === 'san_bu_dai' && obj.remainCards.join('').trim() !== '') {
                    isRight = false;
                    o.error('@[' + nickname + ']出的牌[' + p + ']是三不带，你现在手里还有牌不能出三不带，出牌失败，请重新出牌，不要的话输入[n] pass掉', false);
                }
                if (isRight === true) {

                    if (currentCardMsg.type === 'wang_zha' || currentCardMsg.type === 'zha_dan') {
                        o.bl *= 2;
                    }
                    o.lastCardMsg = currentCardMsg;
                    o.lastWUDIer = null;
                    o.buYaoPai(null);//清空不要牌的计数器
                    o.notify('[' + nickname + ']出的牌是:[' + p + '],请[' + o.nicknameList[nextIndex] + ']决定是否要牌,要输入【cp -p 牌】的命令压倒它，不要的话输入[n] pass掉', false, true);

                    var _nickname = o.nicknameList[nextIndex];
                    if (_nickname === o.nickname) {
                        o.notifyWDP();
//o.notify('你的牌是' + o.zhengpai(o.cardInfo[o.nickname].remainCards).join(','), false);
                    }

//计算出牌的人手中剩余的牌

//添加已经出的牌到sentCards中
                    obj.remainCards = o.calculateRemainCards(p.split(''), obj.remainCards);
                    obj.sentCards = obj.sentCards.concat(p.split(''));
                    obj.sentCards = o.zhengpai(obj.sentCards);
                    o.playerIndex = nextIndex;
                    var remainLen = obj.remainCards.join('').trim().length
                    if (remainLen < 3) {
                        o.error('警告：' + nickname + '的牌只剩下' + remainLen + '张了!', false);
                    }
                }
//obj.remainCards.join('').trim()===''
            } else {
                o.error('@[' + nickname + ']出的牌[' + p + ']都没法大过上家，出牌失败，请重新出牌，不要的话输入[n] pass掉');
                return false;
            }
            if (obj.remainCards.join('').trim() === '') {
                o.notify('@' + nickname + (o.banker === nickname ? '地主' : '农民') + ',恭喜你获胜！！！');
                o.lastWinnerIndex = o.nicknameList.indexOf(nickname);
                if (o.banker === nickname) {

                    o.score[o.banker] += (2 * o.bl);
                    var arr = o.nicknameList.slice(0, 3);
                    for (var i in arr) {
                        if (arr[i] !== o.banker) {
                            o.score[arr[i]] -= (1 * o.bl);
                        }
                    }
                }
                else {
                    o.score[o.banker] -= (2 * o.bl);
                    o.score[nickname] += (1 * o.bl);
                    o.score[o.getAnotherFarmerNickname(nickname)] += (1 * o.bl);
                }

                localStorage.setItem('score', JSON.stringify(o.score));
                o.status = statusMap.END;
                o.viewScore();
                o.notify([
                    '--------------',
                    ['已经出了的牌是:',
                        o.nicknameList[0] + '剩下的牌是:' + o.cardInfo[o.nicknameList[0]].remainCards.join(','),
                        o.nicknameList[1] + '剩下的牌是:' + o.cardInfo[o.nicknameList[1]].remainCards.join(','),
                        o.nicknameList[2] + '剩下的牌是:' + o.cardInfo[o.nicknameList[2]].remainCards.join(','),
                        '已经出了的所有的牌是:' + o.getRemainCards()].join(','),

                    '---------------'
                ])

                o.endGame();
            }
        }
    } else {

        o.error('@[' + nickname + ']出的牌[' + p + ']都不在他手中已有的牌里面，出牌失败，请重新出牌，不要的话输入[n] pass掉');
    }
}

然后风水轮流转，下架可以选择压牌，也可以选择不要上家的牌：
//不要上家的牌
buYaoPai: (function () {
//连续两次不要牌的话就清楚上一次出牌信息
    var count = 0;
    return function (nickname) {
        if (nickname === null) {
            count = 0;
            return false;
        }

        var nextIndex = o.getNextPlayerIndex(o.playerIndex);

        if (o.playerIndex !== o.nicknameList.indexOf(nickname)) {
            o.error('@[' + nickname + ']没轮到你出牌，你出个毛啊');
        }
        else if (o.lastWUDIer === nickname) {
//count=0;
            o.error('@[' + nickname + '],你刚刚已经无敌了，请务必要出一张牌');

        }
        else if (o.lastCardMsg === null) {
//count=0;
            o.error('@[' + nickname + '],你是第一个出牌的人，或者没有人能压得过你的牌，所以请务必要出一张牌');

        }
        else {
            if (o.lastWUDIer !== null) {
                count++;
            } else {
                if (o.lastCardMsg !== null) {
                    count++;
                }
            }

            if (count === 2) {
                o.lastWUDIer = o.nicknameList[nextIndex];
                o.lastCardMsg = null;
                count = 0;
                o.notify('大家都要不起上家的牌,请[' + o.nicknameList[nextIndex] + ']继续出牌');
                var _nickname = o.nicknameList[nextIndex];
                if (_nickname === o.nickname) {
                    o.notifyWDP();

                }
            }
            else {
                o.notify('[' + nickname + ']要不起上家的牌,请[' + o.nicknameList[nextIndex] + ']决定是否要牌,要输入【cp -p 牌】的命令压倒它，不要的话输入[n] pass掉');
                var _nickname = o.nicknameList[nextIndex];
                if (_nickname === o.nickname) {
                    o.notifyWDP();
                }
            }
            o.playerIndex = nextIndex;

        }
    }
})()
然后游戏结束的时候一些关键变量需要被重置：

endGame: function () {
    o.buYaoPai(null);
    o.lastWUDIer = null;
    o.lastCardMsg = null;
    o.banker = null;
    o.cardInfo = {};
    o.playerIndex = null;
    o.isBegin = false;
    o.isFinalBankerConfirmed = false;
    o.bl = 1;
    o.setBanker(null);//清空地主设置计时器
    o.notify('游戏结束啦，请管理员重新开始下一局游戏');
}
剩下的就是各种状态的确定，各种判断各种if else了，还有一些算法的推敲了。游戏也可以通过访问http://123.57.153.48:3000试玩，以及查看客户端全部源码。代码写的稍微有点儿草。

希望可以对各位有所帮助，也希望有兴趣的人无聊的时候可以和我斗两把{:1_528:}
