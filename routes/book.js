var express = require('express');
var router = express.Router();

var Book = require('../models/book');
var User = require('../models/user')
var Author = require('../models/author')
var Comment = require('../models/comment');
var Progress = require('../models/progress');
var Read = require('../models/read');

var moment = require('moment');


/* GET home page. */
router.get('/:id', function(req, res, next){
    // loggedin Info
    var loginInfo = {};
    
    if(req.session.username) {
        //console.log('user logged in ' + req.session.username);
        loginInfo.loggedin = true;
        loginInfo.username = req.session.username;
    } else {
        //console.log('no user is logged in');
    }
    
    // TODO show profile page
    var book_id = req.params.id;
    // find a book
    Book.findOne({_id : book_id}, function (err, book) {
        if(err) {
            console.dir(err);
            return next();
        }
        
        if(book){
            Author.findOne({_id: book.author_id}, function(err, author){
                if(err) return console.log(err);
                
                
                // search for comments
                Comment
                    .find({book_id : book_id})
                    .populate('user_id')
                    .exec(function(err, comment){
                        if(err) return console.dir(err);
                    
                        
                        // Friendship
                        //     .find({user1 : userResult._id})
                        //     .populate('user2')
                        //     .exec(function(err, followers){
                        //         if (err) return console.log(err);
                        
                        Progress
                            .find({book_id:book._id})
                            .populate('user_id')
                            .exec(function(err, progresses){
                                if (err) return  console.dir(err);
                                
                                Read.findOne({user_id : req.session.userid, book_id : book_id}, (err, readResult) => {
                                    if (err) return console.dir(err);
                                    
                                    Read
                                        .find({book_id : book_id})
                                        .populate('user_id')
                                        .exec((err, readers) => {
                                            
                                            res.render('book', {
                                                title : book.title,
                                                bookinfo: book,
                                                author : author,
                                                loginInfo : loginInfo,
                                                comments : comment,
                                                progresses : progresses,
                                                moment : moment,
                                                read : readResult,
                                                readers : readers
                                            });
                                            
                                        });
                                    
                                    
                                });
                                //console.log(progresses.user_id.name);
                                
                                
                            });

                });
                
                
            });
            
        } else {
            next();
        }
        
    }) 
});

router.post('/comment', function(req, res, next){
    // set info about loggedin user
    var loginInfo = {};
    
    if(req.session.username) {
        // console.log('user logged in ' + req.session.username);
        loginInfo.loggedin = true;
        loginInfo.username = req.session.username;
        
        // get comment and save to database
        var book_id = req.body.book_id;
        var text_comment = req.body.text_comment;
        
        var newComment = new Comment({
            book_id : book_id,
            user_id : req.session.userid,
            user_fullname: req.session.fullname,
            comment : text_comment,
            comment_on : new Date(),
            like_count : 0
        });
        
        newComment.save(function(err){
            if (err) return console.log(err);
            
            res.redirect('back');
        });
        
        
        
    } else {
        res.redirect('/users/login')
    }
    
    
    
});

module.exports = router;
