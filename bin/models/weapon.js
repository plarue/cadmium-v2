/**
 * Created by Brent on 8/19/2015.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var weapon = new Schema({
    id: String,
    Index: Number,
    name: String,
    Identifier: String,
    Type: Number,
    Lat: Number,
    Lon: Number,
    Alt: Number,
    Boresight: Number,
    NumSensorIDs: Number,
    SensorIDs: [],
    Fixed: Number,
    minEl: Number,
    max_Range: Number,
    boresight_Half_Ang_Az: Number,
    boresight_Half_Ang_El: Number,
    nFaces: Number,
    minRng: Number,
    maxEl: Number,
    boresightEl: Number,
    latlonalt: []
});

mongoose.model('weapon', weapon, 'weapon');
