/**
 * Created by Brent Shanahan on 5/18/2015.
 */
var viewer = new Cesium.Viewer('cesiumContainer', {
    scene3DOnly : true,
    baseLayerPicker : false,
    infoBox : false,
    animation : false,
    timeline : false,
    navigationHelpButton : false,
    geocoder : false,
    //OFFLINE IMAGERY PROVIDER
    /*imageryProvider : new Cesium.TileMapServiceImageryProvider({
        //url : Cesium.buildModuleUrl('/Cesium/Assets/Textures/NaturalEarthII')
        url : ('../../public/javascripts/Cesium/Assets/Textures/NaturalEarthII'),
        maximumLevel : 5
    }),*/
    //ONLINE IMAGERY PROVIDER
    imageryProvider : new Cesium.BingMapsImageryProvider({
        url : '//dev.virtualearth.net',
        mapStyle : Cesium.BingMapsStyle.AERIAL_WITH_LABELS
    }),
    /*imageryProvider : new Cesium.WebMapTileServiceImageryProvider({
        url : 'http://map1.vis.earthdata.nasa.gov/wmts-geo/wmts.cgi?SERVICE=WMTS&request=GetCapabilities',
        layer : 'MODIS_Terra_SurfaceReflectance_Bands121',
        style : 'default',
        format : 'image/jpeg',
        tileMatrixSetID : 'EPSG4326_250m',
        // tileMatrixLabels : ['default028mm:0', 'default028mm:1', 'default028mm:2' ...],
        maximumLevel: 9,
        credit : new Cesium.Credit('U. S. Geological Survey'),
        proxy: new Cesium.DefaultProxy('/proxy/')
    }),*/
    terrainProvider : new Cesium.CesiumTerrainProvider({
        url : '//assets.agi.com/stk-terrain/world'
    })
    //creditContainer: "hidden"
});

var scene = viewer.scene;
var terrainProvider = new Cesium.CesiumTerrainProvider({
    url : '//assets.agi.com/stk-terrain/world'
});
var ellipsoid = scene.globe.ellipsoid;
var handler;
var i = 0;
var msg = 'default';
var socket = io();
var camera = scene.camera;

//MIL STD 2525
var RendererSettings = armyc2.c2sd.renderer.utilities.RendererSettings;
var msa = armyc2.c2sd.renderer.utilities.MilStdAttributes;

/**
 * PICKING HANDLERS
 */
function assetCollection(e){
    var indId = 'ind' + e.target.id;
    var indicator = document.getElementById(indId);
    if (e.target.value == 0) {
        viewer.dataSources.remove(assetStream);
        indicator.style.backgroundColor = '#ff0000';
    }else{
        viewer.dataSources.add(assetStream);
        indicator.style.backgroundColor = '#adff2f';
    }
}
function trackCollection(e){
    var value = e.target.value;
    var keys = Object.keys(currentGeometry);
    var targetKey = [];
    for (var i=0; i < keys.length; i++) {
        var current = keys[i].slice(0,1);
        if (current == 'T'){
            targetKey.push(keys[i]);
        }
    }
    var indId = 'ind' + e.target.id;
    var indicator = document.getElementById(indId);
    for (var i=0; i < targetKey.length; i++) {
        var attributes = currentGeometry[targetKey[i]].getGeometryInstanceAttributes(targetKey[i]);
        if (value == 0) {
            attributes.show = Cesium.ShowGeometryInstanceAttribute.toValue(false);
            indicator.style.backgroundColor = '#ff0000';
        } else {
            attributes.show = Cesium.ShowGeometryInstanceAttribute.toValue(true);
            indicator.style.backgroundColor = '#adff2f';
        }
    }
}
function selectInputs(e) {
    var value = e.target.value;
    var instances = currentGeometry[e.target.id]._numberOfInstances;
    var indId = 'ind' + e.target.id;
    var indicator = document.getElementById(indId);
    for (var i=0; i < instances; i++) {
        var targetId = ("" + e.target.id) + i;
        var attributes = currentGeometry[e.target.id].getGeometryInstanceAttributes(targetId);
        if (value == 0) {
            attributes.show = Cesium.ShowGeometryInstanceAttribute.toValue(false);
            indicator.style.backgroundColor = '#ff0000';
        } else {
            attributes.show = Cesium.ShowGeometryInstanceAttribute.toValue(true);
            indicator.style.backgroundColor = '#adff2f';
        }
    }
}
function entityListSelect(e){
    var type = e.target.value;
    var id = e.target.id;
    $('#selections').html('');
    $('#pickedO').html('');
    $('#noSelect').hide();
    $('#multipleSelect').hide();
    DOM.displayElementData(id, type, '#pickedO');
}
var pickHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
pickHandler.setInputAction(function(click) {
    var pickedObjects = scene.drillPick(click.position);
    if (Cesium.defined(pickedObjects)){
        var ul = $('#selections');
        var uldata = $('#pickedO');
        var noSelect = $('#noSelect');
        var multipleSelect = $('#multipleSelect');
        $('#entityControls').hide();
        ul.html('');
        uldata.html('');
        noSelect.show();
        multipleSelect.hide();
        if (pickedObjects.length > 1) {
            noSelect.hide();
            multipleSelect.show();
            var elements = [];
            for (i=0; i < pickedObjects.length; i++){
                var elementType = DOM.elType(pickedObjects[i].id);
                elements.push(elementType[0] + ' ' + elementType[1] + ' ' + elementType[2]);
            }
            var selections = DOM.removeDuplicates(elements);
            var goodInputs = [];
            for (i = 0; i < selections.length; i++) {
                var element = selections[i].match(/[^ ]+/g);
                if (element[0] != 'track' || element[0] != 'err'){
                    goodInputs.push(element);
                }
            }
            if (goodInputs.length == 1){
                multipleSelect.hide();
                DOM.displayElementData(goodInputs[0][1], goodInputs[0][0], '#pickedO');
            }else if (goodInputs.length > 1){
                for (i = 0; i < goodInputs.length; i++) {
                    var element = goodInputs[i];
                    var li = DOM.createSelection(element[1], element[2], element[0]);
                    ul.append(li);
                }
            }else{
                noSelect.show();
                multipleSelect.hide();
            }
        } else if (pickedObjects.length == 1) {
            noSelect.hide();
            var elementType = DOM.elType(pickedObjects[0].id);
            var elementID = elementType[1];
            if (elementType[0] != 'err' && elementType[0] != 'track'){
                DOM.displayElementData(elementID, elementType[0], '#pickedO');
            } else if(elementType[0] == 'track') {
                noSelect.show();
                multipleSelect.hide();
            } else {
                console.log('Unknown ElementType in selected Element.');
                loggingMessage('Unknown ElementType in selected Element.');
            }
        }
    }
},Cesium.ScreenSpaceEventType.LEFT_CLICK);

/**
 * ACQUIRE/C2 INCOMING & OUTGOING DATA
 */
//INIT ACQUIRE
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
function optimize() {
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
}
function stopOptimization() {
    console.log("Stopping optimization");
    socket.emit('stopOptimization');
}
function evaluateScenario() {
    console.log("Evaluating scenario");
    clearHeatmap();
    socket.emit('evaluateScenario');
}
function generateThreats() {
    if(!$("#generateThreatsItem").hasClass("disabled")) {
        console.log("Generating threats");
        socket.emit('generateThreats');
    }
}

//HEAT MAP
var heatMap = [];
socket.on('defendedArea', function(grid) {
    heatMap = heatMap.concat(hexbinTwo(grid));
});
function hexbin(grid) {
    console.log("Displaying grid");

    var polygons = bruteForce(grid.points);
    var primitives = [];

    for(var i in polygons) {
        var rad = polygons[i].diameter - (polygons[polygons[i].nIndex].diameter / 2);
        var vertices = hexagon(polygons[i].lat, polygons[i].lon, rad);
        var rgba = new Cesium.Color(
            red(2 * (1 - polygons[i].maxPk) - 1),
            green(2 * (1 - polygons[i].maxPk) - 1),
            blue(2 * (1 - polygons[i].maxPk) - 1),
            0.8
        );
        if (i == 1){console.log(rgba);console.log(vertices);}
        viewer.entities.add({
            polygon : {
                hierarchy : Cesium.Cartesian3.fromDegreesArray(vertices),
                material : rgba
            }
        });
    }

    return primitives;
}
function hexbinTwo(grid){
    console.log("Displaying Grid");
    var b = grid.bounds,
        chartWidth = (b.west > b.east) ? b.west - b.east : b.east - b.west,
        chartHeight = (b.north > b.south) ? b.north - b.south : b.south - b.north,
        avgDist = bruteAvg(grid.points);
    console.log(chartWidth + ' x ' + chartHeight);
    console.log(avgDist);

    var hexbin = d3.hexbin()
        .size([chartWidth, chartHeight])
        .radius(avgDist[0]);

    var polygons = hexbin(grid.points);

    console.log(polygons);

    for (var i in polygons){
        var pkArray = [];
        for (var j in polygons[i]){
            if (typeof polygons[i][j] === 'object'){
                pkArray.push(polygons[i][j].maxPk);
            }
        }
        var sum = pkArray.reduce(function(a,b){return a + b;});
        var avgPk = sum / pkArray.length;
        var vertices = hexagon(polygons[i].y, polygons[i].x, avgDist[1]);
        var rgba = new Cesium.Color(
            red(2 * (1 - avgPk) - 1),
            green(2 * (1 - avgPk) - 1),
            blue(2 * (1 - avgPk) - 1),
            0.8
        );
        viewer.entities.add({
            polygon : {
                hierarchy : Cesium.Cartesian3.fromDegreesArray(vertices),
                material : rgba
            }
        });
    }
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
function bruteForce(points) {
    var ordered = [];
    var point1 = null;
    var point2 = null;
    var distance = null;
    var nearestIndex = null;

    for (var i = 0; i < points.length; i++) {
        for (var j = 0; j < points.length; j++) {
            if (j !== i) {
                var curr = haversine([points[i].lat, points[i].lon], [points[j].lat, points[j].lon]);
                if (distance === null || curr < distance) {
                    distance = curr;
                    point1 = [points[i].lat, points[i].lon];
                    point2 = [points[j].lat, points[j].lon];
                    nearestIndex = j;
                }
            }
        }
        if(distance !== null) {
            var newPoint = points[i];
            newPoint.diameter = distance;
            newPoint.nIndex = nearestIndex;
            ordered.push(newPoint);
            distance = null;
        }
    }
    return ordered;
}
function bruteAvg(points) {
    var minDist = null,
        currDeg = {},
        currHav = {},
        allMinDeg = [],
        allMinHav = [];

    for (var i = 0; i < points.length; i++) {
        for (var j = 0; j < points.length; j++) {
            if (j !== i) {
                var deg = Math.sqrt(Math.pow(points[i].lat - points[j].lat, 2) + Math.pow(points[i].lon - points[j].lon, 2));
                var hav = haversine([points[i].lat, points[i].lon], [points[j].lat, points[j].lon]);
                if (minDist === null || deg < minDist) {
                    minDist = deg;
                    currDeg = {i: j, dist: deg};
                    currHav = {i: j, dist: hav};
                }
            }
        }
        if(minDist !== null) {
            allMinDeg.push(currDeg);
            allMinHav.push(currHav);
            minDist = null;
            currDeg = {};
            currHav = {};
        }
    }
    allMinDeg.sort(function(a,b){return parseFloat(a.dist) - parseFloat(b.dist);});
    var lookup = {};
    for (var i = 0, len = allMinHav.length; i < len; i++) {
        lookup[allMinHav[i].i] = allMinHav[i];
    }
    console.log(allMinDeg);
    console.log(allMinDeg.length - 1);
    console.log(allMinHav);
    var maxDeg = allMinDeg[allMinDeg.length - 1].dist,
        maxIndex = allMinDeg[allMinDeg.length - 1].i,
        minDeg = allMinDeg[0].dist,
        minIndex = allMinDeg[0].i,
        maxHav = lookup[maxIndex].dist,
        minHav = lookup[minIndex].dist;
    return [((minDeg + maxDeg)/2), ((minHav + maxHav)/2)];
}
function toRad(x) {
    return x * Math.PI / 180;
}
function haversine(p1, p2){
    var R = 6371000; // metres
    var L1 = toRad(p1[0]);
    var L2 = toRad(p2[0]);
    var dLat = toRad((p2[0]-p1[0]));
    var dLon = toRad((p2[1]-p1[1]));

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(L1) * Math.cos(L2) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}
function hexagon(lat, lon, radius){
    var vertices = [],
        R=6378137,
        x = lat,
        y = lon,
        nOffset = radius,
        dy = nOffset/(R*Math.cos(Math.PI*x/180)),
        cx = x,
        cy = y + dy * 180/Math.PI;
    for (var i=0; i <= 360; i+=60){
        var theta = (Math.PI / 180) * i,
            cos = Math.cos(theta),
            sin = Math.sin(theta),
            nx = (sin * (cx - x)) + (cos * (cy - y)) + x,
            ny = (sin * (cy - y)) + (cos * (cx - x)) + y;
        vertices.push(ny, nx);
    }
    return vertices;
}
function clearHeatmap() {
    for(var p in heatMap) {
        scene.primitives.remove(heatMap[p]);
    }
    heatMap = [];
}

//CLEAR DATA
function clearData(callback) {
    console.log('Clearing existing data');
    var dbType = ['sensor', 'weapon', 'track', 'asset'];
    for (var i=0; i < 4; i++){
        socket.emit('findAll', dbType[i], dbType[i], function (cb, pt) {
            if (cb.length > 0) {
                for (var i = 0; i < cb.length; i++) {
                    DOM[cb[i].create]('remove', cb[i]);
                }
            }else{console.log('Database \"' + pt + '\" contained no data')}
            if (pt == 'asset'){
                document.getElementById('entityList').innerHTML = '';
                if(callback) {
                    callback();
                }
            }
        });
    }
}

//NEW SCENARIO
function newScenario() {
    clearData(function(){
        socket.emit('newF');
    });
}

//REFRESH FROM DATABASE
function refreshData() {
    clearData(function() {
        console.log('Refreshing data');
        var db = ['sensor', 'weapon', 'track', 'asset'];
        for (var i=0; i < 4; i++) {
            socket.emit('refreshAll', db[i], function (cb) {
                for (var rA in cb) {
                    DOM[cb[rA].create]('add', cb[rA]);
                }
            });
        }
    });
}

/**
 * CESIUM ELEMENT CONSTRUCTION/UPDATING
 */
socket.on('loadElement', function(dbData){
    if(dbData) {
        DOM[dbData.create]('add', dbData);
    }
});
socket.on('updateElement', function(dbData){
    if (dbData) {
        DOM[dbData.create]('remove', dbData);
        DOM[dbData.create]('add', dbData);
    }
});

/**
 * SCENARIO LOADING
 */
function openScenario() {
    socket.emit('openFile', function (dirs) {
        if (dirs.length > 0) {
            var scene = document.getElementById('scenarios');
            scene.innerHTML = '';
            for (var i = 0; i < dirs.length; i++) {
                var opt = document.createElement('option');
                opt.setAttribute('value', dirs[i]);
                opt.innerHTML = dirs[i];
                opt.required = true;
                scene.size = i + 1;
                scene.appendChild(opt);
            }
        }
        $('#openModal').modal();
    })
}
function loadScenario(){
    var e = document.getElementById('scenarios');
    var sel = e.options[e.selectedIndex].value;
    clearData(function() {
        socket.emit('getScenario', sel, function (msg) {
            $('#generateThreatsItem').removeClass('disabled');
            if (msg == 'pop') {
                console.log(msg);
            }
        })
    })
}

/**
 * SCENARIO SAVING
 */
function saveScenario() {
    document.getElementById('saveDialog').style.display = 'block';
}
function saveFile() {
    document.getElementById('saveDialog').style.display = 'none';
    var name = document.getElementById('scenarioName').value;
    socket.emit('saveScenario', name, function(cb){
        console.log(cb);
    });
}

/**
 * IMPORT FILE LOADING
 */
function importFile() {
    $('#importModal').modal()
}
document.getElementById('files').onchange = handleFileSelect;
function handleFileSelect() {
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        var files = document.getElementById('files');
        var names = [];
        for (var i=0; i < files.files.length; i++) {
            names.push('<tr><td><p>', files.files.item(i).name, '</p></td></tr>');
        }
        document.getElementById('fileNames').innerHTML = '<table><tr><th><h4>Files</h4></th></tr>' + names.join('') + '</table>';
    } else {
        alert('The File APIs are not fully supported by your browser.');
    }
}
function loadFile(){
    var inp = document.getElementById('files');
    for (var i=0; i < inp.files.length; i++) {
        var file = inp.files[i];
        var r = new FileReader();
        r.i = i;
        r.ftype = getFileType(inp.files.item(i).name);
        r.onload = function(e) {
            var text = e.target.result;
            var dataArray = text.split(/\r\n|\n|\r/);
            for (var i=0; i < dataArray.length; i++) {
                var line = dataArray[i];
                socket.emit('importFile', this.ftype, line)
            }
        };
        r.readAsText(file);
    }
}
function getFileType(name){
    var nm = name.toLowerCase();
    if (nm.indexOf('radar') > -1){
        return 'loadSensor';
    }else if(nm.indexOf('launcher') > -1){
        return 'loadWeapon';
    }else if(nm.indexOf('threat') > -1){
        if (nm.indexOf('area') > -1){
            return 'loadAsset';
        }else {
            return 'loadThreat';
        }
    }else if(nm.indexOf('region') > -1 || nm.indexOf('area') > -1 || nm.indexOf('asset') > -1){
        return 'loadAsset';
    }else{
        console.log('File type unidentifiable')
    }
}
/**
 * ENTITY HANDLING
 */
function entHandler(action){
    var data = {};
    $('#pickedO :input').each(function(){
        var id = this.id;
        data[id] = $(this).val();
    });
    if (action == 'update') {
        updateEntity(data)
    }else if (action == 'move') {
        socket.emit('searchID', action, data.cType, data.id, function(cb, msg){
            moveEntity(cb)
        })
    }else if(action == 'delete') {
        deleteEntity(data)
    }
}
function updateEntity(data){
    DOM[data.create]('remove', data);
    (function(data) {
        socket.emit('updateData', data.id, data.cType, data, function (cb) {
            DOM[cb.create]('add', cb);
            $('#pickedO').html('');
            DOM.displayElementData(cb.id, cb.cType, '#pickedO');
        });
    })(data);
}
function moveEntity(data){
    var mousePosition = new Cesium.Cartesian2();
    var mousePositionProperty = new Cesium.CallbackProperty(
        function(time, result){
            var position = scene.camera.pickEllipsoid(mousePosition, undefined, result);
            var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);
            cartographic.height = 0.0;
            return Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic);
        },
        false);

    var dragging = false;
    var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    var rem = {id: data.id};
    var dt, icon;
    (data.cType == 'sensor') ? icon = "SFGPESR---*****" : icon = "SFGPEWM---*****";
    handler.setInputAction(
        function(click) {
            var pickLoc = Cesium.Cartesian3.fromDegrees(data.Lon, data.Lat);
            var pickedObject = scene.pick(Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, pickLoc));
            if (Cesium.defined(pickedObject)) {
                dragging = true;
                scene.screenSpaceCameraController.enableRotate = false;
                DOM.createVolume('remove', rem);
                dt = DOM.createIcon(icon, 'dragTemp', data.name, data.Lon, data.Lat, 0);
                Cesium.Cartesian2.clone(click.position, mousePosition);
                dt.position = mousePositionProperty;
            }
        },
        Cesium.ScreenSpaceEventType.LEFT_DOWN
    );

    handler.setInputAction(
        function(movement) {
            if (dragging) {
                Cesium.Cartesian2.clone(movement.endPosition, mousePosition);
            }
        },
        Cesium.ScreenSpaceEventType.MOUSE_MOVE
    );

    handler.setInputAction(
        function(click) {
            if(dragging) {
                dragging = false;
                scene.screenSpaceCameraController.enableRotate = true;
                viewer.entities.removeById('dragTemp');
                var cp = scene.camera.pickEllipsoid(click.position);
                var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cp);
                var positions = [Cesium.Cartographic.fromRadians(cartographic.longitude, cartographic.latitude)];
                var promise = Cesium.sampleTerrain(terrainProvider, 11, positions);
                Cesium.when(promise, function (updatedPositions) {
                    cartographic.height = positions[0].height;
                    data.Lat = Cesium.Math.toDegrees(cartographic.latitude);
                    data.Lon = Cesium.Math.toDegrees(cartographic.longitude);
                    data.Alt = cartographic.height;
                    data.latlonalt = [data.Lon, data.Lat, data.Alt];
                    socket.emit('updateData', data.id, data.cType, data, function(cb){
                        DOM.createVolume('add', cb);
                        $('#pickedO').html('');
                        DOM.displayElementData(cb.id, cb.cType, '#pickedO');
                    });
                    handler = handler && handler.destroy();
                });
            }
        },
        Cesium.ScreenSpaceEventType.LEFT_UP
    );
}
function deleteEntity(data){
    $('#pickedO').html('');
    DOM[data.create]('remove', data);
    socket.emit('removeData', data.cType, data.id);
}
/**
 * ENTITY CREATION
 */
function createModal(type){
    (type === 'sensor') ? volumeModalInit(type, function(){$('#sensorModal').modal()}) :
        (type === 'weapon')? volumeModalInit(type, function(){$('#weaponModal').modal()})
            :$('#assetModal').modal();
}
function volumeModalInit(type, cb) {
    var db;
    $('#' + type + 's').html('');
    if (type === 'sensor') {
        db = 'radarTypes';
        $('#weaponIDs').html('');
    }else {
        db = 'weaponTypes';
        $('#sensorIDs').html('');
    }
    socket.emit('findAll', db, type, function(results, type){
        var dd = $('#' + type + 's'),
            labelText, idType;
        dd.append($('<option selected disabled>Select..</option>'))
        for (var i=0; i < results.length; i++){
            dd.append($('<option>' + results[i].name + '</option>')
                    .attr('id', results[i].name)
                    .attr('value', results[i].id)
            );
        }
        if (type === 'sensor'){
            labelText = 'Weapon IDs';
            idType = 'weapon';
        }else {
            labelText = 'Sensor IDs';
            idType = 'sensor';
        }
        $('#' + idType + 'IDs')
            .append($('<label>' + labelText + '</label>').attr('for', idType + 'ID0'))
            .append($('<input class="form-control spaced-bottom" maxlength="3" required/>')
                .attr('id', idType + 'ID0')
        );
    });
    if(cb){
        cb()
    }
}
function addID(type, pm){
    var id = '#' + type + 'IDs';
    var len = $(id + ' input').length;
    var n;
    if (pm){
        n = type + 'ID' + len;
        $(id)
            .append($('<label class="noShow"></label>')
                .attr('for', n)
                .addClass(n)
            )
            .append($('<input class="form-control spaced-bottom" maxlength="3" required/>')
                .attr('id', n)
                .addClass(n)
        );
    }else{
        n = type + 'ID' + (len -1);
        $('.' + n).remove();
    }
}
function wsSubmit(type) {
    var id = $('#' + type + 'ID').val(),
        db = (type === 'sensor') ? 'radarTypes' : 'weaponTypes',
        element = {
            Index: 0,
            name: id,
            Type: $('#' + type + 's').val(),
            Identifier: id,
            Fixed: ($('#' + type + 'Fixed').is(':checked')) ? 1 : 0,
            cType: type,
            create: 'createVolume'
        },
        elementIDs = [];
    if (type === 'sensor'){
        $('#weaponIDs input').each(function(){
            elementIDs.push($(this).val());
        });
        element.id = 'S' + id;
        element.numWeaponIDs = elementIDs.length;
        element.WeaponIDs = elementIDs;
        element.KFactorClass = $('#KFactorClass').val();
        element.KFactorType = $('#KFactorType').val();
        element.KFactorID = $('#KFactorID').val();
    }else {
        $('#sensorIDs input').each(function () {
            elementIDs.push($(this).val());
        });
        element.id = 'W' + id;
        element.numSensorIDs = elementIDs.length;
        element.SensorIDs = elementIDs;
    }
    var geoID = Object.keys(currentGeometry);
    for (var i = 0; i < geoID.length; i++) {
        if ((element.id) == geoID[i]) {
            console.log('ID already in use!');
            loggingMessage('ID already in use!');
            return;
        }
    }
    var mousePosition = new Cesium.Cartesian2();
    var mousePositionProperty = new Cesium.CallbackProperty(
        function(time, result){
            var position = scene.camera.pickEllipsoid(mousePosition, undefined, result);
            var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position);
            cartographic.height = 0.0;
            return Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic);
        },
        false);

    var entity = viewer.entities.add({
        label: {
            show: false
        }
    });
    var entitytwo = viewer.entities.add({
        polyline: {
            show: false,
            width: 2,
            material: Cesium.Color.YELLOW
        }
    });
    var entitythree = viewer.entities.add({
        polyline: {
            show: false,
            width: 1,
            material: Cesium.Color.YELLOW
        }
    });

    var lla = [],
        stage = 0,
        degree = 0,
        cartesian,
        cartographic,
        cartographictwo;
    var positionHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

    positionHandler.setInputAction(function (movement) {
        if (stage == 0) {
            cartesian = scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
            if (cartesian) {
                Cesium.Cartesian2.clone(movement.endPosition, mousePosition);
                cartographic = ellipsoid.cartesianToCartographic(cartesian);
                var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(4);
                var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4);

                entity.position = mousePositionProperty;
                entity.label.show = true;
                entity.label.text = '( ' + longitudeString + ', ' + latitudeString + ' )';
            } else {
                entity.label.show = false;
            }
        }else if (stage == 1){
            var cartesiantwo = scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
            if (cartesiantwo) {
                cartographictwo = ellipsoid.cartesianToCartographic(cartesiantwo);
                var dlat = cartographictwo.latitude - cartographic.latitude;
                var dlon = cartographictwo.longitude - cartographic.longitude;
                var curDegree = Cesium.Math.toDegrees(Math.PI / 2.0 - Math.atan2(dlat, dlon)).toFixed(1);
                if (+curDegree <= 0){
                    degree = +curDegree + 360;
                }else(degree = +curDegree);
                Cesium.Cartesian2.clone(movement.endPosition, mousePosition);
                entity.position = mousePositionProperty;
                entity.label.show = true;
                entity.label.text = '( Rotation: ' + degree + ' Degrees )';
                entitytwo.polyline.positions = new Cesium.CallbackProperty(function(){
                    return [cartesian, cartesiantwo];
                }, false);
                entitytwo.polyline.show = true;
                entitythree.polyline.positions = Cesium.Cartesian3.fromDegreesArray([element.Lon, element.Lat, element.Lon, 90]);
                entitythree.polyline.show = true;
            } else {
                entity.label.show = false;
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    positionHandler.setInputAction(function (click) {
        if (stage == 0) {
            cartesian = scene.camera.pickEllipsoid(click.position, ellipsoid);
            if (cartesian) {
                cartographic = ellipsoid.cartesianToCartographic(cartesian);
                element.Lat = Cesium.Math.toDegrees(cartographic.latitude);
                element.Lon = Cesium.Math.toDegrees(cartographic.longitude);
                element.Alt = Cesium.Math.toDegrees(cartographic.height);
                Cesium.sampleTerrain(terrainProvider, 11, [cartographic])
                    .then(function (updatedPositions) {
                        stage = 1;
                        entity.label.show = false;
                        element.Alt = updatedPositions[0].height;
                    });
            }
        }else if (stage === 1) {
            socket.emit('searchID', element, db, element.Type, function(cb, element){
                element.latlonalt = [element.Lat, element.Lon, element.Alt];
                if (type === 'sensor') {
                    element.BoresightAz = +degree;
                    element.minEl = cb.minEl;
                    element.maxEl = cb.maxEl;
                    element.max_Range = cb.max_Range;
                    element.minRng = cb.minRng;
                    element.boresight_Half_Ang_Az = cb.boresight_Half_Ang_Az;
                    element.boresight_Half_Ang_El = +degree;
                    element.nFaces = cb.nFaces;
                    element.boresightEl = cb.boresightEl;
                }else{
                    element.Boresight = +degree;
                    element.minEl = 0;
                    element.max_Range = (cb.maxFanAlt + cb.maxFanDR) / 2;
                    element.minRng = cb.Min_Alt_Int;
                    element.boresight_Half_Ang_Az = cb.FOF_halfangle;
                    element.boresight_Half_Ang_El = +degree;
                    element.nFaces = 2;
                    element.maxEl = 90;
                    element.boresightEl = 0;
                }
                console.log("Creating " + type);
                loggingMessage("Creating " + type);
                DOM.createVolume('add', element);
                socket.emit('newElement', type, element);
            });
            viewer.entities.remove(entity);
            viewer.entities.remove(entitytwo);
            viewer.entities.remove(entitythree);
            positionHandler = positionHandler && positionHandler.destroy();
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

$('#shape').on('change', function(){
    if ($(this).val() == 'Circle'){
        $('#polygonInst').hide();
        $('#circleInst').show();
    }else if($(this).val() == 'Polygon'){
        $('#polygonInst').show();
        $('#circleInst').hide();
    }else {
        $('#polygonInst').hide();
        $('#circleInst').hide();
    }
});
function createAsset(){
    var id = $('#assetName').val();
    var asset = {
        name: id,
        id: 'A' + id,
        owner: $('#owner').val(),
        valexp: $('#valexp').val(),
        height: 0.0,
        nfz: $('#nfz').val(),
        shape: $('#shape').val(),
        rad: 0,
        latlonalt: [],
        ftype: $('#ftype').val(),
        cType: 'asset',
        create: 'createAsset'
    };
    var lla = [],
        color,
        stage = 0,
        cartesian,
        cartographic,
        cartographictwo;
    (asset.owner == 'HOSTILE')
        ? color = Cesium.Color.RED
        : color = Cesium.Color.BLUE;

    var positionHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    var entity = viewer.entities.add({
        label: {
            show: false
        }
    });
    var newCircle = viewer.entities.add({
        ellipse: {
            show: false,
            material: color.withAlpha(0.25),
            outline: true,
            outlineColor: color
        }
    });
    var newPolygon = viewer.entities.add({
        polygon: {
            show: false,
            material: color.withAlpha(0.25)
        }
    });
    var newOutline = viewer.entities.add({
        polyline: {
            show: false,
            material: color
        }
    });
    positionHandler.setInputAction(function (movement) {
        if (asset.shape == 'Circle' && stage == 0) {
            cartesian = scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
            if (cartesian) {
                cartographic = ellipsoid.cartesianToCartographic(cartesian);
                var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6);
                var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6);

                entity.position = new Cesium.CallbackProperty(function(){
                    return Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic);
                }, false);
                entity.label.show = true;
                entity.label.text = '(' + longitudeString + ', ' + latitudeString + ')';
            } else {
                entity.label.show = true;
                entity.label.text = 'Select Center Position';
            }
        }else if(asset.shape == 'Circle' && stage == 1){
            var cartesiantwo = scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
            if (cartesiantwo) {
                cartographictwo = ellipsoid.cartesianToCartographic(cartesiantwo);
                var hav = haversine(
                    [Cesium.Math.toDegrees(cartographic.latitude), Cesium.Math.toDegrees(cartographic.longitude)],
                    [Cesium.Math.toDegrees(cartographictwo.latitude), Cesium.Math.toDegrees(cartographictwo.longitude)]
                );
                asset.rad = hav.toFixed(6);
                entity.position = new Cesium.CallbackProperty(function(){
                    return Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographictwo);
                }, false);
                entity.label.show = true;
                entity.label.text = 'Radius: ' + asset.rad;
                newCircle.ellipse.show = true;
                newCircle.position = Cesium.Cartesian3.fromDegrees(asset.latlonalt[1], asset.latlonalt[0]);
                newCircle.ellipse.semiMajorAxis = new Cesium.CallbackProperty(function(){
                    return +asset.rad;
                }, false);
                newCircle.ellipse.semiMinorAxis = new Cesium.CallbackProperty(function(){
                    return +asset.rad;
                }, false);
            } else {
                entity.label.show = false;
            }
        }else if(asset.shape == 'Polygon' && stage == 0){
            cartesian = scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
            if (cartesian) {
                cartographic = ellipsoid.cartesianToCartographic(cartesian);
                var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(6);
                var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(6);

                entity.position = new Cesium.CallbackProperty(function(){
                    return Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographic);
                }, false);
                entity.label.show = true;
                entity.label.text = '(' + longitudeString + ', ' + latitudeString + ')';
            } else {
                entity.label.show = true;
                entity.label.text = 'Select Start Position';
            }
        }else if(asset.shape == 'Polygon' && stage == 1){
            cartesiantwo = scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
            if (cartesiantwo) {
                cartographictwo = ellipsoid.cartesianToCartographic(cartesiantwo);

                entity.position = new Cesium.CallbackProperty(function(){
                    return Cesium.Ellipsoid.WGS84.cartographicToCartesian(cartographictwo);
                }, false);
                entity.label.text = '(' + Cesium.Math.toDegrees(cartographictwo.longitude) + ', ' + Cesium.Math.toDegrees(cartographictwo.latitude) + ')';

                var currentPos = [Cesium.Math.toDegrees(cartographictwo.longitude), Cesium.Math.toDegrees(cartographictwo.latitude)];
                newPolygon.polygon.hierarchy = new Cesium.CallbackProperty(function () {
                    var llaConcat = lla;
                    llaConcat = llaConcat.concat(currentPos);
                    return Cesium.Cartesian3.fromDegreesArray(llaConcat);
                }, false);
                newPolygon.polygon.show = true;
                newOutline.polyline.positions = new Cesium.CallbackProperty(function(){
                    var llaConcat = lla;
                    llaConcat = llaConcat.concat(currentPos);
                    return Cesium.Cartesian3.fromDegreesArray(llaConcat);
                }, false);
                newOutline.polyline.show = true;
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    positionHandler.setInputAction(function (click) {
        if (asset.shape == 'Circle' && stage == 0) {
            cartesian = scene.camera.pickEllipsoid(click.position, ellipsoid);
            if (cartesian) {
                cartographic = ellipsoid.cartesianToCartographic(cartesian);
                asset.latlonalt = [
                    Cesium.Math.toDegrees(cartographic.latitude).toFixed(15),
                    Cesium.Math.toDegrees(cartographic.longitude).toFixed(15),
                    Cesium.Math.toDegrees(cartographic.height).toFixed(15)
                ];
                Cesium.sampleTerrain(terrainProvider, 11, [cartographic])
                    .then(function (updatedPositions) {
                        stage = 1;
                        entity.label.show = false;
                        asset.latlonalt[2] = updatedPositions[0].height;
                    });
            }
        }else if (asset.shape == 'Circle' && stage === 1) {
            console.log("Creating Asset");
            loggingMessage("Creating Asset");
            socket.emit('newElement', asset.cType, asset);
            DOM.createAsset('add', asset);
            viewer.entities.remove(entity);
            viewer.entities.remove(newCircle);
            viewer.entities.remove(newPolygon);
            viewer.entities.remove(newOutline);
            positionHandler = positionHandler && positionHandler.destroy();
        }else if (asset.shape == 'Polygon'){
            cartesian = scene.camera.pickEllipsoid(click.position, ellipsoid);
            if (cartesian) {
                var setCartographic = ellipsoid.cartesianToCartographic(cartesian);
                asset.latlonalt.push(
                    Cesium.Math.toDegrees(setCartographic.latitude).toFixed(15),
                    Cesium.Math.toDegrees(setCartographic.longitude).toFixed(15),
                    Cesium.Math.toDegrees(setCartographic.height).toFixed(15)
                );
                lla.push(Cesium.Math.toDegrees(setCartographic.longitude), Cesium.Math.toDegrees(setCartographic.latitude));
                if (lla.length >= 4) {
                    loggingMessage((lla.length / 2) + ' Points Added');
                }
                Cesium.sampleTerrain(terrainProvider, 11, [cartographic])
                    .then(function (updatedPositions) {
                        asset.latlonalt[2] = updatedPositions[0].height;
                        stage = 1;
                    });
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    positionHandler.setInputAction(function (doubleClick){
        if (asset.shape == 'Polygon') {
            var len = asset.latlonalt.length;
            if(len > 9) {
                asset.rad = (len / 3);
                console.log("Creating Asset");
                loggingMessage("Creating Asset");
                socket.emit('newElement', asset.cType, asset);
                DOM.createAsset('add', asset);
                viewer.entities.remove(entity);
                viewer.entities.remove(newCircle);
                viewer.entities.remove(newPolygon);
                viewer.entities.remove(newOutline);
                positionHandler = positionHandler && positionHandler.destroy();
            }else{
                console.log('3+ Positions Required');
                loggingMessage('3+ Positions Required.');
            }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
}

/**
 * PAGE LOAD
 */
function start() {
    //LOAD MIL STD 2525 FONTS
    if (armyc2.c2sd.renderer.utilities.RendererUtilities.fontsLoaded()) {
        console.log("fonts loaded fast");
        fontsLoaded = true;
    }
    else {
        fontCheckTimer = setTimeout(checkFonts, 1000);
    }
    //TABS
    var container = document.getElementById("tabContainer");
    var tabcon = document.getElementById("tabscontent");
    var navitem = document.getElementById("tabHeader_1");
    var ident = navitem.id.split("_")[1];

    navitem.parentNode.setAttribute("data-current", ident);
    navitem.setAttribute("class", "tabActiveHeader");
    var pages = tabcon.getElementsByClassName("tabpage");

    for (i = 1; i < pages.length; i++) {
        pages.item(i).style.display = "none";
    }

    var tabs = container.getElementsByTagName("li");
    for (i = 0; i < tabs.length; i++) {
        tabs[i].onclick = displayPage;
    }

    // on click of one of tabs
    function displayPage() {
        var current = this.parentNode.getAttribute("data-current");
        //remove class of activetabheader and hide old contents
        document.getElementById("tabHeader_" + current).removeAttribute("class");
        document.getElementById("tabpage_" + current).style.display = "none";

        var ident = this.id.split("_")[1];
        //add class of activetabheader to new active tab and show contents
        this.setAttribute("class", "tabActiveHeader");
        document.getElementById("tabpage_" + ident).style.display = "block";
        this.parentNode.setAttribute("data-current", ident);
    }
}

/**
 * FUNCTIONS
 */
var logging = document.getElementById('logging');
function loggingMessage(message) {
    logging.innerHTML = message;
}
var fontCheckTimer = null;
var retries = 15;
var attempts = 0;
var fontsLoaded = false;

function checkFonts()
{
    if(armyc2.c2sd.renderer.utilities.RendererUtilities.fontsLoaded())
    {
        console.log("fonts loaded");
        fontsLoaded = true;
    }
    else if(attempts < retries)
    {
        attempts++;
        fontCheckTimer = setTimeout(checkFonts, 1000);
        console.log("fonts loading...");
        //sometimes font won't register until after a render attempt
        armyc2.c2sd.renderer.MilStdIconRenderer.Render("SHAPWMSA-------",{});
    }
    else
    {
        console.log("fonts didn't load or status couldn't be determined for " + retries + " seconds.");
        //Do actions to handle font failure to load scenario
    }
}

function slideDown(container, distance) {
    var box = document.getElementById(container);
    ( box.style.bottom == distance || box.style.bottom == '' )
        ? box.style.bottom = '1em'
        : box.style.bottom = distance;
}
function slideLeft() {
    var box = document.getElementById('leftHide');
    var text = document.getElementById('lhToggleA');
    if ( box.style.left == '0em' || box.style.left == '0' || box.style.left == '') {
        box.style.left = '-22.75em';
        text.innerHTML = '<span class="glyphicon glyphicon-menu-right" aria-hidden="true"></span>'
    } else {
        box.style.left = '0em';
        text.innerHTML = '<span class="glyphicon glyphicon-menu-left" aria-hidden="true"></span>'
    }
}
function slideRight() {
    var box = document.getElementById('rightHide');
    var text = document.getElementById('rhToggleA');
    if ( box.style.right == '0em' || box.style.right == '' ) {
        box.style.right = '-19.75em';
        text.innerHTML = '<span class="glyphicon glyphicon-menu-left" aria-hidden="true"></span>';
    }else{
        box.style.right = '0em';
        text.innerHTML = '<span class="glyphicon glyphicon-menu-right" aria-hidden="true"></span>';
    }
}
function screenshotDiag(){
    var ovCont = document.getElementById('scOverlay');
    ovCont.innerHTML = '';
    viewer.render();
    var overlay = viewer.canvas.toDataURL('image/png');
    var image = document.createElement('img');
    image.src = overlay;
    ovCont.appendChild(image);
    ovCont.style.display = 'block';
    document.getElementById('save1').style.display = 'block';
    document.getElementById('save2').style.display = 'none';
    document.getElementById('saveImgDialog').style.display = 'block';
}
function screenshot(){
    document.getElementById('saving').style.display = 'block';
    document.getElementById('saveImgDialog').style.display = 'none';
    document.getElementById('save1').style.display = 'none';
    document.getElementById('save2').style.display = 'block';
    html2canvas(document.body, {
        onrendered: function(canvas) {
            document.getElementById('saving').style.display = 'none';
            var img = canvas.toDataURL('image/png');
            console.log(img);
            var a = document.getElementById('screenSave');
            a.href = img;
            a.download = document.getElementById('imgName').value + '.png';
            document.getElementById('saveImgDialog').style.display = 'block';
            document.getElementById('scOverlay').style.display = 'none';
        }
    });
}
