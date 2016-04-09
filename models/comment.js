var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// create a Schema
var commentSchema = new Schema({
   book_id : String,
   user_id : String,
   user_fullname : String,
   comment : String,
   comment_on: Date,
   like_count : Number
});

// the schema is useless untill a model is created 
var Comment = mongoose.model('Comment', commentSchema);


// make this available to our Node application
module.exports = Comment;