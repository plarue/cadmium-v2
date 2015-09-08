/**
 * Created by Brent on 5/28/2015.
 */
var express = require('express');
var app = module.exports = express();

app.get('/', function(req, res) {
  res.sendFile('index.html');
});
