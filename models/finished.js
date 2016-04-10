var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// create a Schema
var finishedSchema = new Schema({
   book_id : String,
   user_id : String,
   date : Date
});

// the schema is useless untill a model is created 
var Finished = mongoose.model('Finished', FinishedSchema);


// make this available to our Node application
module.exports = Finished;