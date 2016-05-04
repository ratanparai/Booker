var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// create a Schema
var ratingSchema = new Schema({
   book_id : {type: Schema.Types.ObjectId, ref:'Book'},
   user_id : {type: Schema.Types.ObjectId, ref:'User'},
   rating : Number
});

// the schema is useless untill a model is created 
var Rating = mongoose.model('Rating', ratingSchema);


// make this available to our Node application
module.exports = Rating;