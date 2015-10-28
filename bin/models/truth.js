/**
 * Created by Brent on 10/23/2015.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var truth = new Schema({
    hdr: [],
    id: String,
    name: String,
    times: [],
    positions: [],
    velocity: [],
    color: {},
    rcs: Number,
    tValid: Number,
    beta: Number,
    radIntensity: Number,
    identity : String,
    classification: String,
    lastThreatTruth: Boolean,
    cType: String,
    create: String,
    sysTrkID: Number,
    leadSrcID: Number,
    truthID: Number,
    cov: [],
    type: String,
    friendHostile: String,
    pLethal: Number,
    urgency: Number,
    ballisticCoef: Number,
    dropped: Boolean
},{ id: false });

mongoose.model('truth', truth, 'truth');