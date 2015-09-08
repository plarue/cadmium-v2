/**
 * Created by Brent on 4/28/2015.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var asset = mongoose.Schema({
    id: String,
    name: String,
    Index: String,
    owner: String,
    valexp: Number,
    height: Number,
    shape: String,
    rad: Number,
    latlonalt: []
}, { id: false });

mongoose.model('asset', asset, 'asset');
