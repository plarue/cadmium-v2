/**
 * Created by Brent on 9/30/2015.
 */
//HEAT MAP
var Heatmap = {};
var currentHeatMap = [];
socket.on('defendedArea', function(grid) {
    currentHeatMap = currentHeatMap.concat(hexbin(grid));
});

function voronoiGrid(grid) {
    console.log("Displaying grid");
    var voronoi = d3.geom.voronoi();
    voronoi.clipExtent([[grid.bounds.west, grid.bounds.south], [grid.bounds.east, grid.bounds.north]]);
    voronoi.x(function(d) {
        return d.lon;
    });
    voronoi.y(function(d) {
        return d.lat;
    });

    var polygons = voronoi(grid.points);

    var primitives = [];

    for(var i in polygons) {
        var vertices = [];
        for(var j in polygons[i]) {
            if(Array.isArray(polygons[i][j])) {
                vertices = vertices.concat(polygons[i][j]);
            }
        }
        var pg = new Cesium.Polygon({
            positions: Cesium.Cartesian3.fromDegreesArray(vertices),
            material: new Cesium.Material({
                fabric : {
                    type : 'Color',
                    uniforms : {
                        //color : new Cesium.Color(1.0 - grid.points[i].avgPk, grid.points[i].avgPk, 0.0, 0.6)
                        color : new Cesium.Color(
                            red(2 * (1 - grid.points[i].maxPk) - 1),
                            green(2 * (1 - grid.points[i].maxPk) - 1),
                            blue(2 * (1 - grid.points[i].maxPk) - 1), 0.6)
                    }
                }
            })
        });
        scene.primitives.add(pg);
        primitives.push(pg);
    }

    return primitives;
}
function hexbin(grid) {
    console.log("Displaying grid");

    var chartWidth = (grid.bounds.west > grid.bounds.east) ? (grid.bounds.west - grid.bounds.east) : (grid.bounds.west - grid.bounds.east);
    var chartHeight = (grid.bounds.north > grid.bounds.south) ? (grid.bounds.north - grid.bounds.south) : (grid.bounds.south - grid.bounds.north);
    var minPointDist = closestPair(grid.points);
    console.log(minPointDist);

    var hexbin = d3.hexbin()
        .size([chartWidth, chartHeight])
        .radius(minPointDist/2)
        .x(function(d) {return x(d.lon);})
        .y(function(d) {return y(d.lat);});

    var polygons = hexbin(grid.points);
    console.log(polygons);
    var primitives = [];

    /*for(var i in polygons) {
        var vertices = [];
        for(var j in polygons[i]) {
            if(Array.isArray(polygons[i][j])) {
                vertices = vertices.concat(polygons[i][j]);
            }
        }
        var pg = new Cesium.Polygon({
            positions: Cesium.Cartesian3.fromDegreesArray(vertices),
            material: new Cesium.Material({
                fabric : {
                    type : 'Color',
                    uniforms : {
                        //color : new Cesium.Color(1.0 - grid.points[i].avgPk, grid.points[i].avgPk, 0.0, 0.6)
                        color : new Cesium.Color(
                            red(2 * (1 - grid.points[i].maxPk) - 1),
                            green(2 * (1 - grid.points[i].maxPk) - 1),
                            blue(2 * (1 - grid.points[i].maxPk) - 1), 0.6)
                    }
                }
            })
        });
        scene.primitives.add(pg);
        primitives.push(pg);
    }*/

    return primitives;
}
function interpolate(val, y0, x0, y1, x1) {
    return (val-x0)*(y1-y0)/(x1-x0) + y0;
}
function base(val) {
    if ( val <= -0.75 ) return 0;
    else if ( val <= -0.25 ) return interpolate( val, 0.0, -0.75, 1.0, -0.25 );
    else if ( val <= 0.25 ) return 1.0;
    else if ( val <= 0.75 ) return interpolate( val, 1.0, 0.25, 0.0, 0.75 );
    else return 0.0;
}
function red(val) {
    return base(val - 0.5);
}
function green(val) {
    return base(val);
}
function blue(val) {
    return base(val + 0.5);
}
function closestPair(P){
    var minDist = Infinity;
    var closest;
    for (var i = 0; i < P.length - 1; i++) {
        for (var j = i + 1; i < P.length; j++) {
            var p = [P[i].lat, P[i.lon]], q = [P[j].lat, P[j].lon];
            if (dist(p, q) < minDist) {
                minDist = dist(p, q);
                closest = [p,q]
            }
        }
    }
    return minDist;
}
function latLon2Meters(p1, p2){
    var R = 6371000; // metres
    var ?1 = p1[0].toRadians();
    var ?2 = p2[0].toRadians();
    var ?? = (p2[0]-p1[0]).toRadians();
    var ?? = (p2[1]-p1[1]).toRadians();

    var a = Math.sin(??/2) * Math.sin(??/2) +
        Math.cos(?1) * Math.cos(?2) *
        Math.sin(??/2) * Math.sin(??/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}
function dist(p1, p2) {
    return Math.sqrt((p1[0] -= p2[0]) * p1[0] + (p1[1] -= p2[1]) * p1[1]);
}

function clearHeatmap() {
    for(var p in currentHeatMap) {
        scene.primitives.remove(currentHeatMap[p]);
    }
    currentHeatMap = [];
};