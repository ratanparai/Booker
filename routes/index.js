var express = require('express');
var router = express.Router();
var Friendship = require('../models/friendship');
var User = require('../models/user');
var Progress = require('../models/progress');
var Book = require('../models/book');

var underscore = require('underscore');

/* GET home page. */
router.get('/', function(req, res, next) {
    var loginInfo = {};
    
    if(req.session.username) {
        
        Friendship.find({user2: req.session.userid}, function(err, doc){
            if (err) return console.dir(err);
            
            
            var userlist = underscore.pluck(doc, 'user1');
            console.dir(userlist);
            
            // complex query start :D 
            Progress
                .find()
                .where('user_id').in(userlist)
                .populate('book_id user_id')
                .limit(10)
                .exec(function(err, progressData){
                    if (err) return console.log(err)
                    
                    
                   // console.log(JSON.stringify(progressData));
                   // console.dir(progressData[0].book_id.title);
                    
                    return res.render('index', { 
                        title: 'Booker',
                        progress : progressData,
                        loginInfo : loginInfo
                        });
                });
            
            // res.send("User response");
            // res.end();
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


