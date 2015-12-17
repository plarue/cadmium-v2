/**
 * Created by Brent on 11/19/2015.
 */

(function (exports) {

    function Vapor(){
        /*
            optimize
            stopOptimization
            generateThreats
            evaluateScenario
            clearHeatmap
        */
    }

    Vapor.prototype.optimize = function() {
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

    Vapor.prototype.stopOptimization = function() {
        console.log("Stopping optimization");
        socket.emit('stopOptimization');
    };

    Vapor.prototype.generateThreats = function() {
        if (!$("#generateThreatsItem").hasClass("disabled")) {
            console.log("Generating threats");
            socket.emit('generateThreats');
        }
    };

    Vapor.prototype.evaluateScenario = function() {
        console.log("Evaluating scenario");
        clearHeatmap();
        socket.emit('evaluateScenario');
    };

    Vapor.prototype.clearHeatmap = function() {
        for(var p in heatMap) {
            scene.primitives.remove(heatMap[p]);
        }
        heatMap = [];
    };

    Vapor.prototype.entHandler = function(action){
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
    };
    
    Vapor.prototype.updateEntity = function(data){
        var self = this;
        self[data.create]('remove', data);
        (function(data) {
            socket.emit('updateData', data.id, data.cType, data, function (cb) {
                self[cb.create]('add', cb);
                $('#pickedList').html('');
                self.displayElementData(cb.id, cb.cType, '#pickedList');
            });
        })(data);
    };
    
    Vapor.prototype.moveEntity = function(data){
        var self = this;
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
                    self.createVolume('remove', rem);
                    dt = self.createIcon(icon, 'dragTemp', data.name, data.Lon, data.Lat, 0);
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
                            self.createVolume('add', cb);
                        });
                        handler = handler && handler.destroy();
                    });
                }
            },
            Cesium.ScreenSpaceEventType.LEFT_UP
        );
    };
    
    Vapor.prototype.deleteEntity = function(data){
        var self = this;
        self[data.create]('remove', data);
        socket.emit('removeData', data.cType, data.id);
    };

    Vapor.prototype.wsVaporVolume = function(){
        var self = this;
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

        var geoID = Object.keys(self.currentGeometry);
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
                self.loggingMessage("Creating Sensor");
                self.createIcon('SFGPESR---*****', sensor.id, sensor.name, lla[1], lla[0], lla[2]);
                socket.emit('newElement', data.cType, data);

                viewer.entities.remove(entity);
                viewer.entities.remove(entitytwo);
                viewer.entities.remove(entitythree);
                positionHandler = positionHandler && positionHandler.destroy();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    };

    exports.Vapor = Vapor;
})(this);