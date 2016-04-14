var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// create a Schema
var readSchema = new Schema({
   book_goodreads_id : Number,
   user_id :{type: Schema.Types.ObjectId, ref: 'User'},
   date : Date
});

// the schema is useless untill a model is created 
var Read = mongoose.model('Read', readSchema);


// make this available to our Node application
module.exports = Read;