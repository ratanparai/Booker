var http = require('http');
var xml2js = require('xml2js');
var Book = require('./book');
var Author = require('./author');

var request = require('request');


var parser = new xml2js.Parser();

var fs = require('fs');

// defining goodreads class

function goodreads() {
    this.url = 'http://www.goodreads.com/';
    this.key = 'UjHuPLcxhDSVaOE70UMJeg';
}

goodreads.prototype.searchBook = function (query, cb) {
    var requestUrl = this.url + 'search/index.xml?q=' + query + '&key=' + this.key;
    // console.log('sending query ' + query);
    http.get(requestUrl, function(res){
        var body = '';
        
        res.on('data', function (chunk) {
            body += chunk;
        });
        
        res.on('end', function () {
            parser.parseString(body, function(err, result){
                if(err) return cb(err);
                
                var jsonResult = JSON.stringify(result);
                return cb(null, jsonResult);
                
            });
        })
    }).on('error', function (err) {
        return cb(err);
    });
}

goodreads.prototype.getBookInfo = function(goodreadId, cb) {
    var requestUrl = this.url + 'book/show.xml?id=' + goodreadId + '&key=' + this.key;
    
    http.get(requestUrl, function(res){
        var body = '';
        
        res.on('data', function(chunk){
            body += chunk;
        });
        
        res.on('end', function(){
            parser.parseString(body, function(err, result){
                if (err) return cb(err);
                
                //console.log(result);
                //console.log("===========================");
                //console.log("===========================");
                
                var jsonResult = JSON.stringify(result);
                return cb(null, jsonResult);
            });
        });
        
    }).on('error', function (err) {
        return cb(err);
    })
}


/**
Get the reviews for a book given a title string
Get an xml response that contains embed code for the iframe reviews widget, which shows an excerpt (first 300 characters) of the most popular reviews of a book for a given title/author. The book shown will be the most popular book that matches all the keywords in the input string. The reviews are from all known editions of the book. 
URL: https://www.goodreads.com/book/title.FORMAT    (sample url) 
HTTP method: GET 
Parameters: 
format: xml or json
key: Developer key (required).
title: The title of the book to lookup.
author: The author name of the book to lookup. This is optional, but is recommended for accuracy.
rating: Show only reviews with a particular rating (optional)

https://www.goodreads.com/book/title.xml?author=Arthur+Conan+Doyle&key=UjHuPLcxhDSVaOE70UMJeg&title=Hound+of+the+Baskervilles
 */
goodreads.prototype.findBook = function(title, author, cb) {
    var requestUrl = this.url + 'book/title.xml?title='+ encodeURIComponent(title) +"&key=" + this.key;
    
    if(author) {
        requestUrl += requestUrl + '&author=' + encodeURIComponent(author);
    }
    
    //console.log(requestUrl);
    
    http.get(requestUrl, function(res){
        var body = '';
        
        res.on('data', function(chunk){
            body += chunk;
        });
        
        res.on('end', function(){
            parser.parseString(body, function(err, result){
                if (err) return cb(err);
                
                var jsonResult = JSON.stringify(result);
                return cb(null, jsonResult);
            });
        });
        
    }).on('error', function (err) {
        return cb(err);
    })
}

/**
 * Save a single book info into database
 */

goodreads.prototype.saveSingleBookInfo = function(jsonResponse, cb) {
    var resObj = JSON.parse(jsonResponse);
    
    try {
        var bookInfo = resObj.GoodreadsResponse.book[0];
    
        var singleBook = {};
        
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
        
    } catch (error) {
        console.log(error);
        var cusError = new Error("Book not found");
        cusError.status = 404;
        
        return cb(cusError);
    }
    
    
    console.log('Author image is ' + singleBook.authorImage)
    
    Book.findOne({goodreads_id : singleBook.goodreads_id}, function (err, findBookRes){
        if(err) return console.dir(err);
        
        if(findBookRes){
            return cb(null, findBookRes);
        } else {
            // save book information
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
                if(err) return cb(err);
                
                console.log("Book info saved");
                // Download image to local directory
                request(book.image, {encoding : 'binary'}, function(err, res, body){
                    fs.writeFile('./public/images/books/' + book._id + '.jpg', body, 'binary', function(err){
                        if(err) console.dir(err);
                        
                        console.log("Saved " + book.image);
                    });
                });
                
                cb(null, newBook);
                
            });
            
            var newAuthor = new Author({
                name : singleBook.authorName,
                goodreads_id : singleBook.authorId,
                image : singleBook.authorImage
            });
            
            newAuthor.save(function(err, author){
                if(err) console.dir(err);
                
                request(author.image, {encoding : 'binary'}, function(err, res, body){
                    if(err) console.dir(err);
                    
                    fs.writeFile('./public/images/authors/' + author._id + '.jpg', body, 'binary', function(err){
                        if(err) console.dir(err);
                        
                        console.log("Saved " + author.image);
                    });
                    
                });
            });
            
            
        }
        
    });

    //console.dir(singleBook)
    //listOfBooks.push(singleBook);
    
    

}

/**
 * CLEAN METHOD FOR ADDING BOOK
 */
goodreads.prototype.addBookUsingGoodreadsId = function(goodreads_id, cb){
    var requestUrl = this.url + "book/show/" + goodreads_id + ".xml?key="+this.key ;
    
    http.get(requestUrl, function(xmlRes){
        var body = '';
        
        xmlRes.on('data', function(chunk){
            body += chunk;
        });
        
        xmlRes.on('end', function(){
            parser.parseString(body, function(err, result){
                if (err) console.dir(err);
                
                var jsonResult = JSON.stringify(result);
                
                // now process json response
                new goodreads().saveSingleBookInfo(jsonResult, function(err){
                    if(err) console.dir(err);
                    
                    console.log("Book information successfully saved");
                });
            });
        });
        
    }).on('error', function (err) {
        return console.dir(err);
    })
};


// take a book object with all information and update local database as needed
goodreads.prototype.updateLocal = function(book, cb) {
    // check if the book is already in local database
    
    // if it is in the local database then skip rest of the work and enjoy
    
    // If the book is not in local database then insert the book info to local databse
    
    // download and save the image using the book insert _id file name
    
    // insert author info into author database if its not already inserted
}

var GR = new goodreads();

module.exports = GR;