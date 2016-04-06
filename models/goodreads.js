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

var GR = new goodreads();

module.exports = GR;