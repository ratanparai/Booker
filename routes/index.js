var express = require('express');
var router = express.Router();
var Friendship = require('../models/friendship');
var User = require('../models/user');
var Progress = require('../models/progress');
var Book = require('../models/book');
var Dashboard = require('../models/dashboard');

var underscore = require('underscore');

var moment = require('moment');

/* GET home page. */
router.get('/', function(req, res, next) {
    var loginInfo = {};
    
    if(req.session.username) {
        loginInfo.loggedin = true;
        loginInfo.username = req.session.username;
        
        var friends = req.session.followers;
        console.log(friends);
        
        Dashboard
            .find({user_id : {$in : friends}})
            .populate('user_id book_id', 'name title profile_picture username')
            .sort('-update_on')
            .exec((err, friendRes) => {
               if(err) console.dir(err);
               console.dir(JSON.stringify(friendRes)); 
               
                
                Dashboard
                    .find({user_id : req.session.userid})
                    .populate('user_id book_id', 'name title profile_picture')
                    .sort('-update_on')
                    .exec((err, ownRes) => {
                        
                        res.render('index', { 
                            title: 'Booker',
                            loginInfo : loginInfo,
                            dashboards : friendRes,
                            moment: moment,
                            ownRes : ownRes
                        });
                        
                    });
                
               
            });


    } else {
        //console.log('no user is logged in');
        //console.log(loginInfo);
            
        res.render('index', { 
            title: 'Booker',
            loginInfo : loginInfo
            });
    }
    
    
});

module.exports = router;


