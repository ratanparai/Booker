var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    var loginInfo = {};
    
    if(req.session.username) {
        console.log('user logged in ' + req.session.username);
        loginInfo.loggedin = true;
        loginInfo.username = req.session.username;
    } else {
        console.log('no user is logged in');
    }
    
    console.log(loginInfo);
        
    res.render('index', { 
        title: 'Express',
        loginInfo : loginInfo
        });
});

module.exports = router;


