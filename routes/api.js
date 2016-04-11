var express = require('express');
var router = express.Router();
var auth = require('basic-auth');
var User = require('../models/user');


var checkAuth = function(req, res, next) {
    
    if(!auth(req) || !auth(req)){
        res.status(401);
        res.json({message: "Need to provide username and password to access the content"});
    }
    
    var username = auth(req).name;
    var password = auth(req).pass;

    
    /**
     * check database for authorization
     */    
    User.findOne({username : username}, function(err, user){
        if (err) return next(err);
        
        if(user) {
            user.comparePassword(password, function(err, isMatch){
                if(err) return next(err);
                
                if(isMatch){
                    req.myAuth = {
                        username : username,
                        userid : user._id,
                        name : user.name,
                        email : user.email,
                        image : user.profile_picture
                    };
                    next();
                } else {
                    res.status(401);
                    res.json({message: "Username and password did not match."});
                }
            });
        } else {
            res.status(401);
            res.json({message: "Username and password did not match."});
        }
    });
};

// use the middleware for every request on API path
router.use(checkAuth);


/* GET home page. */
router.get('/', function(req, res, next) {
    res.status(400);
    res.json({message : "Bad request."});
});


/**
 * Check authorization 
 */
router.post('/auth', function(req, res, next){
    res.status(200);
    res.json({message : "Login successful."});
});

/**
 * Search book 
 * return : Book_id
 */
router.get('/search/book', function(req, res,next){
    var title;
    var author;
    if(req.query.title) {
        title = req.query.title;
    }
    
    if(req.query.author) {
        author = req.query.author;
    }
});



module.exports = router;