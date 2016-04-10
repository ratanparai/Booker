var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// create a Schema
var progressSchema = new Schema({
   book_id : String,
   user_id : String,
   percentage : Number,
   last_update : Date
});

// the schema is useless untill a model is created 
var Progress = mongoose.model('Progress', progressSchema);


// make this available to our Node application
module.exports = Progress;