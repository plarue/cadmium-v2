/**
 * Created by Brent on 6/1/2015.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var track = new Schema({
    id: String,
    name: String,
    times: [],
    positions: [],
    velocity: [],
    colors: [],
    rcs: Number,
    cType: String,
    create: String
},{ id: false });

mongoose.model('track', track, 'track');
