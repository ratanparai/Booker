var express = require('express');
var router = express.Router();

var Book = require('../models/book');
var User = require('../models/user')
var Author = require('../models/author')
var Comment = require('../models/comment');
var Progress = require('../models/progress');
var Read = require('../models/read');
var Rating = require('../models/rating'); 
var Dashboard = require('../models/dashboard');

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
                                            
                                            if (req.session.userid) {
                                                
                                                Rating.findOne({user_id : req.session.userid, book_id : book_id},(err, rateRes)=>{
                                                    if (err) console.log(err);
                                                    
                                                    console.dir(rateRes);
                                                    
                                                    if (rateRes) {
                                                        res.render('book', {
                                                            title : book.title,
                                                            bookinfo: book,
                                                            author : author,
                                                            loginInfo : loginInfo,
                                                            comments : comment,
                                                            progresses : progresses,
                                                            moment : moment,
                                                            read : readResult,
                                                            readers : readers,
                                                            myrating : rateRes.rating
                                                        });
                                                    } else {
                                                        rating = 0;
                                                        res.render('book', {
                                                            title : book.title,
                                                            bookinfo: book,
                                                            author : author,
                                                            loginInfo : loginInfo,
                                                            comments : comment,
                                                            progresses : progresses,
                                                            moment : moment,
                                                            read : readResult,
                                                            readers : readers,
                                                            myrating : rating
                                                        });
                                                    }
                                                    
                                                });
                                            } else {
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
                                            }
                                            
                                            
                                            
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
            
            
            var newDashboard = new Dashboard({
                type : 'review',
                user_id : req.session.userid,
                book_id: book_id,
                update_on : new Date()
            });
            
            newDashboard.save((err, doc) => {
                if (err) console.log(err);
                
                var opts = [
                    {path: 'book_id', model:'Book'},
                    {path:'user_id', model:'User'}
                ]
                
                Read
                    .populate(doc, opts, (err, progResult) => {
                        if (err) console.dir(err);
                        
                        
                        // now publish to required channels
                        
                        var pubToProg = {
                            review : progResult
                        }
                        
                        pub.publish(req.session.userid, JSON.stringify(pubToProg));
                    } )
                
            });    
        });
        
        
        
    } else {
        res.redirect('/users/login')
    }
    
    
    
});

router.post('/rate', (req, res, next) => {
    var rating = req.body.rating;
    var book_id = req.body.book_id;
    var user_id = req.session.userid;
    
    console.log(book_id + ' rate ' + rating);
    
    Rating.remove({book_id : book_id, user_id : user_id}, (err) => {
        if (err) console.log(err);
        
        var newRating = new Rating({
            book_id : book_id,
            user_id : user_id,
            rating : rating
        });
        
        newRating.save((err)=> {
            if (err) console.log(err);
            
            
            // update total rating of the book
            Rating.find({book_id : book_id}, (err, docs) => {
                if (err) console.log(err);
                
                // console.dir(docs);
                var totalRateCount = docs.length;
                console.log('total Rate found ' + totalRateCount );
                
                var sum = 0;
                for (var i = 0; i<totalRateCount; i++) {
                    console.dir(docs[i].rating);
                    sum += docs[i].rating;
                }
                
                
                console.log("total rating" + sum);
                
                Book.findByIdAndUpdate(book_id, {total_rating: sum, total_vote : totalRateCount }, (err) => {
                   if (err) console.dir(err); 
                });
                
            });
            
            
        });
        
    });
    
    res.json({message : 'received'});
    
    
    
});

module.exports = router;
