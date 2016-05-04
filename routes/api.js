var express = require('express');
var router = express.Router();
var auth = require('basic-auth');
var User = require('../models/user');
var goodreads = require('../models/goodreads');
var Author = require('../models/author');
var Book = require('../models/book');
var Progress = require('../models/progress');
var Dashboard = require('../models/dashboard');
var fs = require('fs');


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
router.get('/auth', function(req, res, next){
    res.status(200);
    res.json({message : "Login successful.", user: req.myAuth});
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
    
    console.log(title + " and " + author);
    
    /**
     * At first search local database and if found result then return result
     * If not found request goodread infomation through API call and save info 
     * to databasse then return result 
     */
    
    // if author name is provided
    if (author) {
        Author.findOne({name: new RegExp(author, 'i')}, function(err, authorRes){
            if (err) return console.log(err);
            
            if(authorRes){
                // I have author info
                // now search book using the author id 
                
                Book.findOne({title : new RegExp(title), author_id : authorRes._id}, function(err, bookRes){
                    if (err) return console.log(err);
                    
                    if (bookRes){
                        // yeah! Good book info from database :)
                        // now send them 
                        console.log("found book in databse");
                        res.status(200);
                        return res.json({
                            book : bookRes,
                        });
                    } else {
                        console.log("book not found in database.");
                        // request Goodreads informaion
                        goodreads.findBook(title, author, function(err, resBook){
                            if(err) return next(err);
                            
                            console.log("trying to save book into database");
                            
                            console.log(resBook);
                            goodreads.saveSingleBookInfo(resBook, function(err, bookInfo){
                                if(err) return next(err);
                                
                                res.status(200);
                                return res.json({
                                   book : bookInfo 
                                });
                                
                            });
                        });
                    }
                });
            } else {
                // if no author found in search
                goodreads.findBook(title, author, function(err, resBook){
                    if(err) console.dir(err);
                    
                    goodreads.saveSingleBookInfo(resBook, function(err, bookInfo){
                        if(err) return console.log(err);
                        
                        res.status(200);
                        return res.json({
                            book : bookInfo 
                        });
                        
                    });
                });
            }
            
        });
    } else {
        console.log("Book search without author");
        Book.findOne({title : new RegExp(title, 'i')}, function(err, oneBook){
            if(err) return console.log(err);
            
            if(oneBook) {
                console.log("Book found");
                return res.json(oneBook);
            } else {
                // request for book info
                goodreads.findBook(title, null, function(err, withoutAuthorRes){
                    if(err) return console.dir(err);
                    
                    goodreads.saveSingleBookInfo(withoutAuthorRes, function(err, aBookInfo){
                        if(err) {
                            var customError = new Error("Book not found.");
                            customError.status = 404;
                            return next(customError);
                        } else {
                            return res.json({book: aBookInfo});
                        }
                        
                    });
                });
            }
        });
        // if no author name provided 
    }
    
    // goodreads.findBook(title, author, function(err, resBook){
    //     if (err) throw err;
        
    //     fs.writeFile('res.json', resBook, function(err){
    //         if (err) throw err;
            
    //         res.json(resBook);
    //     });
    // });
    
});

/**
 * get book progress percentage
 */

router.get('/progress/:book_id', function(req, res, next){
    var userid = req.myAuth.userid;
    
    if(req.params.book_id) {
        var book_id = req.params.book_id;
        
        Progress.findOne({book_id: book_id, user_id : userid}, function(err, progressRes){
            if(err) console.dir(err);
            
            if(progressRes) {
                return res.json({progress: progressRes.percentage});
            } else {
                return res.status(404).json({message : "Book progress not found."});
            }
        });
    } else {
        res.status(400).json({message : "Bad request."});
    }
    
});


/**
 * post book progress percentage
 */
router.post('/progress', function(req, res, next){
    console.dir(req.body.book_id);
    
    if(!req.body.book_id || !req.body.progress) {
        return res.status(400).json({message : "Bad request"});
    }
    
    var book_id = req.body.book_id;
    var progress = req.body.progress;
    var userid = req.myAuth.userid;
    
    
    // check if this is the first time user updating the book progress
    // if this is the first time then he/she just started reading the book
    // so publish the started reading message (pubsub) 
    
    Progress.findOne({book_id:book_id, user_id : userid}, (err, progBookRes) => {
        if(err) console.dir(err);
        
        if(progBookRes) {
            // user is updating his reading status only 
            // So update the previous entry and publish update (pubsub)
            
            var lastRead = progBookRes.last_update;
            
            progBookRes.percentage = progress;
            progBookRes.last_update = new Date();
            
            progBookRes.save((err, doc) =>{
                if (err) console.dir(err);
                
                
                //console.dir(doc);
                res.json({message: "Book progress update successful"});
                
                var opts = [
                    {path: 'book_id', model:'Book'},
                    {path:'user_id', model:'User'}
                ]
                
                Progress
                    .populate(doc, opts, (err, progResDoc) => {
                        if (err) console.dir(err);
                        
                        var tLastUpdate = new Date(lastRead).getTime();
                        var tNewUpdate = new Date(progResDoc.last_update).getTime();
                        
                        var thirtyMin = 30*60*1000;
                        
                        if((tNewUpdate-tLastUpdate) > thirtyMin) {
                            // send notification as starting reading old reading book
                            
                            console.log("Notify as new starting reading....");
                            
                            var pubToProg = {
                                startReading : progResDoc
                            }
                            
                            pub.publish(req.myAuth.userid, JSON.stringify(pubToProg));
                            
                        }
                        
                        var toPub = {
                            readingProgress : progResDoc
                        }
                        
                        pub.publish('profile.progress.'+ userid, JSON.stringify(toPub));
                        pub.publish(userid, JSON.stringify(toPub));

                    } )
                    
                
                
            });
            
        } else {
            // if this is first time add progress and send pubsub
            // as start reading new book
            var myProgress = new Progress({
                book_id : book_id,
                user_id : userid,
                percentage: progress,
                last_update : new Date()
            });
            
            myProgress.save((err, doc) => {
                if (err) console.dir(err);
                    
                var opts = [
                    {path: 'book_id', model:'Book'},
                    {path:'user_id', model:'User'}
                ]
                
                Progress
                    .populate(doc, opts, (err, progResult) => {
                        if (err) console.dir(err);
                        
                        var pubToProg = {
                            startReading : progResult
                        }
                        // console.dir(progResult);
                        pub.publish(req.myAuth.userid, JSON.stringify(pubToProg));
                        
                        var pubToProg = {
                            startReadingNewBook : progResult
                        }
                        // console.dir(progResult);
                        pub.publish(req.myAuth.userid, JSON.stringify(pubToProg));
                        
                        
                        
                    } )
                
                // send response message to book api    
                res.json({message: "Book progress update successful"});
                
                // add this information to dashboard document 
                // as start reading date 
                var newDashboard = new Dashboard({
                    type : 'start reading',
                    user_id: userid,
                    book_id : book_id,
                    update_on : new Date()
                });
                
                newDashboard.save((err) => {
                    if (err) console.dir(err);
                });
                
                
                
            })
        }
        
    });
    
});


/**
 * mark book as read
 */
router.post('/read', function(req, res, next){
    if(!req.body.book_id) {
        return res.status(400).json({message : "Bad request"});
    }
    
    var book_id = req.body.book_id;
    
    // [async] remove progress of the book if any
    // TODO TODO TODO
     
});


/**
 * test route
 */
router.get('/test', function(req, res, next){
    var author;
    
    if(author){
        res.json({message : "author found!"});
    } else {
        res.json({message : "check successful"});
    }
});



module.exports = router;