/**
 * Created by Brent on 8/19/2015.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sensor = new Schema({
    id: String,
    Index: Number,
    name: String,
    Identifier: String,
    Type: Number,
    Lat: Number,
    Lon: Number,
    Alt: Number,
    BoresightAz: Number,
    NumWeaponIDs: Number,
    WeaponIDs: [],
    KFactorClass: Number,
    KFactorType: Number,
    KFactorID: Number,
    Fixed: Number,
    minEl: Number,
    maxEl: Number,
    max_Range: Number,
    boresight_Half_Ang_Az: Number,
    boresight_Half_Ang_El: Number,
    nFaces: Number,
    minRng: Number,
    boresightEl: Number,
    latlonalt: []
});

mongoose.model('sensor', sensor, 'sensor');
