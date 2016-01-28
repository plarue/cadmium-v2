/**
 * Created by Brent Shanahan on 5/18/2015.
 */
//Server
var express = require('express');
var compression = require('compression');
var router = express.Router();
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var async = require('async');
var fs = require('fs');
var path = require('path');
var url = require('url');
var request = require('request');
var lazy = require('lazy');

//Bigio
var bigio = require('bigio');
var logger = require('winston');

//Mongo database
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/acquire');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Mongo connection error:'));

fs.readdirSync(__dirname + '/bin/models').forEach(function(filename) {
    if (~filename.indexOf('.js')) require(__dirname + '/bin/models/' + filename)
});

app.use(function(req,res,next) {
    req.db = db;
    next();
});

//db schema
var weaponTypes = mongoose.model('weaponTypes');
var radarTypes = mongoose.model('radarTypes');
var asset = mongoose.model('asset');
asset.remove({}, function(err) {
    if(err)console.log(err);
    console.log('Asset collection cleared')
});
var track = mongoose.model('track');
track.remove({}, function(err) {
    if(err)console.log(err);
    console.log('Track collection cleared')
});
var truth = mongoose.model('truth');
truth.remove({}, function(err) {
    if(err)console.log(err);
    console.log('Truth collection cleared')
});
var sensor = mongoose.model('sensor');
sensor.remove({}, function(err) {
    if(err)console.log(err);
    console.log('Sensor collection cleared')
});
var weapon = mongoose.model('weapon');
weapon.remove({}, function(err) {
    if(err)console.log(err);
    console.log('Weapon collection cleared')
});

//Express
var yargs = require('yargs').options({
    'port' : {
        'default' : 8080,
        'description' : 'Port to listen on.'
    },
    'public' : {
        'type' : 'boolean',
        'description' : 'Run a public server that listens on all interfaces.'
    },
    'upstream-proxy' : {
        'description' : 'A standard proxy server that will be used to retrieve data.  Specify a URL including port, e.g. "http://proxy:8000".'
    },
    'bypass-upstream-proxy-hosts' : {
        'description' : 'A comma separated list of hosts that will bypass the specified upstream_proxy, e.g. "lanhost1,lanhost2"'
    },
    'help' : {
        'alias' : 'h',
        'type' : 'boolean',
        'description' : 'Show this help.'
    }
});
var argv = yargs.argv;

if (argv.help) {
    return yargs.showHelp();
}

var mime = express.static.mime;
mime.define({
    'application/json' : ['czml', 'json', 'geojson', 'topojson'],
    'model/vnd.gltf+json' : ['gltf'],
    'model/vnd.gltf.binary' : ['bgltf', 'glb'],
    'text/plain' : ['glsl']
});

app.use(compression());
app.use('/public', express.static('public'));
app.use('/node_modules', express.static('node_modules'));
app.use('/views', express.static('views'));
var routes = require('./routes/index');
app.use('/', routes);

app.set('view engine', 'ejs');
app.set('port', process.env.PORT || 8080);

function getRemoteUrlFromParam(req) {
    var remoteUrl = req.params[0];
    if (remoteUrl) {
        // add http:// to the URL if no protocol is present
        if (!/^https?:\/\//.test(remoteUrl)) {
            remoteUrl = 'http://' + remoteUrl;
        }
        remoteUrl = url.parse(remoteUrl);
        // copy query string
        remoteUrl.search = url.parse(req.url).search;
    }
    return remoteUrl;
}

var dontProxyHeaderRegex = /^(?:Host|Proxy-Connection|Connection|Keep-Alive|Transfer-Encoding|TE|Trailer|Proxy-Authorization|Proxy-Authenticate|Upgrade)$/i;

function filterHeaders(req, headers) {
    var result = {};
    // filter out headers that are listed in the regex above
    Object.keys(headers).forEach(function(name) {
        if (!dontProxyHeaderRegex.test(name)) {
            result[name] = headers[name];
        }
    });
    return result;
}

var upstreamProxy = argv['upstream-proxy'];
var bypassUpstreamProxyHosts = {};
if (argv['bypass-upstream-proxy-hosts']) {
    argv['bypass-upstream-proxy-hosts'].split(',').forEach(function(host) {
        bypassUpstreamProxyHosts[host.toLowerCase()] = true;
    });
}

app.get('/proxy/*', function(req, res, next) {
    // look for request like http://localhost:8080/proxy/http://example.com/file?query=1
    var remoteUrl = getRemoteUrlFromParam(req);
    if (!remoteUrl) {
        // look for request like http://localhost:8080/proxy/?http%3A%2F%2Fexample.com%2Ffile%3Fquery%3D1
        remoteUrl = Object.keys(req.query)[0];
        if (remoteUrl) {
            remoteUrl = url.parse(remoteUrl);
        }
    }

    if (!remoteUrl) {
        return res.status(400).send('No url specified.');
    }

    if (!remoteUrl.protocol) {
        remoteUrl.protocol = 'http:';
    }

    var proxy;
    if (upstreamProxy && !(remoteUrl.host in bypassUpstreamProxyHosts)) {
        proxy = upstreamProxy;
    }

    // encoding : null means "body" passed to the callback will be raw bytes

    request.get({
        url : url.format(remoteUrl),
        headers : filterHeaders(req, req.headers),
        encoding : null,
        proxy : proxy
    }, function(error, response, body) {
        var code = 500;

        if (response) {
            code = response.statusCode;
            res.header(filterHeaders(req, response.headers));
        }

        res.status(code).send(body);
    });
});

function getRemoteUrlFromParam(req) {
    var remoteUrl = req.params[0];
    if (remoteUrl) {
        // add http:// to the URL if no protocol is present
        if (!/^https?:\/\//.test(remoteUrl)) {
            remoteUrl = 'http://' + remoteUrl;
        }
        remoteUrl = url.parse(remoteUrl);
        // copy query string
        remoteUrl.search = url.parse(req.url).search;
    }
    return remoteUrl;
}

var dontProxyHeaderRegex = /^(?:Host|Proxy-Connection|Connection|Keep-Alive|Transfer-Encoding|TE|Trailer|Proxy-Authorization|Proxy-Authenticate|Upgrade)$/i;

function filterHeaders(req, headers) {
    var result = {};
    // filter out headers that are listed in the regex above
    Object.keys(headers).forEach(function(name) {
        if (!dontProxyHeaderRegex.test(name)) {
            result[name] = headers[name];
        }
    });
    return result;
}

var bypassUpstreamProxyHosts = {};
app.get('/proxy/*', function(req, res, next) {
    // look for request like http://localhost:8080/proxy/http://example.com/file?query=1
    var remoteUrl = getRemoteUrlFromParam(req);
    if (!remoteUrl) {
        // look for request like http://localhost:8080/proxy/?http%3A%2F%2Fexample.com%2Ffile%3Fquery%3D1
        remoteUrl = Object.keys(req.query)[0];
        if (remoteUrl) {
            remoteUrl = url.parse(remoteUrl);
        }
    }

    if (!remoteUrl) {
        return res.status(400).send('No url specified.');
    }

    if (!remoteUrl.protocol) {
        remoteUrl.protocol = 'http:';
    }

    var proxy;
    /* if (upstreamProxy && !(remoteUrl.host in bypassUpstreamProxyHosts)) {
        proxy = upstreamProxy;
    } */

    // encoding : null means "body" passed to the callback will be raw bytes

    request.get({
        url : url.format(remoteUrl),
        headers : filterHeaders(req, req.headers),
        encoding : null,
        proxy : proxy
    }, function(error, response, body) {
        var code = 500;

        if (response) {
            code = response.statusCode;
            res.header(filterHeaders(req, response.headers));
        }

        res.status(code).send(body);
    });
});

//start server
server.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

//SocketIO & Bigio
bigio.initialize(function() {
    io.on('connection', function(socket){
        console.log("SocketIO connected");

        bigio.addListener({
            topic: 'acquire_defended_area',
            listener: function(msg) {
                if(msg) {
                    console.log('Defended Area Message Received');
                }
                var grid = {
                    bounds: {
                        north: 0,
                        south: 0,
                        east: 0,
                        west: 0
                    },
                    points: []
                };

                var minLat = minLon = 400;
                var maxLat = maxLon = -400;

                for(var n = 0; n < msg[0].length; n++) {
                    var lat = +msg[0][n],
                        lon = +msg[1][n];

                    if(lat < minLat) {
                        minLat = lat;
                    }
                    if(lat > maxLat) {
                        maxLat = lat;
                    }
                    if(lon < minLon) {
                        minLon = lon;
                    }
                    if(lon > maxLon) {
                        maxLon = lon;
                    }
                    grid.points.push({
                        lat: lat,
                        lon: lon,
                        avgPk: +msg[2][n],
                        minPk: +msg[3][n],
                        maxPk: +msg[4][n]
                    })
                }

                grid.bounds.west = minLon;
                grid.bounds.south = minLat;
                grid.bounds.north = maxLat;
                grid.bounds.east = maxLon;

                socket.emit('defendedArea', grid);
            }
        });

        bigio.addListener({
            topic: 'acquire_weapon_score',
            listener: function(msg) {
                /*
                console.log('Weapon Score');
                console.log('  Number Engaged: ' + msg[0]);
                console.log('  Engaged Score: ' + msg[1]);
                console.log('  Battlespace Score: ' + msg[2]);
                console.log('  P(kill) Score: ' + msg[3]);
                console.log('  Stereo Score: ' + msg[4]);
                console.log('  Raid Score: ' + msg[5]);
                console.log('  Overall Score: ' + msg[6]);
                */
                var date = new Date();
                var score = {
                    timestamp: date.getTime(),
                    values: {
                        NumberEngaged: msg[0],
                        EngagedScore: msg[1],
                        BattlespaceScore: msg[2],
                        PKillScore: msg[3],
                        StereoScore: msg[4],
                        RaidScore: msg[5],
                        OverallScore: msg[6]
                    }
                };
                socket.emit('weaponScore', score);
            }
        });

        bigio.addListener({
            topic: 'acquire_surveillance_score',
            listener: function(msg) {
                /*
                console.log('Surveillance Score');
                console.log('  Number Tracked: ' + msg[0]);
                console.log('  Fitness Score: ' + msg[1]);
                console.log('  Number Tracked Score: ' + msg[2]);
                console.log('  First Access Score: ' + msg[3]);
                console.log('  Time on Track Score: ' + msg[4]);
                console.log('  Time on Stereo Score: ' + msg[5]);
                */
                var date = new Date();
                var score = {
                  timestamp: date.getTime(),
                  values: {
                      NumberTracked: msg[0],
                      FitnessScore: msg[1],
                      NumberTrackedScore: msg[2],
                      FirstAccessScore: msg[3],
                      TimeonTrackScore: msg[4],
                      TimeonStereoScore: msg[5]
                  }
                };
            socket.emit('surveillanceScore', score);
            }
        });

        bigio.addListener({
            topic: 'acquire_weapon_evaluation',
            listener: function(msg) {
                /*
                console.log('Weapon Score - ' + msg[7]);
                console.log('  Number Engaged: ' + msg[0]);
                console.log('  Engaged Score: ' + msg[1]);
                console.log('  Battlespace Score: ' + msg[2]);
                console.log('  P(kill) Score: ' + msg[3]);
                console.log('  Stereo Score: ' + msg[4]);
                console.log('  Raid Score: ' + msg[5]);
                console.log('  Overall Score: ' + msg[6]);
                */
              var date = new Date();
              var score = {
                  timestamp: date.getTime(),
                  name: msg[7],
                  values: {
                      NumberEngaged: msg[0],
                      EngagedScore: msg[1],
                      BattlespaceScore: msg[2],
                      PKillScore: msg[3],
                      StereoScore: msg[4],
                      RaidScore: msg[5],
                      OverallScore: msg[6],
                  }
              };
            socket.emit('weaponEvaluation', score);
            }
        });

        bigio.addListener({
            topic: 'acquire_surveillance_evaluation',
            listener: function(msg) {
                /*
              console.log('Surveillance Score - ' + msg[6]);
              console.log('  Number Tracked: ' + msg[0]);
              console.log('  Fitness Score: ' + msg[1]);
              console.log('  Number Tracked Score: ' + msg[2]);
              console.log('  First Access Score: ' + msg[3]);
              console.log('  Time on Track Score: ' + msg[4]);
              console.log('  Time on Stereo Score: ' + msg[5]);
              */
              var date = new Date();
              var score = {
                  timestamp: date.getTime(),
                  name: msg[6],
                  values: {
                      NumberTracked: msg[0],
                      FitnessScore: msg[1],
                      NumberTrackedScore: msg[2],
                      FirstAccessScore: msg[3],
                      TimeonTrackScore: msg[4],
                      TimeonStereoScore: msg[5]
                  }
              };
              socket.emit('surveillanceEvaluation', score);
            }
        });

        bigio.addListener({
          topic: 'acquire_fire_control_score',
          listener: function(msg) {
              /*
            console.log('Fire Control Score');
            console.log('  Number Tracked: ' + msg[0]);
            console.log('  Fitness Score: ' + msg[1]);
            console.log('  Number Tracked Score: ' + msg[2]);
            console.log('  First Access Score: ' + msg[3]);
            console.log('  Time on Track Score: ' + msg[4]);
            console.log('  Time on Stereo Score: ' + msg[5]);
            console.log('  Track Quality Score: ' + msg[6]);
            console.log('  Fire Control Score: ' + msg[7]);
            */
              var date = new Date();
              var score = {
                  timestamp: date.getTime(),
                  values: {
                      NumberTracked: msg[0],
                      FitnessScore: msg[1],
                      NumberTrackedScore: msg[2],
                      FirstAccessScore: msg[3],
                      TimeonTrackScore: msg[4],
                      TimeonStereoScore: msg[5],
                      TrackQualityScore: msg[6],
                      FireControlScore: msg[7]
                  }
              };
              socket.emit('fireControlScore', score);
          }
        });

        bigio.addListener({
            topic: 'acquire_sensor_coverage',
            listener: function(msg) {
                track.findOne({id: 'T' + msg[1]}, function(err, t) {
                    if (err) console.log(err);
                    if (t === null) {
                        console.log('Track T' + msg[1] + ' does not exist');
                    }else{
                        var yellow = {alpha: 1, blue: 0, green: 1, red: 1};
                        var green = {alpha: 1, blue: 0, green: 1, red: 0};
                        var red = {alpha: 1, blue: 0, green: 0, red: 1};
                        var blue = {alpha: 1, blue: 1, green: 0, red: 0};
                        var newColorArray = [];
                        var times = t.times;
                        for (var i = 0; i < (times.length - 1); i++) {
                            var color = t.colors[i];
                            if (times[i] >= msg[2] && times[i] <= msg[3]) {
                                if (color.blue == 0 && color.green == 0 && color.red == 1) {
                                    //red to yellow
                                    newColorArray[i] = yellow;
                                } else if (color.blue == 1 && color.green == 0 && color.red == 0) {
                                    //blue to green
                                    newColorArray[i] = green;
                                } else if (color.blue == 0 && color.green == 1 && color.red == 1) {
                                    //yellow to yellow
                                    newColorArray[i] = yellow;
                                } else {
                                    //color stays the same
                                    newColorArray[i] = t.colors[i];
                                }
                            } else {
                                if (color.blue == 0 && color.green == 1 && color.red == 0) {
                                    //green to blue
                                    newColorArray[i] = blue;
                                } else if (color.blue == 0 && color.green == 1 && color.red == 1) {
                                    //yellow to red
                                    newColorArray[i] = red;
                                } else {
                                    //color stays the same
                                    newColorArray[i] = t.colors[i];
                                }
                            }
                        }
                        track.findOneAndUpdate({id: 'T' + msg[1]}, {colors: newColorArray}, function (err, callback) {
                            if (err) console.log(err);
                            track.findOne({id: 'T' + msg[1]}, function (err, tTwo) {
                                if (err) console.log(err);
                                socket.emit('updateElement', 'createTrack', ['remove', tTwo]);
                            })
                        });}
                });
            }
        });

        bigio.addListener({
            topic: 'acquire_weapon_coverage',
            listener: function(msg) {
                track.findOne({id: 'T' + msg[1]}, function(err, t) {
                    if (err) console.log(err);
                    if (track === null) {
                        console.log('Track T' + msg[1] + ' does not exist');
                    }else {
                        var blue = {alpha: 1, blue: 1, green: 0, red: 0};
                        var green = {alpha: 1, blue: 0, green: 1, red: 0};
                        var yellow = {alpha: 1, blue: 0, green: 1, red: 1};
                        var red = {alpha: 1, blue: 0, green: 0, red: 1};
                        var newColorArray = [];
                        var times = t.times;
                        for (var i = 0; i < (times.length - 1); i++) {
                            var color = t.colors[i];
                            if (times[i] >= msg[2] && times[i] <= msg[3]) {
                                if (color.blue == 0 && color.green == 0 && color.red == 1) {
                                    //red to blue
                                    newColorArray[i] = blue;
                                } else if (color.blue == 0 && color.green == 1 && color.red == 1) {
                                    //yellow to green
                                    newColorArray[i] = green;
                                } else if (color.blue == 1 && color.green == 0 && color.red == 0) {
                                    //blue to blue
                                    newColorArray[i] = blue;
                                } else {
                                    //color stays the same
                                    newColorArray[i] = t.colors[i];
                                }
                            } else {
                                if (color.blue == 0 && color.green == 1 && color.red == 0) {
                                    //green to yellow
                                    newColorArray[i] = yellow;
                                } else if (color.blue == 1 && color.green == 0 && color.red == 0) {
                                    //blue to red
                                    newColorArray[i] = red;
                                } else {
                                    //color stays the same
                                    newColorArray[i] = t.colors[i];
                                }
                            }
                        }
                        track.findOneAndUpdate({id: 'T' + msg[1]}, {colors: newColorArray}, function (err, callback) {
                            if (err) console.log(err);
                            track.findOne({id: 'T' + msg[1]}, function (err, tTwo) {
                                if (err) console.log(err);
                                socket.emit('updateElement', 'createTrack', ['remove', tTwo]);
                            })
                        });
                    }
                });
            }
        });

        bigio.addListener({
            topic: 'acquire_sensors',
            listener: function(message) {
                sensor.findOneAndUpdate({Index : message[0]},{latlonalt : [message[2], message[1], message[3]], boresight_Half_Ang_El : message[4]}, function(err, callback){
                    if (err) {console.log(err)}
                    sensor.findOne({Index : message[0]}, function (err, sensor) {
                        if (err) {console.log(err)}
                        socket.emit('updateElement', 'createVolume', ['remove', 'sensor', sensor]);
                    });
                });
            }
        });

        bigio.addListener({
            topic: 'acquire_weapons',
            listener: function(message) {
                weapon.findOneAndUpdate({Index : message[0]},{latlonalt : [message[2], message[1], message[3]], boresight_Half_Ang_El : message[4]}, function(err, callback){
                    if (err) {console.log(err)}
                    weapon.findOne({Index : message[0]}, function (err, weapon) {
                        if (err) {console.log(err)}
                        socket.emit('updateElement', 'createVolume', ['remove', 'weapon', weapon]);
                    });
                });
            }
        });

        bigio.addListener({
            topic: 'acquire_tracks',
            listener: function(message) {
                var threat = {};

                var id = message[0];
                var rcs = +message[8];

                threat.id = 'T' + id;
                threat.name = id;
                threat.times = [];
                threat.positions = [];
                threat.colors = [];
                threat.velocity = [];
                threat.rcs = rcs;
                threat.cType = 'track';
                threat.create = 'createTrack';

                for(var i = 0; i < message[1].length; i++) {
                    var time = message[1][i];
                    var x = message[2][i];
                    var y = message[3][i];
                    var z = message[4][i];
                    var vx = message[5][i];
                    var vy = message[6][i];
                    var vz = message[7][i];

                    threat.times.push(time);
                    threat.positions.push({x: x, y: y, z: z});
                    threat.colors.push({red: 1, green: 0, blue: 0});
                    threat.velocity.push([vx, vy, vz]);
                }

                socket.emit('loadElement', threat);
                var entry = new track(threat);
                entry.save(function (err) {
                    if (err) return console.log(err);
                });
            }
        });

        bigio.addListener({
            topic: 'threat_truth_topic',
            listener: function(message){
                mongoose.model('truth').findOne({name: message[1]}, function(err, result){
                    if (err) return console.log(err);
                    var id = message[1],
                        identity, classification, positions, velocity, exists;

                    if (result){
                        result.positions.push({x: message[3][0], y: message[3][1], z: message[3][2]});
                        result.velocity.push(message[3][3], message[3][4], message[3][5]);
                        positions = result.positions;
                        velocity = result.velocity;
                        exists = true;
                    }else{
                        positions = [{x: message[3][0], y: message[3][1], z: message[3][2]}];
                        velocity = [message[3][3], message[3][4], message[3][5]];
                        exists = false;
                    }
                    var threat = {};

                    (message[7] == 2) ? identity = 'HOSTILE' : identity = 'FRIEND';
                    (message[8] == 1) ? classification = 'GROUND_VEHICLE' : classification = '';

                    threat.hdr = message[0];
                    threat.id = 'Tr' + id;
                    threat.name = id;
                    threat.positions = positions;
                    threat.color = {red: 255, green: 0, blue: 0, alpha: 255};
                    threat.velocity = velocity;
                    threat.beta = message[4];
                    threat.rcs = message[5];
                    threat.radIntensity = message[6];
                    threat.identity = identity;
                    threat.classification = classification;
                    threat.lastThreatTruth = message[9];
                    threat.cType = 'truth';
                    threat.create = 'createTruth';

                    if (exists){
                        mongoose.model('truth').findOneAndUpdate({id: threat.id}, threat, function(err) {
                            if (err) return console.log(err);
                        });
                        socket.emit('vapor', threat);
                    }else{
                        var entry = new truth(threat);
                        entry.save(function (err) {
                            if (err) return console.log(err);
                        });
                    }
                });
            }
        });

        bigio.addListener({
            topic: 'system_track_topic',
            listener: function(message){
                mongoose.model('track').findOne({name: message[1]}, function(err, result){
                    if (err) return console.log(err);
                    var id = message[1],
                        identity, type, classification, positions, velocity, exists;

                    if (result){
                        result.positions.push({x: message[8][0], y: message[8][1], z: message[8][2]});
                        result.velocity.push(message[8][3], message[8][4], message[8][5]);
                        positions = result.positions;
                        velocity = result.velocity;
                        exists = true;
                    }else{
                        positions = [{x: message[8][0], y: message[8][1], z: message[8][2]}];
                        velocity = [message[8][3], message[8][4], message[8][5]];
                        exists = false;
                    }
                    var threat = {};

                    (message[4] == 1) ? type = 'GroundTrack' : type = '';
                    (message[5] == 1) ? classification = 'GROUND_VEHICLE' : classification = '';
                    (message[6] == 2) ? identity = 'HOSTILE' : identity = 'FRIEND';

                    threat.hdr = message[0];
                    threat.id = 'sTr' + id;
                    threat.name = id;
                    threat.sysTrkID = message[1];
                    threat.leadSrcID = message[2];
                    threat.truthID = message[3];
                    threat.positions = positions;
                    threat.color = {red: 255, green: 122, blue: 0, alpha: 200};
                    threat.velocity = velocity;
                    threat.tValid = message[7];
                    threat.cov = message[14];
                    threat.type = type;
                    threat.friendHostile = identity;
                    threat.classification = classification;
                    threat.pLethal = message[9];
                    threat.urgency = message[10];
                    threat.ballisticCoef = message[11];
                    threat.priority = message[12];
                    threat.dropped = message[13];
                    threat.cType = 'truth';
                    threat.create = 'createTruth';


                    if (exists){
                        mongoose.model('track').findOneAndUpdate({id: threat.id}, threat, function(err) {
                            if (err) return console.log(err);
                        });
                        socket.emit('vapor', threat);
                    }else{
                        var entry = new track(threat);
                        entry.save(function (err) {
                            if (err) return console.log(err);
                        });
                    }
                });
            }
        });

        bigio.addListener({
            topic: 'threat_truth',
            listener: function(message){
                console.log('THREAT TRUTH MSG:');
                console.log(message);

                /*mongoose.model('truth').findOne({name: message[1]}, function(err, result){
                    if (err) return console.log(err);
                    var id = message[1],
                        identity, classification, positions, velocity, exists, type;

                    if (result){
                        result.positions.push({x: message[3][0], y: message[3][1], z: message[3][2]});
                        result.velocity.push(message[3][3], message[3][4], message[3][5]);
                        positions = result.positions;
                        velocity = result.velocity;
                        exists = true;
                    }else{
                        positions = [{x: message[3][0], y: message[3][1], z: message[3][2]}];
                        velocity = [message[3][3], message[3][4], message[3][5]];
                        exists = false;
                    }
                    var threat = {};

                    (message[4] == 1) ? type = 'RAM' : type = '';
                    (message[8] == 2) ? identity = 'HOSTILE' : identity = 'FRIEND';
                    (message[9] == 1) ? classification = 'GROUND_VEHICLE' : classification = '';

                    threat.hdr = message[0];
                    threat.id = 'Tr' + id;
                    threat.name = id;
                    threat.positions = positions;
                    threat.color = {red: 255, green: 0, blue: 0, alpha: 255};
                    threat.velocity = velocity;
                    threat.beta = message[4];
                    threat.rcs = message[5];
                    threat.radIntensity = message[6];
                    threat.identity = identity;
                    threat.classification = classification;
                    threat.lastThreatTruth = message[9];
                    threat.cType = 'truth';
                    threat.create = 'createTruth';

                    if (exists){
                        mongoose.model('truth').findOneAndUpdate({id: threat.id}, threat, function(err) {
                            if (err) return console.log(err);
                        });
                        socket.emit('vapor', threat);
                    }else{
                        var entry = new truth(threat);
                        entry.save(function (err) {
                            if (err) return console.log(err);
                        });
                    }
                });*/
            }
        });

        //BIRDS-EYE SPECIFIC

        bigio.addListener({
            topic: 'sensor_task',
            listener: function (message){
                console.log('Sensor Task: ');
                console.log(message);
                var msg = {
                    taskId: message[0],
                    taskType: message[1],
                    satelliteId: message[2],
                    sensorId: message[3],
                    trackId: message[4],
                    trackValue: message[5],
                    trackUrgency: message[6],
                    cost: message[7],
                    tSlew: message[8],
                    tStartCollect: message[9],
                    tStopCollect: message[10]
                }
            }
        });

        bigio.addListener({
            topic: 'uas_model',
            listener: function (message){
                console.log('UAS Model: ');
                console.log(message);
            }
        });

//TODO: REFACTOR FROM CZML
        /*bigio.addListener({
            topic: 'threat_truth',
            listener: function(message) {

                for (var key in Object.keys(message)) {
                    if (key == 2) {
                        var objType = message[7];
                        if (objType == 1) {
                            objType = "RAM";
                        } else {
                            objType = "Unknown";
                        }
                        var ttId = objType + " " + message[1];
                    } else if (key == 3) {
                        var pMsg = String(message[key]);
                        var pArray = pMsg.split(",");
                        for (var i = 0; i < pArray.length; i++) {
                            pArray[i] = +pArray[i];
                        }
                    } else if (key == 8) {
                        var identity = String(message[8]);
                        if (identity == 2) {
                            rgba = [255, 0, 0, 255];
                        } else {
                            rgba = [255, 255, 0, 255];
                        }
                    } else if (key == 9) {
                        var classification = message[9];
                        if (classification == 16) {
                            classification = "Rocket - Medium";
                        } else {
                            classification = "Unknown";
                        }
                    }
                }
                var threatTruth = {
                    id: ttId,
                    availability: interval,
                    epoch: staticDate.toISOString(),
                    position: {
                        interpolationAlgorithm: "LAGRANGE",
                        interpolationDegree: 1,
                        cartesian: [date.toISOString(), pArray[0], pArray[1], pArray[2]]
                    },
                    path: {
                        material: {
                            solidColor: {
                                color: [{
                                    interval: interval,
                                    rgba: rgba
                                }]
                            }
                        },
                        show: [{
                            interval: interval,
                            boolean: true
                        }],
                        width: [{
                            interval: interval,
                            number: 2
                        }]
                    },
                    label: {
                        fillColor: [{
                            interval: interval,
                            rgba: [255, 255, 255, 255]
                        }],
                        horizontalOrigin: "LEFT",
                        outlineColor: {
                            rgba: [0, 0, 0, 255]
                        },
                        pixelOffset: {
                            cartesian2: [10.0, 0.0]
                        },
                        scale: 0.5,
                        show: [{
                            interval: interval,
                            boolean: true
                        }],
                        style: "FILL",
                        text: classification,
                        verticalOrigin: "CENTER"
                    }
                };
                socket.emit('threatTruth', JSON.stringify(threatTruth));
            }
        });*/

        //START SCENARIOS
        socket.on('startBirdsEye', function(sat_algorithm, bm_algorithm) {
            console.log("Saving scenario for the run");
            var name = makeid();
            saveScenario('tmp', name, 'birdsEye', function() {
                console.log('Starting Optimization');
                var message = {
                    relativePath: path.join(__dirname, 'public/tmp', name),
                    sat_algorithm: sat_algorithm,
                    bm_algorithm: bm_algorithm
                };
                console.log(message);
                bigio.send({
                    topic: 'birds_eye_start',
                    message: message,
                    type: "com.a2i.messages.StartMessage"
                });
            });
        });

        socket.on('startOptimization', function(algorithm, type) {
            console.log("Saving scenario for the run");
            var name = makeid();
            saveScenario('tmp', name, 'acquire', function() {
                console.log('Starting Optimization: ' + algorithm);
                var message = {
                    relativePath: path.join(__dirname, 'public/tmp', name),
                    algorithm: algorithm,
                    type: type
                };
                bigio.send({
                    topic: 'acquire_start',
                    message: message,
                    type: "com.a2i.messages.StartMessage"
                });
            });
        });

        //CLIENT CONSTRUCTED MESSAGE
        socket.on('bigioMsg', function(msgDetails) {
            bigio.send({
                topic: msgDetails.topic,
                message: msgDetails.msg,
                javaclass: msgDetails.javaclass
            });
        });

        socket.on('controlSim', function(msg){
            console.log("Sending app command: " + msg);
            bigio.send({
                topic: 'ENTITY_CMD_TOPIC',
                message: msg,
                javaclass: "com.a2i.sim.SimulationControllerBase"
            })
        });

        socket.on('evaluateScenario', function() {
            console.log("Evaluating scenario");
            var name = makeid();
            saveScenario('tmp', name, 'acquire', function() {
                console.log('Starting Evaluation');
                var message = {relativePath: path.join(__dirname, 'public/tmp', name)};
                bigio.send({
                    topic: 'acquire_evaluate',
                    message: message,
                    type: "com.a2i.messages.EvaluateMessage"
                });
            });
        });

        socket.on('generateThreats', function() {
            var name = makeid();
            saveScenario('tmp', name, 'acquire', function() {
                console.log("Generating threats.");
                var message = {relativePath: path.join(__dirname, 'public/tmp', name)};
                bigio.send({
                    topic: 'acquire_generate_threats',
                    message: message,
                    type: "com.a2i.messages.GenerateThreatsMessage"
                });
            });
        });

        socket.on('newF', function(){
            var db = [sensor, weapon, track, asset, truth];
            for (var i=0; i < db.length; i++) {
                db[i].remove({}, function (err) {
                    if (err)console.log(err);
                });
            }
            console.log("All databases cleared");
        });

        socket.on('searchName', function(pt, database, input, callback){
            mongoose.model(database).findOne({name: input}, function(err, results){
                (pt)
                    ? callback(results, pt)
                    : callback(results);
            })
        });

        socket.on('searchID', function(pt, database, input, callback){
            mongoose.model(database).findOne({id: input}, function(err, results){
                (pt)
                    ? callback(results, pt)
                    : callback(results);
            })
        });

        socket.on('findAll', function(db, pt, callback) {
            mongoose.model(db).find({}, '-_id -__v', function (err, results) {
                if (err) return callback(err);
                (pt)
                    ? callback(results, pt)
                    : callback(results);
            })
        });

        socket.on('find', function(db, searchParam,  pt, callback) {
            mongoose.model(db).find(searchParam, '-_id -__v', function (err, results) {
                if (err) return callback(err);
                (pt)
                    ? callback(results, pt)
                    : callback(results);
            })
        });

        socket.on('refreshAll', function(database, callback){
            (function(db){
                mongoose.model(db).find({}, function (err, results) {
                    if (err)console.log(err);
                    if (results.length > 0) {
                        var refreshArray = [];
                        for (var r in results) {
                            refreshArray.push(results[r]);
                        }
                        callback(refreshArray);
                    }else{console.log('No ' + db + ' data to load');}
                })
            })(database);
        });

        socket.on('newElement', function(type, data){
            var entry;
            if (type == 'asset'){
                entry = new asset(data);
            }else if(type == 'sensor'){
                entry = new sensor(data);
            }else if(type == 'weapon') {
                entry = new weapon(data);
            }
            entry.save(function(err){
                if (err) return console.log(err);
            });
        });

        socket.on('updateData', function(id, db, data, cb){
            mongoose.model(db).findOneAndUpdate({id: id}, data, function(err){
                if (err) return console.log(err);
                mongoose.model(db).findOne({id: id}, function(err, result){
                    if (err) return console.log(err);
                    cb(result)
                });
            });
        });

        socket.on('removeData', function(db, id){
            mongoose.model(db).findOneAndRemove({id: id}, function (err) {
                if (err) return console.log(err);
            });
        });

        socket.on('saveScenario', function(name, process, callback) {
            saveScenario('scenarios', name, process, callback);
        });

        socket.on('openFile', function(cb){
            var dirPath = path.join(__dirname, 'public/scenarios');
            fs.readdir(dirPath, function(err, files){
                if (err)console.log(err);
                cb(files.filter(function(file){
                    var statPath = path.join(dirPath, file);
                    return fs.statSync(statPath).isDirectory()
                }))
            })
        });

        socket.on('getWeaponParams', function(name, callback) {
            mongoose.model('weaponA').findOne({Identifier: name}, function(err, results) {
                if(results) {
                    mongoose.model('weaponTypes').findOne({id: results.Type}, function(e, res) {
                        if(res) {
                            callback(res);
                        } else {
                            callback({});
                        }
                    });
                } else {
                    callback({});
                }
            });
        });

        socket.on('getSensorParams', function(name, callback) {
            mongoose.model('sensorA').findOne({Identifier: name}, function(err, results) {
                if(results) {
                    mongoose.model('radarTypes').findOne({id: results.Type}, function(e, res) {
                        if(res) {
                            callback(res);
                        } else {
                            callback({});
                        }
                    });
                } else {
                    callback({});
                }
            });
        });

        socket.on('getParams', function(model, name, callback) {
            mongoose.model(model).findOne({Identifier: name}, function(err, results) {
                if(results) {
                    mongoose.model('radarTypes').findOne({id: results.Type}, function(e, res) {
                        if(res) {
                            callback(res);
                        } else {
                            callback({});
                        }
                    });
                } else {
                    callback({});
                }
            });
        });

        socket.on('getScenario', function(folder, cb){
            var scenarios = [
                {dirPath: path.join(__dirname, 'public/scenarios', folder, 'scenarios'), loadType: 'loadAsset', fNames: ['AllowedRegions_NK.dat', 'DefendedAreas_NK.dat', 'DefendedAssets_NK.dat','RestrictedRegions_NK.dat','ThreatAreas_NK.dat']},
                {dirPath: path.join(__dirname, 'public/scenarios', folder, 'sensors'), loadType: 'loadSensor', fNames: ['Radars_NK.dat']},
                {dirPath: path.join(__dirname, 'public/scenarios', folder, 'weapons'), loadType: 'loadWeapon', fNames: ['Launchers_NK.dat']}
            ];
            scenarios.forEach(function(scenario){
                for (var file in scenario.fNames) {
                    var filePath = path.join(scenario.dirPath, scenario.fNames[file]);
                    var ftype = scenario.fNames[file];
                    (function (filePath, ftype) {
                        new lazy(fs.createReadStream(filePath))
                            .lines
                            .forEach(function (line) {
                                loading[scenario.loadType](line.toString(), ftype);
                            });
                    })(filePath, ftype);
                }
            });
            cb();
        });

        socket.on('importFile', function(type, line){
            loading[type](line);
        });

        var loading = {};
        loading.loadAsset = function() {
            var line = arguments[0];
            var ftype = arguments[1];
            if(line == null || line == '' || line.slice(0, 1) == '%') {
                return;
            }
            line = line.match(/[^ \t\r]+/g);
            if(line == null) {
                return;
            }
            var pos = [];
            if (line[6] == 'Circle') {
                pos = [+line[8], +line[9], +line[10]];
            } else {
                var vertexNum = line[7];
                for (var a = 8; a < 3 * vertexNum + 8; a += 3) {
                    pos.push(+line[a], +line[a + 1], +line[a + 2]);
                }
            }
            var data = {
                id: 'A' + line[0],
                name: line[0],
                Index: line[1],
                owner: line[2],
                valexp: +line[3],
                height: +line[4],
                NFZ: +line[5],
                shape: line[6],
                rad: line[7],
                latlonalt: pos,
                ftype: ftype.replace('_NK', ''),
                cType: 'asset',
                create: 'createAsset'
            };
            socket.emit('loadElement', data);
            var entry = new asset(data);
            entry.save(function (err) {
                if (err) return console.log(err);
            });
        };
        loading.loadSensor = function() {
            var line = arguments[0];
            if(line == null || line == '' || line.slice(0, 1) == '%') {
                return;
            }
            line = line.match(/[^ \t\r]+/g);
            if(line == null) {
                return;
            }
            var weaponType = line[2];

            mongoose.model('radarTypes').findOne({id: weaponType}, function(err, results) {
                var radarData = results;
                var num = +line[7];
                var weaponIds = [];
                for (var i=1; i <= num; i++){
                    weaponIds.push(line[7+i])
                }

                var data = {
                    id: 'S' + line[1],
                    Index: line[0],
                    name: line[1],
                    Identifier: line[1],
                    Type: line[2],
                    Lat: line[3],
                    Lon: line[4],
                    Alt: line[5],
                    BoresightAz: line[6],
                    NumWeaponIDs: line[7],
                    WeaponIDs: weaponIds,
                    KFactorClass: line[8 + num],
                    KFactorType: line[9 + num],
                    KFactorID: line[10 + num],
                    Fixed: line[11 + num],
                    minEl: radarData.minEl,
                    maxEl: radarData.maxEl,
                    max_Range: radarData.max_Range,
                    minRng: radarData.minRng,
                    boresight_Half_Ang_Az: radarData.boresight_Half_Ang_Az,
                    boresight_Half_Ang_El: +line[6],
                    nFaces: radarData.nFaces,
                    boresightEl: radarData.boresightEl,
                    latlonalt: [+line[4], +line[3], +line[5]],
                    cType: 'sensor',
                    create: 'createVolume'
                };

                socket.emit('loadElement', data);
                var entry = new sensor(data);
                entry.save(function (err) {
                    if (err) return console.log(err);
                });
            });
        };
        loading.loadWeapon = function() {
            var line = arguments[0];
            if(line == null || line == '' || line.slice(0, 1) == '%') {
                return;
            }
            line = line.match(/[^ \t\r]+/g);
            if(line == null) {
                return;
            }
            var weaponType = line[2];
            mongoose.model('weaponTypes').findOne({id: weaponType}, function(err, results) {
                var weaponData = results;
                var num = +line[7];
                var sensorIds = [];
                for (var i=1; i <= num; i++){
                    sensorIds.push(line[7+i])
                }

                var data = {
                    id: 'W' + line[1],
                    Index: line[0],
                    name: line[1],
                    Identifier: line[1],
                    Type: line[2],
                    Lat: line[3],
                    Lon: line[4],
                    Alt: line[5],
                    Boresight: line[6],
                    NumSensorIDs: line[7],
                    SensorIDs: sensorIds,
                    Fixed: line[8 + num],
                    Inventory: line[9 + num],
                    minEl: 0,
                    max_Range: (weaponData.maxFanAlt + weaponData.maxFanDR) / 2,
                    minRng: weaponData.Min_Alt_Int,
                    boresight_Half_Ang_Az: weaponData.FOF_halfangle,
                    boresight_Half_Ang_El: +line[6],
                    nFaces: 2,
                    maxEl: 90,
                    boresightEl: 0,
                    latlonalt: [+line[4], +line[3], +line[5]],
                    Fan: 'FlyoutFan_' + line[3] + '_' + line[4] + '_' + line[5] + '.dat',
                    Table: 'FiringTable_' + line[3] + '_' + line[4] + '_' + line[5] + '.dat',
                    cType: 'weapon',
                    create: 'createVolume'
                };

                socket.emit('loadElement', data);
                var entry = new weapon(data);
                entry.save(function (err) {
                    if (err) return console.log(err);
                });
            });
        };
    });
});

function copyRecursiveSync(src, dest) {
  var exists = fs.existsSync(src);
  var stats = exists && fs.statSync(src);
  var isDirectory = exists && stats.isDirectory();
  if (exists && isDirectory) {
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(path.join(src, childItemName),
                        path.join(dest, childItemName));
    });
  } else {
    fs.linkSync(src, dest);
  }
};

function saveScenario(dir, name, process, callback) {
    var root = path.join(__dirname, 'public', dir, name);
    var dirs = {
        acquire: [
            {directory: 'scenarios', db: 'asset', filename: 'Assets.dat', suffix: '_NK', obj: ['%', 'name', 'Index', 'owner', 'valexp', 'height', 'NFZ', 'shape', 'rad', 'latlonalt']},
            {directory: 'sensors', db: 'sensor', filename: 'Radars_NK.dat', obj: ['%', 'Index', 'Identifier', 'Type', 'Lat', 'Lon', 'Alt', 'BoresightAz', 'NumWeaponIDs', 'WeaponIDs', 'KFactorClass', 'KFactorType', 'KFactorID', 'Fixed']},
            {directory: 'weapons', db: 'weapon', filename: 'Launchers_NK.dat', obj: ['%', 'Index', 'Identifier', 'Type', 'Lat', 'Lon', 'Alt', 'Boresight', 'NumSensorIDs', 'SensorIDs', 'Fixed', 'Inventory']}
        ],
        birdsEye: [
            {directory: 'scenarios', db: 'asset', filename: 'Assets.dat', obj: ['%', 'name', 'Index', 'owner', 'valexp', 'height', 'shape', 'rad', 'latlonalt']},
            {directory: 'sensors', db: 'sensor', filename: 'Radars.dat', obj: ['%', 'Index', 'Type', 'Lat', 'Lon', 'Alt', 'BoresightAz', 'NumWeaponIDs', 'WeaponIDs']},
            {directory: 'weapons', db: 'weapon', filename: 'Launchers.dat', obj: ['%', 'Index', 'Type', 'Lat', 'Lon', 'Alt', 'Boresight', 'Fan', 'Table']}
        ]
    };
    fs.mkdir(root, function(err){
        if(err)console.log(err);
        require('ncp').ncp(path.join(__dirname, 'public/template'), root, function(err) {
            if(err)console.log(err);
            async.each(dirs[process], function(dir, cb) {
                var src = path.join(root, dir.directory);
                var exists = fs.existsSync(src);
                var stats = exists && fs.statSync(src);
                var isDirectory = exists && stats.isDirectory();
                if(!isDirectory) {
                    fs.mkdirSync(path.join(root, dir.directory));
                }
                if(err)console.log(err);
                mongoose.model(dir.db).find({},'-_id -__v').lean().exec(function(err, results){
                    if(err)console.log(err);
                    if (results.length > 0) {
                        if (dir.db != 'asset') {
                            var comData = [];
                            var cLine = dir.obj;
                            comData[0] = cLine.join(' ');
                            cLine.splice(0, 1);
                            for (var i = 0; i < results.length; i++) {
                                var comObj = [];
                                var p = results[i];
                                for (var j=0; j < cLine.length; j++) {
                                    if (Array.isArray(p[cLine[j]])) {
                                        comObj.push(p[cLine[j]].join(' '));
                                    } else if (cLine[j] == 'Index') {
                                        comObj.push(i+1);
                                    } else if (cLine[j] == 'Alt' || cLine[j].indexOf('Boresight') > -1){
                                        (p[cLine[j]] === 0)
                                            ? comObj.push('0.0')
                                            : comObj.push(p[cLine[j]])
                                    } else {
                                        comObj.push(p[cLine[j]]);
                                    }
                                }
                                comData[i + 1] = comObj.join(' ');
                            }
                            var data = comData.join('\r\n');
                            fs.writeFile(path.join(root, dir.directory, dir.filename), data, function (err) {
                                if (err)console.log(err);
                            });
                        } else {
                            var comFiles = {};
                            for (var i=0; i < results.length; i++){
                                var p = results[i];
                                var cLine = dir.obj;
                                if (!comFiles[p.ftype]) {
                                    comFiles[p.ftype] = {fName: p.ftype, comData: []};
                                    comFiles[p.ftype].comData[0] = cLine.join(' ');
                                }
                                var comObj = [];
                                for (var j=1; j < cLine.length; j++) {
                                    if (Array.isArray(p[cLine[j]])) {
                                        comObj.push(p[cLine[j]].join(' '));
                                    } else if (cLine[j] == 'Index') {
                                        comObj.push(comFiles[p.ftype].comData.length + 1);
                                    } else {
                                        comObj.push(p[cLine[j]]);
                                    }
                                }
                                comFiles[p.ftype].comData.push(comObj.join(' '));
                            }
                            for (var key in comFiles) {
                                var data = comFiles[key].comData.join('\r\n'),
                                    fileName;
                                if (dir.suffix) {
                                    var splitName = comFiles[key].fName.split('.');
                                    fileName = path.join(root, dir.directory, splitName[0] + dir.suffix + '.dat')
                                }else{fileName = path.join(root, dir.directory, comFiles[key].fName)}
                                fs.writeFile(fileName, data, function (err) {
                                    if (err)console.log(err);
                                });
                            }
                        }
                    }
                    cb();
                });
            },
            function(err){
                if(err)console.log(err);
                callback('Scenario Saved');
            });
        });
    });
}

function makeid() {
    var text = "";
    var possible = "0123456789abcdef";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var a = 6378137,
    f = 0.0034,
    b = 6.3568e6,
    e = Math.sqrt((Math.pow(a, 2) - Math.pow(b, 2)) / Math.pow(a, 2)),
    e2 = Math.sqrt((Math.pow(a, 2) - Math.pow(b, 2)) / Math.pow(b, 2));
function ecef2lla(x, y, z) {
    var lla = [0, 0, 0];
    var lat, lon, height, N , theta, p;

    p = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    theta = Math.atan((z * a) / (p * b));
    lon = Math.atan(y / x);
    lat = Math.atan(((z + Math.pow(e2, 2) * b * Math.pow(Math.sin(theta), 3)) / ((p - Math.pow(e, 2) * a * Math.pow(Math.cos(theta), 3)))));
    N = a / (Math.sqrt(1 - (Math.pow(e, 2) * Math.pow(Math.sin(lat), 2))));
    var m = (p / Math.cos(lat));
    height = m - N;


    lon = lon * 180 / Math.PI;
    lat = lat * 180 / Math.PI;
    lla[0] = lat;
    lla[1] = lon;
    lla[2] = height;
    return lla;
}