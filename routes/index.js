var express = require('express');
var router = express.Router();
var path = require('path');

// middleware that is specific to this router
router.get('/', function(req, res, next) {
  var index = path.join(__dirname, '../public/views/index.html');
  res.sendFile(index);
});

module.exports = router;