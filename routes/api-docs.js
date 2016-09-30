var express = require('express');
var router = express.Router();
var conf = require('../config');

router.get('/', function(req, res, next) {
  res.render('index.html', { host: conf.swagger.definition.host });
});

module.exports = router;