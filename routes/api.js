var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    var message;
    message = "Error! Not implemented";
    res.json(message);
});

module.exports = router;