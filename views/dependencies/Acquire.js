/**
 * Created by Brent on 11/19/2015.
 */

(function (exports) {

    function Acquire(){
        /*
            optimize
            stopOptimization
            generateThreats
            evaluateScenario
            clearHeatmap
            graph
            RadarChart
        */
    }

    Acquire.prototype.optimize = function() {
        var algorithm = $("#optimizeModal").find("#psoAlgorithm").is(':checked') ? 'PARTICLE_SWARM' :
            $("#optimizeModal").find("#evolutionaryAlgorithm").is(':checked') ? 'EVOLUTIONARY' :
            $("#optimizeModal").find("#greedyAlgorithm").is(':checked') ? 'GREEDY' :
            $("#optimizeModal").find("#stadiumAlgorithm").is(':checked') ? 'STADIUM' : '';

        var type = $("#optimizeModal").find("#sensorsType").is(':checked') ? 'SENSORS' :
            $("#optimizeModal").find("#sensorsTypeTwo").is(':checked') ? 'SENSORS' :
            $("#optimizeModal").find("#weaponsType").is(':checked') ? 'WEAPONS' :
            $("#optimizeModal").find("#weaponsSensorsType").is(':checked') ? 'WEAPONS_SENSORS' :
            $("#optimizeModal").find("#stadiumType").is(':checked') ? 'STADIUM' : '';

        console.log('Optimizing ' + type + ' and ' + algorithm);
        socket.emit('startOptimization', algorithm, type);
    };

    Acquire.prototype.stopOptimization = function() {
        console.log("Stopping optimization");
        socket.emit('stopOptimization');
    };

    Acquire.prototype.generateThreats = function() {
        if (!$("#generateThreatsItem").hasClass("disabled")) {
            console.log("Generating threats");
            socket.emit('generateThreats');
        }
    };

    Acquire.prototype.evaluateScenario = function() {
        console.log("Evaluating scenario");
        clearHeatmap();
        socket.emit('evaluateScenario');
    };

    Acquire.prototype.clearHeatmap = function() {
        for(var p in heatMap) {
            scene.primitives.remove(heatMap[p]);
        }
        heatMap = [];
    };

    Acquire.prototype.graph = function() {
        var self = this;
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
        var chart = self.RadarChart.chart();
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
    };

    Acquire.prototype.RadarChart = {
        defaultConfig: {
            containerClass: 'radar-chart',
            w: 600,
            h: 600,
            factor: 0.95,
            factorLegend: 1,
            levels: 3,
            levelTick: false,
            TickLength: 10,
            maxValue: 0,
            radians: 2 * Math.PI,
            color: d3.scale.category10(),
            axisLine: true,
            axisText: true,
            circles: true,
            radius: 5,
            backgroundTooltipColor: "#555",
            backgroundTooltipOpacity: "0.7",
            tooltipColor: "white",
            axisJoin: function(d, i) {
                return d.className || i;
            },
            transitionDuration: 300
        },
        chart: function() {
            // default config
            var cfg = Object.create(this.defaultConfig);
            var toolip;
            function setTooltip(msg){
                if(msg == false){
                    tooltip.classed("visible", 0);
                    tooltip.select("rect").classed("visible", 0);
                }else{
                    tooltip.classed("visible", 1);

                    var x = d3.event.x;
                    y = d3.event.y;

                    tooltip.select("text").classed('visible', 1).style("fill", cfg.tooltipColor);
                    var padding=5;
                    var bbox = tooltip.select("text").text(msg).node().getBBox();

                    tooltip.select("rect")
                        .classed('visible', 1).attr("x", 0)
                        .attr("x", bbox.x - padding)
                        .attr("y", bbox.y - padding)
                        .attr("width", bbox.width + (padding*2))
                        .attr("height", bbox.height + (padding*2))
                        .attr("rx","5").attr("ry","5")
                        .style("fill", cfg.backgroundTooltipColor).style("opacity", cfg.backgroundTooltipOpacity);
                    tooltip.attr("transform", "translate(" + x + "," + y + ")")
                }
            }
            function radar(selection) {
                selection.each(function(data) {
                    var container = d3.select(this);
                    tooltip = container.append("g");
                    tooltip.append('rect').classed("tooltip", true);
                    tooltip.append('text').classed("tooltip", true);

                    // allow simple notation
                    data = data.map(function(datum) {
                        if(datum instanceof Array) {
                            datum = {axes: datum};
                        }
                        return datum;
                    });

                    var maxValue = Math.max(cfg.maxValue, d3.max(data, function(d) {
                        return d3.max(d.axes, function(o){ return o.value; });
                    }));

                    var allAxis = data[0].axes.map(function(i, j){ return {name: i.axis, xOffset: (i.xOffset)?i.xOffset:0, yOffset: (i.yOffset)?i.yOffset:0}; });
                    var total = allAxis.length;
                    var radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2);
                    var radius2 = Math.min(cfg.w / 2, cfg.h / 2);

                    container.classed(cfg.containerClass, 1);

                    function getPosition(i, range, factor, func){
                        factor = typeof factor !== 'undefined' ? factor : 1;
                        return range * (1 - factor * func(i * cfg.radians / total));
                    }
                    function getHorizontalPosition(i, range, factor){
                        return getPosition(i, range, factor, Math.sin);
                    }
                    function getVerticalPosition(i, range, factor){
                        return getPosition(i, range, factor, Math.cos);
                    }

                    // levels && axises
                    var levelFactors = d3.range(0, cfg.levels).map(function(level) {
                        return radius * ((level + 1) / cfg.levels);
                    });

                    var levelGroups = container.selectAll('g.level-group').data(levelFactors);

                    levelGroups.enter().append('g');
                    levelGroups.exit().remove();

                    levelGroups.attr('class', function(d, i) {
                        return 'level-group level-group-' + i;
                    });

                    var levelLine = levelGroups.selectAll('.level').data(function(levelFactor) {
                        return d3.range(0, total).map(function() { return levelFactor; });
                    });

                    levelLine.enter().append('line');
                    levelLine.exit().remove();

                    if (cfg.levelTick){
                        levelLine
                            .attr('class', 'level')
                            .attr('x1', function(levelFactor, i){
                                if (radius == levelFactor) {
                                    return getHorizontalPosition(i, levelFactor);
                                } else {
                                    return getHorizontalPosition(i, levelFactor) + (cfg.TickLength / 2) * Math.cos(i * cfg.radians / total);
                                }
                            })
                            .attr('y1', function(levelFactor, i){
                                if (radius == levelFactor) {
                                    return getVerticalPosition(i, levelFactor);
                                } else {
                                    return getVerticalPosition(i, levelFactor) - (cfg.TickLength / 2) * Math.sin(i * cfg.radians / total);
                                }
                            })
                            .attr('x2', function(levelFactor, i){
                                if (radius == levelFactor) {
                                    return getHorizontalPosition(i+1, levelFactor);
                                } else {
                                    return getHorizontalPosition(i, levelFactor) - (cfg.TickLength / 2) * Math.cos(i * cfg.radians / total);
                                }
                            })
                            .attr('y2', function(levelFactor, i){
                                if (radius == levelFactor) {
                                    return getVerticalPosition(i+1, levelFactor);
                                } else {
                                    return getVerticalPosition(i, levelFactor) + (cfg.TickLength / 2) * Math.sin(i * cfg.radians / total);
                                }
                            })
                            .attr('transform', function(levelFactor) {
                                return 'translate(' + (cfg.w/2-levelFactor) + ', ' + (cfg.h/2-levelFactor) + ')';
                            });
                    }
                    else{
                        levelLine
                            .attr('class', 'level')
                            .attr('x1', function(levelFactor, i){ return getHorizontalPosition(i, levelFactor); })
                            .attr('y1', function(levelFactor, i){ return getVerticalPosition(i, levelFactor); })
                            .attr('x2', function(levelFactor, i){ return getHorizontalPosition(i+1, levelFactor); })
                            .attr('y2', function(levelFactor, i){ return getVerticalPosition(i+1, levelFactor); })
                            .attr('transform', function(levelFactor) {
                                return 'translate(' + (cfg.w/2-levelFactor) + ', ' + (cfg.h/2-levelFactor) + ')';
                            });
                    }
                    if(cfg.axisLine || cfg.axisText) {
                        var axis = container.selectAll('.axis').data(allAxis);

                        var newAxis = axis.enter().append('g');
                        if(cfg.axisLine) {
                            newAxis.append('line');
                        }
                        if(cfg.axisText) {
                            newAxis.append('text');
                        }

                        axis.exit().remove();

                        axis.attr('class', 'axis');

                        if(cfg.axisLine) {
                            axis.select('line')
                                .attr('x1', cfg.w/2)
                                .attr('y1', cfg.h/2)
                                .attr('x2', function(d, i) { return (cfg.w/2-radius2)+getHorizontalPosition(i, radius2, cfg.factor); })
                                .attr('y2', function(d, i) { return (cfg.h/2-radius2)+getVerticalPosition(i, radius2, cfg.factor); });
                        }

                        if(cfg.axisText) {
                            axis.select('text')
                                .attr('class', function(d, i){
                                    var p = getHorizontalPosition(i, 0.5);
                                    //return 'legend middle';
                                    return 'legend ' +
                                        ((p < 0.4) ? 'right' : ((p > 0.6) ? 'left' : 'middle'));
                                })
                                .attr('dy', function(d, i) {
                                    var p = getVerticalPosition(i, 0.5);
                                    return ((p < 0.1) ? '1em' : ((p > 0.9) ? '0' : '0.5em'));
                                })
                                .text(function(d) { return d.name; })
                                .attr('x', function(d, i){ return d.xOffset+ (cfg.w/2-radius2)+getHorizontalPosition(i, radius2, cfg.factorLegend); })
                                .attr('y', function(d, i){ return d.yOffset+ (cfg.h/2-radius2)+getVerticalPosition(i, radius2, cfg.factorLegend); });
                        }
                    }

                    // content
                    data.forEach(function(d){
                        d.axes.forEach(function(axis, i) {
                            axis.x = (cfg.w/2-radius2)+getHorizontalPosition(i, radius2, (parseFloat(Math.max(axis.value, 0))/maxValue)*cfg.factor);
                            axis.y = (cfg.h/2-radius2)+getVerticalPosition(i, radius2, (parseFloat(Math.max(axis.value, 0))/maxValue)*cfg.factor);
                        });
                    });
                    var polygon = container.selectAll(".area").data(data, cfg.axisJoin);

                    polygon.enter().append('polygon')
                        .classed({area: 1, 'd3-enter': 1})
                        .on('mouseover', function (dd){
                            d3.event.stopPropagation();
                            container.classed('focus', 1);
                            d3.select(this).classed('focused', 1);
                            setTooltip(dd.className);
                        })
                        .on('mouseout', function(){
                            d3.event.stopPropagation();
                            container.classed('focus', 0);
                            d3.select(this).classed('focused', 0);
                            setTooltip(false);
                        });

                    polygon.exit()
                        .classed('d3-exit', 1) // trigger css transition
                        .transition().duration(cfg.transitionDuration)
                        .remove();

                    polygon
                        .each(function(d, i) {
                            var classed = {'d3-exit': 0}; // if exiting element is being reused
                            classed['radar-chart-serie' + i] = 1;
                            if(d.className) {
                                classed[d.className] = 1;
                            }
                            d3.select(this).classed(classed);
                        })
                        // styles should only be transitioned with css
                        .style('stroke', function(d, i) { return cfg.color(i); })
                        .style('fill', function(d, i) { return cfg.color(i); })
                        .transition().duration(cfg.transitionDuration)
                        // svg attrs with js
                        .attr('points',function(d) {
                            return d.axes.map(function(p) {
                                return [p.x, p.y].join(',');
                            }).join(' ');
                        })
                        .each('start', function() {
                            d3.select(this).classed('d3-enter', 0); // trigger css transition
                        });

                    if(cfg.circles && cfg.radius) {

                        var circleGroups = container.selectAll('g.circle-group').data(data, cfg.axisJoin);

                        circleGroups.enter().append('g').classed({'circle-group': 1, 'd3-enter': 1});
                        circleGroups.exit()
                            .classed('d3-exit', 1) // trigger css transition
                            .transition().duration(cfg.transitionDuration).remove();

                        circleGroups
                            .each(function(d) {
                                var classed = {'d3-exit': 0}; // if exiting element is being reused
                                if(d.className) {
                                    classed[d.className] = 1;
                                }
                                d3.select(this).classed(classed);
                            })
                            .transition().duration(cfg.transitionDuration)
                            .each('start', function() {
                                d3.select(this).classed('d3-enter', 0); // trigger css transition
                            });

                        var circle = circleGroups.selectAll('.circle').data(function(datum, i) {
                            return datum.axes.map(function(d) { return [d, i]; });
                        });

                        circle.enter().append('circle')
                            .classed({circle: 1, 'd3-enter': 1})
                            .on('mouseover', function(dd){
                                d3.event.stopPropagation();
                                setTooltip(dd[0].value);
                                //container.classed('focus', 1);
                                //container.select('.area.radar-chart-serie'+dd[1]).classed('focused', 1);
                            })
                            .on('mouseout', function(dd){
                                d3.event.stopPropagation();
                                setTooltip(false);
                                container.classed('focus', 0);
                                //container.select('.area.radar-chart-serie'+dd[1]).classed('focused', 0);
                                //No idea why previous line breaks tooltip hovering area after hoverin point.
                            });

                        circle.exit()
                            .classed('d3-exit', 1) // trigger css transition
                            .transition().duration(cfg.transitionDuration).remove();

                        circle
                            .each(function(d) {
                                var classed = {'d3-exit': 0}; // if exit element reused
                                classed['radar-chart-serie'+d[1]] = 1;
                                d3.select(this).classed(classed);
                            })
                            // styles should only be transitioned with css
                            .style('fill', function(d) { return cfg.color(d[1]); })
                            .transition().duration(cfg.transitionDuration)
                            // svg attrs with js
                            .attr('r', cfg.radius)
                            .attr('cx', function(d) {
                                return d[0].x;
                            })
                            .attr('cy', function(d) {
                                return d[0].y;
                            })
                            .each('start', function() {
                                d3.select(this).classed('d3-enter', 0); // trigger css transition
                            });

                        // ensure tooltip is upmost layer
                        var tooltipEl = tooltip.node();
                        tooltipEl.parentNode.appendChild(tooltipEl);
                    }
                });
            }

            radar.config = function(value) {
                if(!arguments.length) {
                    return cfg;
                }
                if(arguments.length > 1) {
                    cfg[arguments[0]] = arguments[1];
                }
                else {
                    d3.entries(value || {}).forEach(function(option) {
                        cfg[option.key] = option.value;
                    });
                }
                return radar;
            };

            return radar;
        },
        draw: function(id, d, options) {
            var chart = this.RadarChart.chart().config(options);
            var cfg = chart.config();

            d3.select(id).select('svg').remove();
            d3.select(id)
                .append("svg")
                .attr("width", cfg.w)
                .attr("height", cfg.h)
                .datum(d)
                .call(chart);
        }
    };

    exports.Acquire = Acquire;
})(this);

$(document).ready(function() {
    $('input[type=radio][name=algorithmRadio]').change(function() {
        if (this.value == 'algStadium') {
            $('#algOne').hide();
            $('#algTwo').show();
            $('#sensorsTypeTwo').prop('checked','true');
        }
        else{
            $('#algOne').show();
            $('#algTwo').hide();
            $('#sensorsType').prop('checked','true');
        }
    });
});