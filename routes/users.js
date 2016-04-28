var express = require('express');
var User = require('../models/user');
var router = express.Router();
var mime = require('mime');

var _ = require('underscore');

var Friendship = require('../models/friendship');

// multipart form middleware
var multer = require('multer');

// move upload file
var fs = require('fs');

// for updating password
var bcrypt = require('bcryptjs');
var SALT_WORK_FACTOR = 10;

// for receiving socket.io object



/* GET users listing. */
router.get('/', function(req, res, next) {
res.send('respond with a resource');
});

router.get('/create', function (req, res, next) {
    
    if(req.session.username){
        res.redirect('/');
    } else {
        res.render('signup', {title : 'Users', signUp : true, loginInfo: {loggedin: false}});
    }

});

router.post('/create', function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var name = req.body.name;
    var email = req.body.email;
    
    // add the information to database
    // TODO : check input stirngs
    
    // create a new user
    var newUser = new User({
        name : name,
        username : username,
        password : password,
        email : email,
        created_at : new Date()
    });
    
    // Now save the data 
    newUser.save(function (err) {
        if (err) {
            console.dir(err);
            
            var errorMessage = [];
            for (var error in err.errors){
                errorMessage.push(err.errors[error].message);
            }

            
            res.render('signup', {
                title : 'Signup',
                signUp : true,
                error : true,
                errorMessage : errorMessage,
                loginInfo : {}
            });
            
        } else {
            console.log('New user created');
            return res.redirect('/');
        }
    })
    
    // redirect to the home page
    
    
    
});

router.get('/login', function(req, res, next){
    
    if(req.session.username) {
        res.redirect('/');
    }
    
    res.render('login', {
    title : 'Log in',
    login : true,
    loginInfo : {}
    });
});

// login processing
router.post('/login', function(req, res, next){
    var username = req.body.username;
    var password = req.body.password;
    
    
    User.findOne({username : username}, function(err, user){
        // TODO show full error message
        if(err) return next(err);
        
        
        if(user) {
            user.comparePassword(password, function(err, isMatch){
                if (err) throw err;
                
                if(isMatch){
                    // set session and redirect 
                    req.session.loggedin = true;
                    req.session.username = username;
                    req.session.fullname = user.name;
                    req.session.userid = user._id;
                    
                    
                    // subscribe to his friends pubsub channels
                    Friendship.find({user2: req.session.userid}, function(err, doc){
                        if (err) return console.dir(err);
                        
                        
                        // req.session.followers = _.pluck(doc, 'user1');
                        // console.log(req.session);
                        
                        /**
                         * 
                         */
                        var userlist = _.pluck(doc, 'user1');
                        console.dir(userlist);
                        
                        if(userlist.length != 0 ) {
                            sub.subscribe(userlist);
                        }
                        
                        res.redirect('/'); 
                        
                    });
                    
                    
                    
                    
                } else {
                    res.render('login', {
                        login : true,
                        title: 'login',
                        error : true,
                        errorMessage : 'Username and Password does not match!',
                        loginInfo : {}
                    });
                }
            });
        } else {
            res.render('login', {
                login : true,
                title: 'login',
                error : true,
                errorMessage : 'Username and Password does not match!',
                loginInfo : {}
            });
        }
        
    });
    
    
}); 

// Logout
router.get('/logout', function(req, res, next){
    req.session.destroy(function(err){
        next(err);
    });
    res.redirect('/');
    
});

router.get('/view/:username/:action?', function(req, res, next){
    var loginInfo = {};
    if(req.session.username) {
        //console.log('user logged in ' + req.session.username);
        loginInfo.loggedin = true;
        loginInfo.username = req.session.username;
    } else {
        //console.log('no user is logged in');
    }
    // TODO show profile page
    
    // get information about user
    var currentUser = req.params.username;
    User.findOne({username : currentUser}, function(err, userResult){
        if( err) return console.dir(err);
        
        
        
        // get follower count
        Friendship.find({user1: userResult._id}, function(err, friendsWith) {
            
            // check if the user is already following the browsing user
            
            
            Friendship.findOne({user1: userResult._id, user2 : req.session.userid}, function(err, isFriend){
                if (err) return console.log(err);
                
                // check action and show different layout for each action
                var action = req.params.action;
                
                if (action === 'settings') {
                    
                    if(req.session.username != currentUser) {
                        return res.redirect('/');
                    }
                    res.render('profile', {
                        title : 'profile',
                        session: req.session,
                        loginInfo : loginInfo,
                        user : userResult,
                        follower : friendsWith.length,
                        isFriend : isFriend,
                        action: action
                    });
                } else if(action=='network') {
                    // get follower and following user data 
                    
                    Friendship
                        .find({user1 : userResult._id})
                        .populate('user2')
                        .exec(function(err, followers){
                            if (err) return console.log(err);
                            
                            
                            // now retrive follwing list
                            
                            Friendship
                                .find({user2: userResult._id})
                                .populate('user1')
                                .exec(function(err, followings){
                                    if (err) return console.log(err);
                                    
                                    // Now render the page
                                    res.render('profile', {
                                        title : 'profile',
                                        session: req.session,
                                        loginInfo : loginInfo,
                                        user : userResult,
                                        follower : friendsWith.length,
                                        isFriend : isFriend,
                                        action: action,
                                        followers : followers,
                                        followings : followings
                                    });
                                    
                                });
                            
                        });
                        
                        
                        // get list of fo
                
                    
                    
                } else if(action == 'progress') {
                    // show progress
                } else {
                    res.render('profile', {
                        title : 'profile',
                        session: req.session,
                        loginInfo : loginInfo,
                        user : userResult,
                        follower : friendsWith.length,
                        isFriend : isFriend,
                        action : action
                    });
                }
                
            });
            
            
        });
        
        
        
    });
        
});

router.get('/profile', function(req, res, next){
    if(!req.session.userid) {
        res.redirect('/');
    } else {
        // show the users own profile
    }
});

// follow user action
router.get('/follow/:userid/:username', function (req, res, next) {
    
    // if uer is not logged in go to login page
    if (!req.session.userid) {
        return res.redirect('/users/login');
    }
    
    var userToFollow = req.params.userid;
    // check if already following
    Friendship.findOne({user2: req.session.userid, user1: userToFollow}, function(err, isFriend){
        if (err) return console.dir(err);
        
        if(!isFriend) {
            // ad new follwing information to database
            
    
            var newFriend = new Friendship({
                user2 : req.session.userid,
                user1 : userToFollow
            });
            
            newFriend.save(function(err){
                if (err) return console.log(err);
                
                res.redirect('/users/view/' + req.params.username);
            });
        } else {
            res.redirect('/users/view/' + req.params.username);
        }
    });
    
    
});

router.get('/unfollow/:userid/:username', function (req, res, next) {
    var currentUser = req.params.userid;
    
    Friendship.findOneAndRemove({user1 : currentUser, user2 : req.session.userid}, function(err){
    if (err) return console.dir(err);
    
    res.redirect('/users/view/' + req.params.username);
    });
});

router.post('/updatesettings' ,multer({ dest: './uploads/'}).single('upl'), function(req,res){
    // only upload if the user is loggedin else redirect
    if(!req.session.userid) {
        return res.redirect('/');
    }
    //console.log(req.body); //form fields
    /* example output:
    { title: 'abc' }
    */
    if(req.file){
        var extension = mime.extension(req.file.mimetype);
        fs.rename(req.file.path, './public/images/profile/' + req.session.userid + '.'+ extension, function(err){
            if (err) console.log(err);
            
            socket.emit('refresh profile page', {url : '/images/profile/' + req.session.userid + '.' + extension});
            
        });
        
        User.findByIdAndUpdate(req.session.userid,{
            profile_picture : req.session.userid + '.' + extension
        }, function(err){
            if (err) return console.log(err);

            
        });
        
    }
    
    // if need to update password
    if(req.body.newpassword) {
        var newPassword = req.body.newpassword;
        bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt){
            // if error throw it
            if (err) return next(err);
            
            bcrypt.hash(newPassword, salt, function(err,hash){
                if (err) return next(err);
                    
                newPassword = hash;
                
                User.findByIdAndUpdate(req.session.userid,{
                    password : newPassword
                }, function(err){
                    if (err) return console.log(err);
                });
                
            });
        });
    }
    
    
    // fs.rename('../uploads/' + req.file.filename, )
    /* example output:
            { fieldname: 'upl',
            originalname: 'grumpy.png',
            encoding: '7bit',
            mimetype: 'image/png',
            destination: './uploads/',
            filename: '436ec561793aa4dc475a88e84776b1b9',
            path: 'uploads/436ec561793aa4dc475a88e84776b1b9',
            size: 277056 }
    */
    
    
    
    User.findByIdAndUpdate(req.session.userid,{
        name : req.body.name,
        email: req.body.email,
    }, function(err){
        if (err) return console.log(err);
    });
    
    
    
    
    res.redirect('back');
});




module.exports = router;
