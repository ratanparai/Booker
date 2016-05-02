var express = require('express');
var goodreads = require('../models/goodreads');
var Book = require('../models/book');
var User = require('../models/user')
var Author = require('../models/author')

var router = express.Router();

var request = require('request');
var fs = require('fs');

var upload = require('../models/imageupload');


router.get('/', function(req, res, next){
    var listOfBooks = [];
    
    var loginInfo = {};

    if(req.session.username) {
        //console.log('user logged in ' + req.session.username);
        loginInfo.loggedin = true;
        loginInfo.username = req.session.username;
    } else {
        //console.log('no user is logged in');
    }
    
    console.log("initializing goodread search");
    goodreads.searchBook(req.query.query, function (err, res) {
        if(err) return console.log(err);
        
        var resultObj = JSON.parse(res);
        
        console.log("Goodreads response of the search term recieved.");
        
        if(typeof resultObj.GoodreadsResponse !== 'undefined') {
            
            var books = resultObj.GoodreadsResponse.search[0].results[0].work;
        
            // console.log(books[0].best_book[0].id[0]._);
            // console.log(books.length);
            
            // show only 6 books
            
            
            if(!books) return console.log('no book found in goodreads');
            
            console.log("Goodreads response have at least one book.");
            
            var maxLoop = books.length;

            var step = function(x) {
                if(x<maxLoop) {
                    
                    console.log("processing first book");
                    
                    var singleBook = {};
                    
                    var goodreads_id = books[x].best_book[0].id[0]._;
                    
                    // check if this book is in database or not
                    Book.findOne({goodreads_id: goodreads_id}, (err, bookRes) => {
                        if (err) {
                            console.log(err);
                            return step(x+1);
                        };
                        
                        if(bookRes) {
                            // book is alreay in database 
                            // go to next book
                            console.log("Book is already in database. Trying next book.");
                            return step(x+1);
                        } else {
                            // No book found in database so save book info 
                            console.log("Book not in databse. Processing....");
                            // at first get details book information using goodreads models
                            goodreads.getBookInfo(goodreads_id, (err, singleBookRes) => {
                                if (err) {
                                    console.log(err);
                                    return step(x+1);
                                }
                                
                                console.log("Single Book info received from Goodreads API.");
                                
                                var resObj = JSON.parse(singleBookRes);
                                
                                if(typeof resObj.GoodreadsResponse != 'undefined') {
                                    console.log("received single book info: Successful");
                                    // get author id 
                                    var bookInfo = resObj.GoodreadsResponse.book[0];
                                    
                                    
                                    var author_goodreads_id = bookInfo.authors[0].author[0].id[0];
                                    
                                    // check if author is alreay in database if not add it
                                    Author.findOne({goodreads_id: author_goodreads_id}, (err, findAuthorRes) => {
                                        if (err) {
                                            console.log(err);
                                            return step(x+1);
                                        }
                                        
                                        var singleBook = {};
                                        
                                        if (findAuthorRes) {
                                            console.log("Author already in database.");
                                            var bookInfo = resObj.GoodreadsResponse.book[0];
                                            console.dir(bookInfo);
                                         
                                            // author found so add book information
                                            singleBook.authorId = findAuthorRes._id;
                                            
                                            
                                
                                            // create single book object with all of the information
                                            singleBook.title = resObj.GoodreadsResponse.book[0].title[0];
                                            
                                            console.dir(bookInfo);
                                            
                                            singleBook.goodreads_id = bookInfo.id[0];
                                            singleBook.isbn = bookInfo.isbn[0];
                                            singleBook.isbn13 = bookInfo.isbn13[0];
                                            //singleBook.authorId = bookInfo.authors[0].author[0].id[0];
                                            singleBook.authorName = bookInfo.authors[0].author[0].name[0];
                                            singleBook.bookImage = bookInfo.image_url[0];
                                            singleBook.authorImage = bookInfo.authors[0].author[0].image_url[0]._;
                                            singleBook.description = bookInfo.description[0];
                                            singleBook.publicationYear = bookInfo.publication_year[0];
                                            singleBook.language = bookInfo.language_code[0];
                                            
                                            var newBook = new Book({
                                                    title : singleBook.title,
                                                    goodreads_id : singleBook.goodreads_id,
                                                    isbn : singleBook.isbn,
                                                    isbn13 : singleBook.isbn13,
                                                    author_id : singleBook.authorId,
                                                    author_name : singleBook.authorName,
                                                    image : singleBook.bookImage,
                                                    publication_date : singleBook.publicationYear,
                                                    language : singleBook.language,
                                                    description : singleBook.description
                                            });
                                            
                                            newBook.save(function(err, book){
                                                if (err) {
                                                    console.log(err);
                                                    return step(x+1);
                                                }
                                                
                                                // now upload image 
                                                upload.upload(book.image, book._id, 'book', (err) => {
                                                    if (err) {
                                                        console.log(err);
                                                        return step(x+1);
                                                    }   
                                                    
                                                    // all things done because author info is already
                                                    // in database so publish and go to next step
                                                    var resToPub = {
                                                        search : {
                                                            id : book._id,
                                                            title: book.title
                                                        }
                                                    }
                                                    
                                                    pub.publish('session.'+req.session.id , JSON.stringify(resToPub));
                                                    
                                                    return step(x+1);
                                                    
                                                });
                                                
                                            });
                                            
                                        } else {
                                            // no author found
                                            // add author and do rest of the work
                                            
                                            var bookInfo = resObj.GoodreadsResponse.book[0];
                                            
                                            
                                            
                                            var newAuthor = new Author({
                                                name : bookInfo.authors[0].author[0].name[0],
                                                goodreads_id : bookInfo.authors[0].author[0].id[0],
                                                image : bookInfo.authors[0].author[0].image_url[0]._
                                            });
                                            
                                            newAuthor.save(function(err, author){
                                                if(err) {
                                                    console.log(err);
                                                    return step(x+1);
                                                }
                                                
                                                // now copy paste everything
                                                
                                                // create single book object with all of the information
                                                singleBook.title = resObj.GoodreadsResponse.book[0].title[0];
                                                singleBook.goodreads_id = bookInfo.id[0];
                                                singleBook.isbn = bookInfo.isbn[0];
                                                singleBook.isbn13 = bookInfo.isbn13[0];
                                                singleBook.bookImage = bookInfo.image_url[0];
                                                singleBook.authorImage = bookInfo.authors[0].author[0].image_url[0]._;
                                                singleBook.description = bookInfo.description[0];
                                                singleBook.publicationYear = bookInfo.publication_year[0];
                                                singleBook.language = bookInfo.language_code[0];
                                                
                                                var newBook = new Book({
                                                        title : singleBook.title,
                                                        goodreads_id : singleBook.goodreads_id,
                                                        isbn : singleBook.isbn,
                                                        isbn13 : singleBook.isbn13,
                                                        author_id : author._id,
                                                        author_name : singleBook.authorName,
                                                        image : singleBook.bookImage,
                                                        publication_date : singleBook.publicationYear,
                                                        language : singleBook.language,
                                                        description : singleBook.description
                                                });
                                                
                                                newBook.save(function(err, book){
                                                    if (err) {
                                                        console.log(err);
                                                        return step(x+1);
                                                    }
                                                    
                                                    // now upload image 
                                                    upload.upload(book.image, book._id, 'book', (err) => {
                                                        if (err) {
                                                            console.log(err);
                                                            return step(x+1);
                                                        }   
                                                        
                                                        // all things done because author info is already
                                                        // in database so publish and go to next step
                                                        var resToPub = {
                                                            search : {
                                                                id : book._id,
                                                                title: book.title
                                                            }
                                                        }
                                                        
                                                        pub.publish('session.'+req.session.id , JSON.stringify(resToPub));
                                                        
                                                        
                                                        
                                                    });
                                                    
                                                });
                                                
                                                
                                                // download author image 
                                                upload.upload(author.image, author._id, 'author', (err) => {
                                                    if (err) {
                                                        console.log(err);
                                                        return step(x+1);
                                                    }
                                                    
                                                    return step(x+1);
                                                });            
                                                
                                            });
                                            
                                        }
                                        
                                    });

                                    
                                } else {
                                    return step(x+1);
                                }
                                
                            });
                        }
                    });
                }
            }
            step(0);
        }
    });
            
    var searchTerm = req.query.query;
    
    var regEx = new RegExp(searchTerm, 'i');
    
    Book.find({title: regEx}, function(err, result){
        if(err) return console.dir(err);
        
        Author.find({name : regEx}, function(err, authResult){
            if(err) return console.dir(err);
            
            // search users
            User.find({name : regEx}, function(err, userResult){
                if (err) return console.dir(err);
                
                // callback hell, here i come
                var loginInfo = {};

                if(req.session.username) {
                    //console.log('user logged in ' + req.session.username);
                    loginInfo.loggedin = true;
                    loginInfo.username = req.session.username;
                } else {
                    //console.log('no user is logged in');
                }
                
                
                // console.dir('The result is : ' + result);
                res.render('search', {
                    title : 'search',
                    query : req.query.query,
                    loginInfo : loginInfo,
                    books : result,
                    authors: authResult,
                    users : userResult,
                    searchTerm : searchTerm
                });
                
            });
            
            
        });
        
        
            
        
    });
    
    
});





module.exports = router;