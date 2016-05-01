var express = require('express');
var router = express.Router();

var Author = require('../models/author');
var Book = require('../models/book');
var Goodreads = require('../models/goodreads');

var addMissingBooks = function(book) {
    // save book info and send push update
    
}

router.get('/:author_id', (req, res, next) => {
    
    var loginInfo = {};
    
    if(req.session.username) {
        //console.log('user logged in ' + req.session.username);
        loginInfo.loggedin = true;
        loginInfo.username = req.session.username;
    } else {
        //console.log('no user is logged in');
    }
    
    var authorId = req.params.author_id;
    console.log(authorId);
    
    Author.findOne({_id : authorId}, (err, authorRes) => {
        if (err) return res.json({err : err});
        
        if (authorRes.description) {
            
            Book.find({author_id : authorRes.goodreads_id}, (err , bookRes) => {
                if(err) return res.send(err);
                
                res.render('author',{
                    author : authorRes,
                    books : bookRes,
                    loginInfo : loginInfo
                });
                
            })
            
        } else {
            Goodreads.getAuthorInfo(authorRes.goodreads_id, (err, authorGoodreadsRes) => {
                if(err) return res.json({err: err});
                
                var goodreadsAuthorInfo = JSON.parse(authorGoodreadsRes);
                
                var authorInfo = goodreadsAuthorInfo.GoodreadsResponse.author[0];
                authorRes.description = authorInfo.about[0];
                authorRes.save((err, docAuthor) => {
                    if (err) return res.json(err);
                    
                    Book.find({author_id : docAuthor.goodreads_id}, (err , bookRes) => {
                        if(err) return res.send(err);
                        
                        res.render('author',{
                            author : docAuthor,
                            books : bookRes,
                            loginInfo : loginInfo
                        });
                        
                    })

                    
                })
                
                // res.send(JSON.stringify(authorInfo.about[0]));
                
            });
        }
    });
    
    
})


module.exports = router;