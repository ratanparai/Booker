var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// create a Schema
var dashboardSchema = new Schema({
   type : String,
   book_id : {type: Schema.Types.ObjectId, ref:"Book"},
   user_id : {type: Schema.Types.ObjectId, ref:"User"},
   update_on : Date
});

// the schema is useless untill a model is created 
var Dashboard = mongoose.model('Dashboard', dashboardSchema);


// make this available to our Node application
module.exports = Dashboard;