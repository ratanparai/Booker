var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// create a Schema
var authorSchema = new Schema({
   goodreads_id : String,
   name : Number,
   image : Number
});

// the schema is useless untill a model is created 
var Author = mongoose.model('Author', authorSchema);


// make this available to our Node application
module.exports = Author;