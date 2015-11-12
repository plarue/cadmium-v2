/**
 * Created by Brent on 11/12/2015.
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
 * VAPOR INCOMING/OUTGOING
 */
socket.on('vapor', function(msg){
    if(!currentGeometry[msg.id]) {
        DOM.createTruth('add', msg);
    }else{
        DOM.createTruth('update', msg);
    }
});
var dt = dynamicTable.config('gTPriority',
    ['num', 'id', 'val'],
    ['Priority', 'Track ID', 'Priority Value'],
    'There are no items to list...');
var prioritization = [];
(function(p){
    socket.on('priority', function(msg){
        if (!p.hasOwnProperty(msg.truthID)){
            p[msg.truthID] = msg;
        }else{
            p[msg.truthID].priority = msg.priority;
        }
        var ordered = [];
        for (var key in p){
            ordered.push({num: 0, id: p[key].truthID, val: p[key].priority});
        }
        ordered.sort(function(a, b){
            return b.val - a.val;
        });
        for (var i=0; i < ordered.length; i++){
            ordered[i].num = i + 1;
        }
        dt.load(ordered);
    });
})(prioritization);

function loadTable(tableId, fields, data) {
    //$('#' + tableId).empty(); //not really necessary
    var rows = '';
    $.each(data, function(index, item) {
        var row = '<tr>';
        $.each(fields, function(index, field) {
            row += '<td>' + item[field+''] + '</td>';
        });
        rows += row + '<tr>';
    });
    $('#' + tableId + ' tbody').html(rows);
}

function vaporReturn(){
    var priorityList = $('.priorityList').map(function(){
        return $(this).value()
    }).get();
    socket.emit('vaporPriority', priorityList);
}

function startVapor(){
    socket.emit('startVapor');
    loggingMessage('Starting Vapor');
}

function stopVapor(){
    socket.emit('stopVapor');
    loggingMessage('Stopping Vapor');
}

function vaporMetrics(){
    $('#vaporMetricsModal').modal();
}

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
    $('#pickedList').html('');
    $('#noSelect').hide();
    $('#multipleSelect').hide();
    DOM.displayElementData(id, type, '#pickedList');
}
var pickHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
pickHandler.setInputAction(function(click) {
    var pickedObjects = scene.drillPick(click.position);
    if (Cesium.defined(pickedObjects)){
        var ul = $('#selections');
        var uldata = $('#pickedList');
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
                if (element[0] != 'track' && element[0] != 'err'){
                    goodInputs.push(element);
                }
            }
            if (goodInputs.length == 1){
                multipleSelect.hide();
                DOM.displayElementData(goodInputs[0][1], goodInputs[0][0], '#pickedList');
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
                DOM.displayElementData(elementID, elementType[0], '#pickedList');
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

//CLEAR DATA
function clearData(callback) {
    console.log('Clearing existing data');
    loggingMessage('Clearing existing data');
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
        loggingMessage('Refreshing data');
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
        loggingMessage(cb);
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
    if (nm.indexOf('radar') > -1 || nm.indexOf('sensor') > -1){
        return 'loadSensor';
    }else if(nm.indexOf('threat') > -1){
        if (nm.indexOf('area') > -1){
            return 'loadAsset';
        }
    }else if(nm.indexOf('region') > -1 || nm.indexOf('area') > -1 || nm.indexOf('asset') > -1){
        return 'loadAsset';
    }else{
        console.log('File type unidentifiable');
        loggingMessage('File type unidentifiable')
    }
}
/**
 * ENTITY HANDLING
 */
function entHandler(action){
    var data = {};
    $('#pickedList :input').each(function(){
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
            $('#pickedList').html('');
            DOM.displayElementData(cb.id, cb.cType, '#pickedList');
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
                    });
                    handler = handler && handler.destroy();
                });
            }
        },
        Cesium.ScreenSpaceEventType.LEFT_UP
    );
}
function deleteEntity(data){
    DOM[data.create]('remove', data);
    socket.emit('removeData', data.cType, data.id);
}
/**
 * ENTITY CREATION
 */
function createModal(type){
    (type == 'sensor')
        ? sensorModalInit(function(){
        $('#sensorModal').modal()
    })
        : $('#assetModal').modal();
}
function sensorModalInit(cb) {
    $('#sensorType').on('change', function () {
        var val = this.value;
        if (val == 'a') {
            $('#sensorTypeContent').html(
                [
                    '<label for="posU">Position Uncertainty</label>',
                    '<input type="text" class="form-control spaced-bottom" id="posU" required/>',
                    '<label for="velU">Velocity Uncertainty:</label>',
                    '<input type="text" class="form-control spaced-bottom" id="velU" required/>'
                ].join('')
            )
        } else if (val == 'b') {
            $('#sensorTypeContent').html(
                [
                    '<label for="azimuth">Azimuth Uncertainty:</label>',
                    '<input type="text" class="form-control spaced-bottom" id="azimuth" required/>',
                    '<label for="elevation">Elevation Uncertainty:</label>',
                    '<input type="text" class="form-control spaced-bottom" id="elevation" required/>'
                ].join('')
            )
        } else if (val == 'c') {
            $('#sensorTypeContent').html(
                [
                    '<label for="range">Range Uncertainty:</label>',
                    '<input type="text" class="form-control spaced-bottom" id="range" required/>'
                ].join('')
            )
        }
    });
    if(cb){
        cb()
    }
}
function wsSubmit(type) {
    var id = $('#sensorID').val(),
        sensor = {
            id: 'S' + id,
            name: id,
            posU: 0,
            velU: 0,
            azimuth: 0,
            elevation: 0,
            range: 0
        };
    if (sensor.type == 'a'){
        sensor.posU = $('#posU').val();
        sensor.velU = $('#velU').val();
    }else if( sensor.type == 'b'){
        sensor.azimuth = $('#azimuth').val();
        sensor.elevation = $('#elevation').val();
    }else if( sensor.type == 'c'){
        sensor.range = $('#range').val();
    }

    var geoID = Object.keys(currentGeometry);
    for (var i = 0; i < geoID.length; i++) {
        if ((sensor.id) == geoID[i]) {
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
                entity.label.text = '(' + longitudeString + ', ' + latitudeString + ')';
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
                entity.label.text = '(Rotation: ' + degree + ')';
                entitytwo.polyline.positions = new Cesium.CallbackProperty(function(){
                    return [cartesian, cartesiantwo];
                }, false);
                entitytwo.polyline.show = true;
                entitythree.polyline.positions = Cesium.Cartesian3.fromDegreesArray([lla[1], lla[0], lla[1], 90]);
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
                lla = [
                    Cesium.Math.toDegrees(cartographic.latitude),
                    Cesium.Math.toDegrees(cartographic.longitude),
                    Cesium.Math.toDegrees(cartographic.height)
                ];
                Cesium.sampleTerrain(terrainProvider, 11, [cartographic])
                    .then(function (updatedPositions) {
                        stage = 1;
                        entity.label.show = false;
                        lla[2] = updatedPositions[0].height;
                    });
                //stage = 1;
                //entity.label.show = false;
            }
        }else if (stage === 1) {
            var data = {
                Index: 0,
                id: sensor.id,
                name: sensor.name,
                Identifier: sensor.name,
                Type: 0,
                Lat: lla[0],
                Lon: lla[1],
                Alt: lla[2],
                latlonalt: lla,
                BoresightAz: +degree,
                positionUncert: sensor.posU,
                velocityUncert: sensor.velU,
                azimuthUncert: sensor.azimuth,
                elevationUncert: sensor.elevation,
                rangeUncert: sensor.range,
                cType: 'sensor',
                create: 'createVolume'
            };
            console.log("Creating sensor");
            loggingMessage("Creating Sensor");
            DOM.createIcon('SFGPESR---*****', sensor.id, sensor.name, lla[1], lla[0], lla[2]);
            socket.emit('newElement', data.cType, data);

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
var logging = $('#logging');
function loggingMessage(message) {
    logging.html(message);
    setTimeout(function(){
        logging.html('');
    }, 5000)
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
            var a = document.getElementById('screenSave');
            a.href = img;
            a.download = document.getElementById('imgName').value + '.png';
            document.getElementById('saveImgDialog').style.display = 'block';
            document.getElementById('scOverlay').style.display = 'none';
        }
    });
}
