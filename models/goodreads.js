var http = require('http');
var xml2js = require('xml2js');


var parser = new xml2js.Parser();

// defining goodreads class

function goodreads() {
    this.url = 'http://www.goodreads.com/';
    this.key = 'UjHuPLcxhDSVaOE70UMJeg';
}

goodreads.prototype.searchBook = function (query, cb) {
    var requestUrl = this.url + 'search/index.xml?q=' + query + '&key=' + this.key;
    console.log('sending query ' + query);
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
    
}

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