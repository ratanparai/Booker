var express = require('express');
var goodreads = require('../models/goodreads');
var Book = require('../models/book');
var User = require('../models/user')
var Author = require('../models/author')

var router = express.Router();

var request = require('request');
var fs = require('fs');


router.get('/', function(req, res, next){
    var listOfBooks = [];
    
    var loginInfo = {};

    if(req.session.username) {
        console.log('user logged in ' + req.session.username);
        loginInfo.loggedin = true;
        loginInfo.username = req.session.username;
    } else {
        console.log('no user is logged in');
    }
    
    goodreads.searchBook(req.query.query, function (err, res) {
        if(err) return console.log(err);
        
        var resultObj = JSON.parse(res);
        console.dir(resultObj);
        
        if(typeof resultObj.GoodreadsResponse != 'undefined') {
            var books = resultObj.GoodreadsResponse.search[0].results[0].work;
        
            // console.log(books[0].best_book[0].id[0]._);
            // console.log(books.length);
            
            // show only 6 books
            
            
            if(!books) return console.log('no book found in goodreads');
            
            var maxLoop = 6;
            if (maxLoop > books.length) {
                maxLoop = books.length;
            }
            
            
            
            var i;
            for (i=0; i<maxLoop; i++) 
            {
                // single book object for storing information about a single book title
                var singleBook = {};
                
                var goodreads_id = books[i].best_book[0].id[0]._;
                
                
                //console.log('goodreads id of the processing book : ' + goodreads_id);
                
                goodreads.getBookInfo(goodreads_id, function(err, res){
                    if (err) next(err);
                            
                    //console.log(res);
                                            
                    var resObj = JSON.parse(res);
                    console.dir(resObj);
                    
                    console.log(res);
                    console.log("================================");
                    console.log("================================");
                    
                    if(typeof resObj.GoodreadsResponse != 'undefined') {
                        console.log("it is not undefined")
                        var bookInfo = resObj.GoodreadsResponse.book[0];
                    
                        singleBook.title = resObj.GoodreadsResponse.book[0].title[0];
                        singleBook.goodreads_id = bookInfo.id[0];
                        singleBook.isbn = bookInfo.isbn[0];
                        singleBook.isbn13 = bookInfo.isbn13[0];
                        singleBook.authorId = bookInfo.authors[0].author[0].id[0];
                        singleBook.authorName = bookInfo.authors[0].author[0].name[0];
                        singleBook.bookImage = bookInfo.image_url[0];
                        singleBook.authorImage = bookInfo.authors[0].author[0].image_url[0]._;
                        singleBook.description = bookInfo.description[0];
                        singleBook.publicationYear = bookInfo.publication_year[0];
                        singleBook.language = bookInfo.language_code[0];
                        
                        console.log('Author image is ' + singleBook.authorImage)
                        
                        // if there is no isbn number then ignore the book      
                        // FOR NOW
                        if(singleBook.isbn !== '') {
                            //console.dir(singleBook)
                            //listOfBooks.push(singleBook);
                            
                            // save book information
                            var newBook = new Book({
                                    title : singleBook.title,
                                    goodreads_id : singleBook.goodreads_id,
                                    isbn : singleBook.isbn,
                                    isbn13 : singleBook.isbn13,
                                    author_id : singleBook.authorId,
                                    image : singleBook.bookImage,
                                    publication_date : singleBook.publicationYear,
                                    language : singleBook.language,
                                    description : singleBook.description
                            });
                            
                            newBook.save(function(err, book){
                                if(err) return ;
                                
                                // Download image to local directory
                                request(book.image, {encoding : 'binary'}, function(err, res, body){
                                    fs.writeFile('./public/images/books/' + book._id + '.jpg', body, 'binary', function(err){
                                        if(err) console.dir(err);
                                        
                                        //console.log(book.image);
                                        socket.emit("new book in search", {id : book._id, title: book.title});
                                        
                                    });
                                });
                                
                            });
                            
                            var newAuthor = new Author({
                                name : singleBook.authorName,
                                goodreads_id : singleBook.authorId,
                                image : singleBook.authorImage
                            });
                            
                            newAuthor.save(function(err, author){
                                if(err) return ;
                                
                                request(author.image, {encoding : 'binary'}, function(err, res, body){
                                    if(err) console.dir(err);
                                    
                                    fs.writeFile('./public/images/authors/' + author._id + '.jpg', body, 'binary', function(err){
                                        if(err) console.dir(err);
                                        
                                        //console.log(book.image);
                                    });
                                });

                                
                                
                            });
                            
                            
                            
                            ///console.log(newBook._id);
                            
                            // newBook.save(function(err){
                            //     if(err) console.log(err);
                                
                            //     console.log('book inserted successfully');
                            // });
                        }
                    }
                    
                    
                    
                });
                
            } // end forloop  
        }
        
          
        // console.dir(resultObj.GoodreadsResponse.search[0].results[0].work[1].best_book[0].id[0]._);
        
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
                    console.log('user logged in ' + req.session.username);
                    loginInfo.loggedin = true;
                    loginInfo.username = req.session.username;
                } else {
                    console.log('no user is logged in');
                }
                
                
                // console.dir('The result is : ' + result);
                res.render('search', {
                    title : 'search',
                    query : req.query.query,
                    loginInfo : loginInfo,
                    books : result,
                    authors: authResult,
                    users : userResult
                });
                
            });
            
            
        });
        
        
            
        
    });
    
    
});





module.exports = router;