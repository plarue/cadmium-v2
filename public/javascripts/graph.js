/**
 * Created by Brent on 6/10/2015.
 */
angular.element(document).ready(function() {
    var weaponKeyMetrics = {
      /* 'NumberEngaged' : {
        title: 'Number Engaged',
        extent: [0, 100]
      }, */
      'EngagedScore': {
        title: 'Engaged Score',
        extent: [0, 1]
      },
      'BattlespaceScore': {
        title: 'Battlespace Score',
        extent: [0, 1]
      },
      'PKillScore': {
        title: 'P(Kill) Score',
        extent: [0, 1]
      },
      'StereoScore': {
        title: 'Stereo Weapon Score',
        extent: [0, 1]
      },
      'RaidScore': {
        title: 'Raid Score',
        extent: [0, 1]
      },
      'OverallScore': {
        title: 'Weapon Score',
        extent: [0, 1]
      }
    };
    var fireControlKeyMetrics = {
      /* 'NumberTracked': {
        title: 'FC Number Tracked',
        extent: [0, 100]
      }, */
      'FitnessScore': {
        title: 'FC Fitness',
        extent: [0, 1]
      },
      'NumberTrackedScore': {
        title: 'FC Tracking Score',
        extent: [0, 1]
      },
      'FirstAccessScore': {
        title: 'First Access Score',
        extent: [0, 1]
      },
      'TimeonTrackScore': {
        title: 'Time on Track Score',
        extent: [0, 1]
      },
      'TimeonStereoScore': {
        title: 'Time on Stereo Score',
        extent: [0, 1]
      },
      'TrackQualityScore': {
        title: 'Track Quality',
        extent: [0, 1]
      },
      'FireControlScore': {
        title: 'Fire Control Score',
        extent: [0, 1]
      }
    };
    var surveillanceKeyMetrics = {
      /* 'NumberTracked': {
        title: 'Number Tracked',
        extent: [0, 100]
      }, */
      'FitnessScore': {
        title: 'Surveillance Score',
        extent: [0, 1]
      },
      'NumberTrackedScore': {
        title: 'Tracking Score',
        extent: [0, 1]
      },
      'FirstAccessScore': {
        title: 'First Access Score',
        extent: [0, 1]
      },
      'TimeonTrackScore': {
        title: 'Time on Track Score',
        extent: [0, 1]
      },
      'TimeonStereoScore': {
        title: 'Stereo Sensor Score',
        extent: [0, 1]
      }
    };

    var weaponData = {}; // dictionary keyed by metric key valued by a list of values
    var surveillanceData = {};
    var fireControlData = {};

    Object.keys(weaponKeyMetrics).map(function(name) {
        weaponData[name] = {
            data: []
        };
    });
    Object.keys(surveillanceKeyMetrics).map(function(name) {
        surveillanceData[name] = {
            data: []
        };
    });
    Object.keys(fireControlKeyMetrics).map(function(name) {
        fireControlData[name] = {
            data: []
        }
    });

    socket.on('weaponEvaluation', function (msg) {
        var name = msg.name;
        if(!(name in evalDataNameIndex)) {
            constructEvalData(name);
        }
        Object.keys(weaponKeyMetrics).map(function (key) {
            $.each(evalData[evalDataNameIndex[name]].axes, function(i, v) {
                if(v.axis == weaponKeyMetrics[key].title && key) {
                    v.value = msg.values[key];
                }
            });
        });
        var game = svg.selectAll('g.single').data([evalData]);
        game.enter().append('g').classed('single', 1);
        game.call(chart);
    });
    socket.on('surveillanceEvaluation', function (msg) {
        var name = msg.name;
        if(!(name in evalDataNameIndex)) {
            constructEvalData(name);
        }
        Object.keys(surveillanceKeyMetrics).map(function (key) {
            $.each(evalData[evalDataNameIndex[name]].axes, function(i, v) {
                if(v.axis == surveillanceKeyMetrics[key].title) {
                    v.value = msg.values[key];
                }
            });
        });
        var game = svg.selectAll('g.single').data([evalData]);
        game.enter().append('g').classed('single', 1);
        game.call(chart);
    });
    socket.on('weaponScore', function (msg) {
        Object.keys(weaponKeyMetrics).map(function (key) {
            weaponData[key].data.push({
              //time: +msg.timestamp,
              time: +(new Date().getTime()),
              value: msg.values[key]
            });
        });
    });
    socket.on('surveillanceScore', function (msg) {
        Object.keys(surveillanceKeyMetrics).map(function (key) {
            surveillanceData[key].data.push({
              //time: +msg.timestamp,
              time: +(new Date().getTime()),
              value: msg.values[key]
            });
        });
    });
    socket.on('fireControlScore', function (msg) {
        Object.keys(fireControlKeyMetrics).map(function (key) {
            fireControlData[key].data.push({
              //time: +msg.timestamp,
              time: +(new Date().getTime()),
              value: msg.values[key]
            });
        });
    });
    socket.on('Pause', function (msg) {
        console.log('pausing');
        context.stop();
    });
    socket.on('Play', function (msg) {
        console.log('resuming');
        context.start();
    });

    var context = cubism.context()
        .serverDelay(0)
        .clientDelay(0)
        .step(1e3)
        .size(800);
    d3.select('#weaponScore').selectAll('.axis')
      .data(['top', 'bottom'])
      .enter().append('div')
      .attr('class', function(d) { return d + ' axis';})
      .each(function(d) { d3.select(this).call(context.axis().ticks(12).orient(d)); });
    d3.select('#surveillanceScore').selectAll('.axis')
      .data(['top', 'bottom'])
      .enter().append('div')
      .attr('class', function(d) { return d + ' axis';})
      .each(function(d) { d3.select(this).call(context.axis().ticks(12).orient(d)); });
    d3.select('#fireControlScore').selectAll('.axis')
      .data(['top', 'bottom'])
      .enter().append('div')
      .attr('class', function(d) { return d + ' axis';})
      .each(function(d) { d3.select(this).call(context.axis().ticks(12).orient(d)); });

    d3.select('#weaponScore').append('div')
      .attr('class', 'rule')
      .call(context.rule());
    d3.select('#surveillanceScore').append('div')
      .attr('class', 'rule')
      .call(context.rule());
    d3.select('#fireControlScore').append('div')
      .attr('class', 'rule')
      .call(context.rule());

    d3.select('#weaponScore').selectAll('.horizon')
      .data(Object.keys(weaponKeyMetrics).map(getWeaponData))
      .enter().insert('div', '.bottom')
      .attr('class', 'horizon')
      .call(context.horizon()
        .extent([0, 1])
        .format(d3.format('.3r')));
    d3.select('#surveillanceScore').selectAll('.horizon')
      .data(Object.keys(surveillanceKeyMetrics).map(getSurveillanceData))
      .enter().insert('div', '.bottom')
      .attr('class', 'horizon')
      .call(context.horizon()
        .extent([0, 1])
        .format(d3.format('.3r')));
    d3.select('#fireControlScore').selectAll('.horizon')
      .data(Object.keys(fireControlKeyMetrics).map(getFireControlData))
      .enter().insert('div', '.bottom')
      .attr('class', 'horizon')
      .call(context.horizon()
        .extent([0, 1])
        .format(d3.format('.3r')));

    var evalDataNameIndex = {};
    var evalData = [];
    constructEvalData("empty");

    //Options for the Radar chart, other than default
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 800 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    var mycfg = {
        w: width,
        h: height,
        circles: false,
        maxValue: 1.0,
        levels: 6,
        ExtraWidthX: 0
    };
    //RadarChart.draw('#evaluation', evalData, mycfg);
    var chart = RadarChart.chart();
    chart.config(mycfg);
    var svg = d3.select('#evaluation').append('svg')
        .attr('width', width)
        .attr('height', height);
    svg.append('g').classed('single', 1).datum(evalData).call(chart);

    function constructEvalData(name) {
        var index = evalData.length;
        evalDataNameIndex[name] = index;
        evalData.push({
            className: name,
            axes: []
        });
        $.each(weaponKeyMetrics, function(i, v) {
            evalData[index].axes.push({
                axis: v.title,
                value: 0
            })
        });
        $.each(surveillanceKeyMetrics, function(i, v) {
            evalData[index].axes.push({
                axis:  v.title,
                value: 0
            });
        });
    }

    function getData(name, data, title) {
        return context.metric(function(start, stop, step, callback) {

            start = +start;
            stop = +stop;

            var values = [];
            var length = data[name].data.length;

            if(length > 0) {
                while (start <= stop) {
                    var selectedIndex = -1;

                    for(var i = 0; i < length - 1; i++) {
                        var t = data[name].data[i].time;
                        var tp1 = data[name].data[i+1].time;

                        if(start >= t && start <= tp1) {
                            selectedIndex = i;
                        }
                    }

                    if(selectedIndex == -1) {
                        if(start < data[name].data[0].time) {
                            selectedIndex = 0;
                        } else {
                            selectedIndex = length - 1;
                        }
                    }

                    values.push(data[name].data[selectedIndex].value);

                    start += step;
                }
            }

            callback(null, values);
        }, title);
    }

    function getWeaponData(name) {
        return getData(name, weaponData, weaponKeyMetrics[name].title);
    }
    function getSurveillanceData(name) {
        return getData(name, surveillanceData, surveillanceKeyMetrics[name].title);
    }
    function getFireControlData(name) {
        return getData(name, fireControlData, fireControlKeyMetrics[name].title);
    }
});
