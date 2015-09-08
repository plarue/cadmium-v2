/**
 * Created by Brent on 5/7/2015.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var radarTypes = new Schema({
    id: Number,
    name: String,
    minEl: Number,
    max_Range: Number,
    boresight_Half_Ang_Az: Number,
    boresight_Half_Ang_El: Number,
    prf_FC: Number,
    dt_Track: Number,
    sig_Bias_Ang_rads: Number,
    sig_Meas_Ang_rads: Number,
    sig_Meas_Rng: Number,
    sig_Pos_Min: Number,
    sig_Vel_Min: Number,
    sig_Pos: Number,
    sig_Vel: Number,
    dt_Deploy_Det: Number,
    dt_Disc: Number,
    disc_Fro: Number,
    esa: Number,
    nFaces: Number,
    minRng: Number,
    offBorCosPwr: Number,
    snrDetThr: Number,
    schRate: Number,
    refSigAngNoise: Number,
    sigAngMin: Number,
    sigAngRelErrBias: Number,
    rngRes: Number,
    refRCS: Number,
    refRng: Number,
    refSNR: Number,
    trkFcLd: Number,
    fc_snsr: Number,
    maxEl: Number,
    boresightEl: Number
});

mongoose.model('radarTypes', radarTypes, 'radarTypes');
