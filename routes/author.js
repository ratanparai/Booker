var express = require('express');
var router = express.Router();

var Author = require('../models/author');
var Book = require('../models/book');
var Goodreads = require('../models/goodreads');

var request = require('request');
var fs = require('fs');

var addMissingBooks = function(books, req, author_id) {
    // save book info and send push update
    console.log(books[0]);
    
    var step = function(x){
        if (x < books.length) {
            
            var thisBook = books[x];
            
            var goodreads_id = thisBook.id[0]._;
        
            var imageUrl = thisBook.image_url[0];
            
            console.log(imageUrl);
            
            var makeItLargeLocation = imageUrl.indexOf("m/", 30);
            if(makeItLargeLocation === -1) {
                var newImage = imageUrl;
            } else {
                var newImage = imageUrl.substr(0, makeItLargeLocation) + 'l' + imageUrl.substr(makeItLargeLocation+1);
            }
            
            
            console.log(newImage);
            
            Book.findOne({goodreads_id : goodreads_id}, (err, docBook) => {
                if (err) return step(x+1);
                
                if (!docBook) {
                    
                    console.log("Book is not in database : " + thisBook.title[0]);
                    console.dir(thisBook.isbn[0]);
                    console.dir(thisBook.isbn13[0]);
                    
                    if(typeof thisBook.isbn[0].$ !== 'undefined') {
                        var isbn = '';
                    }
                    
                    if(typeof thisBook.isbn13[0].$ !== 'undefined') {
                        var isbn13 = '';
                    }
                    
                    
                    var saveBook = new Book({
                        title : thisBook.title[0],
                        goodreads_id : goodreads_id ,
                        isbn : isbn,
                        isbn13 : isbn13,
                        author_id : author_id, 
                        author_name : thisBook.authors[0].author[0].name[0],
                        image : newImage,
                        publication_date :thisBook.publication_year[0],
                        description : thisBook.description[0]
                    });
                    
                    saveBook.save((err, book) => {
                       if (err) {
                           console.log(err);
                           return step(x+1);
                       }
                       
                       // Download image to local directory
                       request(book.image, {encoding : 'binary'}, function(err, res, body){
                           fs.writeFile('./public/images/books/' + book._id + '.jpg', body, 'binary', function(err){
                               if(err) console.dir(err);
                               
                               
                               //console.log(book.image);
                               // socket.emit("new book in search", {id : book._id, title: book.title});
                               var resToPub = {
                                   authorProfile : {
                                       id : book._id,
                                       title: book.title
                                   }
                               }
                               pub.publish('author.' + author_id , JSON.stringify(resToPub));
                               
                               step(x+1);
                               
                           });
                       });
                       
                        
                    });
                    
                    // return step(x+1);
                    
                    
                } else {
                    return step(x+1);
                }
            });
            
        }
    }
    
    step(0);
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
        
        if(!authorRes) {
            return next();
        }
        
        if (authorRes.description) {
            
            Book.find({author_id : authorRes._id}, (err , bookRes) => {
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
                    
                    Book.find({author_id : docAuthor._id}, (err , bookRes) => {
                        if(err) return res.send(err);
                        
                        res.render('author',{
                            author : docAuthor,
                            books : bookRes,
                            loginInfo : loginInfo
                        });
                        
                    })

                    
                })
                
                // res.send(JSON.stringify(authorInfo.about[0]));
                setTimeout(function(){
                    addMissingBooks(authorInfo.books[0].book, req, authorId);
                }, 3000);
                
                
            });
        }
        
        
    });
    
    
})


module.exports = router;