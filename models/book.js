var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// create a Schema
var bookSchema = new Schema({
   title : String,
   goodreads_id : {type: Number, unique : true},
   isbn : String,
   isbn13 : String,
   author_id : String,
   image : String,
   publication_date : Date,
   language : String,
   description : String,
   total_rating : Number,
   total_vote : Number
});

// the schema is useless untill a model is created 
var Book = mongoose.model('Book', bookSchema);


// make this available to our Node application
module.exports = Book;