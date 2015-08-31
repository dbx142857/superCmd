var express = require('express');
var router = express.Router();
//var io = require('socket.io')();

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index');
});
//router.post('/curl',function(req,res){
//    var params=req.body.params;
//
//    io.on('connection',function(socket){
//        console.log("from /curl:,connect success");
//    })
//    res.send('1');
//})

module.exports = router;
