var express = require('express');
var router = express.Router();

var Progress = require('../models/progress');
var Book = require('../models/book');
var _ = require('underscore');

router.get('/', function(req, res, next){
    
    var loginInfo = {};
    
    if(req.session.username) {
        //console.log('user logged in ' + req.session.username);
        loginInfo.loggedin = true;
        loginInfo.username = req.session.username;
    } else {
        //console.log('no user is logged in');
    }
    
    
    Progress
        .aggregate([
            {
                "$group" : {
                    "_id" : "$book_id",
                    "count" : {"$sum": 1}
                }
            }
         ], function (err, result) {
             if (err) return res.json({error: err});
             
             var sortedResult = _.sortBy(result, 'count');
             
             var sortedResult = sortedResult.reverse(sortedResult);
             console.log(sortedResult);
             
             Book
                .find()
                .where('_id').in(sortedResult)
                .exec(function(err, bookRes){
                    if(err) return res.json({error: err});
                    
                    
                    
                    res.render('books',{
                        books : bookRes,
                        title : 'Popular books',
                        loginInfo : loginInfo
                    });
                    
                });
             
             //res.json(sortedResult);
        })
    
    //res.json({data: 'sample data'});
});

module.exports = router;