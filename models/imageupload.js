var request = require('request');
var fs = require('fs');

var upload = function(){
    
};

upload.prototype.upload = function(url, id, type, cb) {
    
    var fileLocation;
    
    switch (type) {
        case 'book':
            fileLocation = './public/images/books/' + id + '.jpg';
            
            var makeItLargeLocation = url.indexOf("m/", 30);
            if(makeItLargeLocation !== -1) {
                url = url.substr(0, makeItLargeLocation) + 'l' + url.substr(makeItLargeLocation+1);
            } 
            
            break;
        
        case 'author':
            fileLocation = './public/images/authors/' + id + '.jpg';
            break;
    
        default:
            cb(new Error("Image type not recognize"));
            break;
    }
    
    request(url, {encoding : 'binary'}, function(err, res, body){
        fs.writeFile(fileLocation, body, 'binary', function(err){
            if (err) return cb(err);
            
            return cb(null);
        });
    });
}



imageUploader = new upload();

module.exports = imageUploader;