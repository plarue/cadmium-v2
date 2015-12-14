/**
 * Created by Brent on 12/1/2015.
 */

(function(exports){


    function Create(){
        /*
            createModal
            volumeModalInit
            addID
            wsVolume
            wsAsset
            haversine
        */
    }


    Create.prototype.createModal = function(type){
        var self = this;
        (type === 'sensor') ? self.volumeModalInit(type, function(){$('#sensorModal').modal()}) :
            (type === 'weapon')? self.volumeModalInit(type, function(){$('#weaponModal').modal()})
                :$('#assetModal').modal();
    };

    Create.prototype.volumeModalInit = function(type, cb) {
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
            console.log(results);
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
    };

    Create.prototype.addID = function(type, pm){
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
    };

    Create.prototype.wsVolume = function(type) {
        var self = this;
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
        var geoID = Object.keys(self.currentGeometry);
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
                    self.loggingMessage("Creating " + type);
                    self.createVolume('add', element);
                    socket.emit('newElement', type, element);
                });
                viewer.entities.remove(entity);
                viewer.entities.remove(entitytwo);
                viewer.entities.remove(entitythree);
                positionHandler = positionHandler && positionHandler.destroy();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    };

    Create.prototype.wsAsset = function(){
        var self = this;
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
                    var hav = self.haversine(
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
                self.loggingMessage("Creating Asset");
                socket.emit('newElement', asset.cType, asset);
                self.createAsset('add', asset);
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
                        self.loggingMessage((lla.length / 2) + ' Points Added');
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
                    self.loggingMessage("Creating Asset");
                    socket.emit('newElement', asset.cType, asset);
                    self.createAsset('add', asset);
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
    };

    Create.prototype.haversine = function(p1, p2){
        var R = 6371000; // metres
        var L1 = toRad(p1[0]);
        var L2 = toRad(p2[0]);
        var dLat = toRad((p2[0]-p1[0]));
        var dLon = toRad((p2[1]-p1[1]));

        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(L1) * Math.cos(L2) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        function toRad(x) {
            return x * Math.PI / 180;
        }

        return R * c;
    };

    exports.Create = Create
})(this);