var express = require('express');
var goodreads = require('../models/goodreads');
var router = express.Router();

// temp var
var fs = require('fs');

router.get('/', function(req, res, next){
    
    goodreads.searchBook(req.query.query, function (err, res) {
        if(err) next(err);
        fs.writeFile('response', res, function(err){
            if (err) throw err;
            
            console.log('the file is saved');
        });
        var resultObj = JSON.parse(res);
        
        var books = resultObj.GoodreadsResponse.search[0].results[0].work;
        
        // console.log(books[0].best_book[0].id[0]._);
        // console.log(books.length);
        
        var i;
        for (i=0; i<books.length; i++) {
            var singleBook;
            console.log(books[i].best_book[0].title[0]);
        }        
        // console.dir(resultObj.GoodreadsResponse.search[0].results[0].work[1].best_book[0].id[0]._);
        
    });
    
    res.render('search', {
        title : 'search',
        query : req.query.query,
        loginInfo : {}
    });
});



module.exports = router;