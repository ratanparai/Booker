var express = require('express');
var router = express.Router();

var Book = require('../models/book');
var User = require('../models/user')
var Author = require('../models/author')
var Comment = require('../models/comment');
var Progress = require('../models/progress');


/* GET home page. */
router.get('/:id', function(req, res, next){
    // loggedin Info
    var loginInfo = {};
    
    if(req.session.username) {
        console.log('user logged in ' + req.session.username);
        loginInfo.loggedin = true;
        loginInfo.username = req.session.username;
    } else {
        console.log('no user is logged in');
    }
    
    // TODO show profile page
    var book_id = req.params.id;
    // find a book
    Book.findOne({_id : book_id}, function (err, book) {
        if(err) return console.dir(err);
        
        if(book){
            Author.findOne({goodreads_id: book.author_id}, function(err, author){
                if(err) return console.log(err);
                
                
                // search for comments
                Comment.find({book_id : book_id}, function(err, comment){
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
                            
                            
                            //console.log(progresses.user_id.name);
                            
                            res.render('book', {
                                title : book.title,
                                bookinfo: book,
                                author : author,
                                loginInfo : loginInfo,
                                comments : comment,
                                progresses : progresses
                            });
                        });
                            
                    
                    
                    
                });
                
                
            });
            
        } else {
            res.send('no book found');
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
            
            res.redirect('/book/' + book_id);
        });
        
        
        
    } else {
        res.redirect('/users/login')
    }
    
    
    
});

module.exports = router;
