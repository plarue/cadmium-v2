/**
 * Created by Brent Shanahan on 5/28/2015.
 */
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('Index', { title: 'Cadmium' });
});

module.exports = router;
