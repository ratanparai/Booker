var express = require('express');
var User = require('../models/user')
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/create', function (req, res, next) {
    
    if(req.session.username){
        res.redirect('/');
    } else {
        res.render('signup', {title : 'Users', signUp : true, loginInfo : {}});
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
                errorMessage : errorMessage
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
    
    console.log(username);
    console.log(password);
    
    User.findOne({username : username}, function(err, user){
        // TODO show full error message
        if(err) throw err;
        
        
        if(user) {
            console.log('user found : ' + user.username);
            user.comparePassword(password, function(err, isMatch){
                if (err) throw err;
                
                if(isMatch){
                    // set session and redirect 
                    req.session.loggedin = true;
                    req.session.username = username;
                    req.session.userid = user._id;
                    console.log(req.session);
                    
                    res.redirect('/'); 
                } else {
                    res.render('login', {
                        login : true,
                        title: 'login',
                        error : true,
                        errorMessage : 'Username and Password does not match!'
                    });
                }
            });
        } else {
            res.render('login', {
                login : true,
                title: 'login',
                error : true,
                errorMessage : 'Username and Password does not match!'
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

router.get('/view/:username', function(req, res, next){
    // TODO show profile page
    res.send('view username ' + req.params.username);    
});

router.get('/profile', function(req, res, next){
    if(!req.session.userid) {
        res.redirect('/');
    } else {
        // show the users own profile
    }
});


module.exports = router;
