/**
 * Created by Brent on 12/14/2015.
 */
(function(exports){


    function EntitySelector(){
        /*
            entHandler
            updateEntity
            moveEntity
            deleteEntity
         */
    }


    EntitySelector.prototype.entHandler = function(action){
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
    };

    EntitySelector.prototype.updateEntity = function(data){
        DOM[data.create]('remove', data);
        (function(data) {
            socket.emit('updateData', data.id, data.cType, data, function (cb) {
                DOM[cb.create]('add', cb);
                $('#pickedO').html('');
                DOM.displayElementData(cb.id, cb.cType, '#pickedO');
            });
        })(data);
    };

    EntitySelector.prototype.moveEntity = function(data){
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
    };

    EntitySelector.prototype.deleteEntity = function(data){
        $('#pickedO').html('');
        DOM[data.create]('remove', data);
        socket.emit('removeData', data.cType, data.id);
    };

    exports.EntitySelector = EntitySelector;
})(this);