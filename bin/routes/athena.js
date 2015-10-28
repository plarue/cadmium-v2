/**
 * Created by Brent on 10/15/2015.
 */
var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Asset = require('../models/asset.js');
var RadarTypes = require('../models/radarTypes.js');
var Sensor = require('../models/sensor.js');
var Track = require('../models/track.js');
var Weapon = require('../models/weapon.js');
var WeaponTypes = require('../models/weaponTypes.js');

/* GET /asset listing. */
router.get('/', function(req, res, next) {
    Asset.find(function (err, assets) {
        if (err) return next(err);
        res.json(assets);
    });
});

/* POST /asset */
router.post('/', function(req, res, next) {
    Asset.create(req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* GET /asset/id */
router.get('/:id', function(req, res, next) {
    Asset.findById(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* PUT /asset/:id */
router.put('/:id', function(req, res, next) {
    Asset.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* DELETE /asset/:id */
router.delete('/:id', function(req, res, next) {
    Asset.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

module.exports = router;