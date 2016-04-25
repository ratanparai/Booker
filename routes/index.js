var express = require('express');
var router = express.Router();
var Friendship = require('../models/friendship');

var _ = require('underscore');

/* GET home page. */
router.get('/', function(req, res, next) {
    var loginInfo = {};
    
    if(req.session.username) {
        
        Friendship.find({user2: req.session.userid}, function(err, doc){
            if (err) return console.dir(err);
            
            
            var userlist = _.pluck(doc, 'user1');
            console.dir(userlist);
            
            return res.send("User response");
        });
        
        
        
        console.log('user logged in ' + req.session.username);
        loginInfo.loggedin = true;
        loginInfo.username = req.session.username;
    } else {
        console.log('no user is logged in');
        console.log(loginInfo);
            
        res.render('index', { 
            title: 'Booker',
            loginInfo : loginInfo
            });
    }
    
    
});

module.exports = router;


