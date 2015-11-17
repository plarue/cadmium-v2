/**
 * Created by Brent Shanahan on 5/18/2015.
 */
var DOM = {};
var currentGeometry = {};

DOM.createAsset = function(){
    var rgba = [];
    var asset = arguments[1];
    if (asset.owner.toUpperCase() == 'HOSTILE') {
        rgba.push(Cesium.Color.RED.withAlpha(0.25), Cesium.Color.RED);
    } else {
        rgba.push(Cesium.Color.BLUE.withAlpha(0.25), Cesium.Color.BLUE);
    }
    if (asset.shape == 'Circle'){
        if (arguments[0] == 'add'){
            var newEllipse = viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(asset.latlonalt[1], asset.latlonalt[0]),
                name : asset.id,
                ellipse : {
                    semiMinorAxis : asset.rad,
                    semiMajorAxis : asset.rad,
                    material : rgba[0],
                    outline : true,
                    outlineColor : rgba[1]
                }
            });
            var newLabel = viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(asset.latlonalt[1], asset.latlonalt[0], 3000),
                name: asset.id,
                label: {
                    text: asset.name,
                    font : '16px Helvetica'
                }
            });
            currentGeometry[asset.id] = {shape: newEllipse, label: newLabel};
        }else{
            if (currentGeometry[asset.id]) {
                viewer.entities.remove(currentGeometry[asset.id].shape);
                viewer.entities.remove(currentGeometry[asset.id].label);
                delete currentGeometry[asset.id];
            }
        }
    }else{
        if (arguments[0] == 'add'){
            var vertices = [];
            for (var i=0; i < asset.latlonalt.length; i+=3){
                vertices.push(asset.latlonalt[i+1], asset.latlonalt[i]);
            }
            var newPolygon = viewer.entities.add({
                name : asset.id,
                polygon : {
                    hierarchy : Cesium.Cartesian3.fromDegreesArray(vertices),
                    material : rgba[0],
                    outline : true,
                    outlineColor : rgba[1]
                }
            });
            var newLabel = viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(asset.latlonalt[1], asset.latlonalt[0], 3000),
                name: asset.id,
                label: {
                    text: asset.name,
                    font : '16px Helvetica'
                }
            });
            currentGeometry[asset.id] = {shape: newPolygon, label: newLabel};
        }else{
            if (currentGeometry[asset.id]) {
                viewer.entities.remove(currentGeometry[asset.id].shape);
                viewer.entities.remove(currentGeometry[asset.id].label);
                delete currentGeometry[asset.id];
            }
        }
    }
};

DOM.createTrack = function(){
    var track = arguments[1];
    if (arguments[0] == 'add') {
        var primitive = new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: new Cesium.PolylineGeometry({
                    positions: track.positions,
                    width: 2.0,
                    followSurface: false,
                    colors: track.colors,
                    colorsPerVertex: false,
                    vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT
                }),
                id: track.id,
                attributes: {
                    show: new Cesium.ShowGeometryInstanceAttribute(true)
                }
            }),
            appearance: new Cesium.PolylineColorAppearance({
                translucent: false
            })
        });
        currentGeometry[track.id] = primitive;
        scene.primitives.add(primitive);

        //ADD VISIBILITY SLIDER
        var list = $('#entityList');
        var trackSlider = document.getElementById('tracks');
        if (trackSlider == null) {
            var li = DOM.createSlider('tracks', 'Tracks', 'track', 1);
            list.append(li);
        }
        if (list.innerHTML != '' || list.innerHTML != null){
            $('#entityTitle').show();
        }
    }else if (arguments[0] == 'remove'){
        scene.primitives.remove(currentGeometry[track.id]);
        delete currentGeometry[track.id];
    }
};

DOM.createTruth = function(){
    var truth = arguments[1];
    if (arguments[0] == 'add') {
        var polyline = viewer.entities.add({
            name : "" + truth.name,
            id: truth.id,
            polyline : {
                positions: truth.positions,
                width: 2,
                material: Cesium.Color.fromBytes(truth.color.red, truth.color.green, truth.color.blue, truth.color.alpha)
            }
        });
        currentGeometry[truth.id] = polyline;

                //ADD VISIBILITY SLIDER
        var list = $('#entityList');
        var trackSlider = document.getElementById('tracks');
        if (trackSlider == null) {
            var li = DOM.createSlider('tracks', 'Tracks', 'track', 1);
            list.append(li);
        }
        if (list.innerHTML != '' || list.innerHTML != null){
            $('#entityTitle').show();
        }
    }else if (arguments[0] == 'remove'){
        if (currentGeometry[truth.id]) {
            viewer.entities.remove(currentGeometry[truth.id]);
            delete currentGeometry[truth.id];
        }
    }else if (arguments[0] == 'update'){
        if (currentGeometry[truth.id]) {
            var entity = viewer.entities.getById(truth.id);
            entity.polyline.positions = truth.positions;
        }
    }
};

DOM.createVolume = function(){
    var volume = arguments[1];
    //ADD SENSOR VOLUME
    if (arguments[0] == 'add') {
        var faces = volume.nFaces;
        var angle = 0;
        var sweep = volume.boresight_Half_Ang_Az * faces;
        var instances = [];
        var instanceId = 0;
        var volType = [];
        var volumeColor;
        if (volume.cType == 'sensor') {
            volType = ['sensorList', 'sensorTitle', "SFGPESR---*****"];
            volumeColor = Cesium.Color.YELLOW;
        }else if (volume.cType == 'weapon') {
            volType = ['weaponList', 'weaponTitle', "SFGPEWM---*****"];
            volumeColor = Cesium.Color.BLUE;
        }
        for (var j=0; j < faces; j++) {
            var degree = volume.boresight_Half_Ang_El;
            var nAngle = (degree + angle) - (sweep / 2);
            if (nAngle > 360){nAngle = 360 - nAngle;}

            var rotationMatrix = Cesium.Matrix4.fromRotationTranslation(
                new Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(-nAngle)),
                new Cesium.Cartesian3(0.0, 0.0, 0.0),
                new Cesium.Matrix4()
            );
            var transformMatrix = Cesium.Matrix4.multiplyByTranslation(
                Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(volume.Lon, volume.Lat)),
                new Cesium.Cartesian3(0.0, 0.0, (volume.Alt + volume.boresightEl)),
                new Cesium.Matrix4()
            );
            var modelMatrix = Cesium.Matrix4.multiply(
                transformMatrix,
                rotationMatrix,
                new Cesium.Matrix4()
            );
            var instance = new Cesium.GeometryInstance({
                geometry: new Cesium.HemisphereOutlineGeometry({
                    radius: volume.max_Range,
                    minRange: volume.minRng,
                    minEl: volume.minEl,
                    maxEl: volume.maxEl,
                    angleAz: volume.boresight_Half_Ang_Az,
                    stackPartitions: 10,
                    slicePartitions: 10
                }),
                modelMatrix: modelMatrix,
                id: volume.id + instanceId,

                attributes: {
                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(volumeColor),
                    show: new Cesium.ShowGeometryInstanceAttribute(false)
                }
            });
            instances.push(instance);
            angle += volume.boresight_Half_Ang_Az;
            instanceId += 1;
        }
        var newPrimitive = new Cesium.Primitive({
            geometryInstances: instances,
            appearance: new Cesium.PerInstanceColorAppearance({
                flat: true
            })
        });
        currentGeometry[volume.id] = newPrimitive;
        scene.primitives.add(newPrimitive);

        //ADD VISIBILITY SLIDER
        var list = $("#" + volType[0]);
        var li = DOM.createSlider(volume.id, volume.name, 'volume', 0);
        list.append(li);
        if (list.innerHTML != '' || list.innerHTML != null) {
            $("#" + volType[1]).show();
        }

        //ADD ICON
        DOM.createIcon(volType[2], volume.id, volume.name, +volume.Lon, +volume.Lat, +volume.Alt);

    }else if(arguments[0] == 'remove'){
        //REMOVE SENSOR VOLUME
        scene.primitives.remove(currentGeometry[volume.id]);
        delete currentGeometry[volume.id];

        //REMOVE VISIBILITY SLIDER
        var item = document.getElementById(volume.id);
        if (item != null) {
            var slide = item.parentNode;
            slide.parentNode.removeChild(slide);
        }

        //REMOVE ICON
        viewer.entities.removeById(volume.id);
    }
};

DOM.createIcon = function(icon, id, name, lon, lat, alt){
    var modifiers = {};
    modifiers[msa.SymbologyStandard] = RendererSettings.Symbology_2525C;

    var ii = armyc2.c2sd.renderer.MilStdIconRenderer.Render(icon, modifiers);

    var icon = viewer.entities.add({
        id: id,
        name: id,
        position: Cesium.Cartesian3.fromDegrees(lon, lat, alt),
        billboard: {
            image: ii.getImage()
        },
        label : {
            text : name,
            font : '16px Helvetica',
            verticalOrigin : Cesium.VerticalOrigin.TOP,
            pixelOffset : new Cesium.Cartesian2(0, 32)
        }
    });
    return icon;
};

//DOM CREATION

DOM.createSlider = function(id, name, type, ov){
    var light, f;
    var indId = 'ind' + id;
    (ov === 0) ? light = '#ff0000' : light = '#adff2f';
    if (type == 'asset'){
        f = assetCollection;
    }else if(type == 'track'){
        f = trackCollection;
    }else{
        f = selectInputs;
    }
    var li = $('<li></li>')
        .append($('<label></label>')
            .attr('for', id)
            .html(name)
        )
        .append($('<div></div>')
            .attr({
                class: 'indicator',
                id: indId
            })
            .css('background-color', light)
        )
        .append($('<input></input>')
            .attr({
                type: 'range',
                id: id,
                value: ov,
                min: 0,
                max: 1,
                step: 1
            })
            .on('change',f)
    );
    return li;
};

DOM.listItem = function(name){
    var li = $('<li></li>')
        .append($('<input></input>')
            .attr({
                type: 'checkbox',
                id: name
            })
            .prop('checked', true)
        )
        .append($('<label></label>')
            .attr('for', name)
            .html(name)
    );
    return li;
};

DOM.createInput = function(name, value, ro){
    var li = $('<li></li>');
    var label = $('<label></label>')
            .attr('for', name)
            .html(name);
    var input = $('<input></input>')
            .attr({
                type: 'text',
                id: name,
                value: value
            });
    li.append(label);
    li.append(input);
    if (ro) {
        input.prop('readonly', true);
        li.hide();
    }
    return li;
};

DOM.createArrayInput = function(name, values, iteration){
    var li = $('<li></li>')
        .append($('<p></p>')
            .html(name)
            .css('fontWeight', 'bold')
    );

    for (var k=0;k < values.length;k++) {
        li.append($('<label></label>')
            .attr({
                for: name + k,
                class: 'noShow'
            })
            .html(name)
        ).append($('<input></input>')
            .attr({
                type: 'text',
                id: name + k,
                value: values[k]
            })
            .css('color', '#fff')
        );
    }
    return li;
};

DOM.createSelection = function(id, name, type){
    var li = $('<li></li>')
        .append($('<button></button>')
            .attr({
                class: 'btn btn-default',
                type: 'button',
                id: id,
                value: type
            })
            .html(name)
            .click(entityListSelect)
    );
    return li;
};

DOM.displayElementData = function(elementID, elementType, form) {
    socket.emit('searchID', form, elementType, elementID, function(result, pt) {
        var form = $(pt);
        var ul = $('<ul></ul>');
        var ov = result;
        var eData;
        for (var key in ov) {
            if (key == '_id' || key == '__v') { continue; }
            if (key == 'Index' || key == 'id' || key == 'cType' || key == 'create' || key == 'latlonalt'){
                eData = DOM.createInput(key, ov[key], true);
                ul.append(eData);
                continue;
            }
            if(typeof ov[key] === 'string' || typeof ov[key] === 'number') {
                eData = DOM.createInput(key, ov[key]);
                ul.append(eData);
            } else if(Array.isArray(ov[key])) {
                var oa = ov[key];
                if (oa.length > 0) {
                    if (elementType == 'asset') {
                        for (var i = 0, j = 1; i < oa.length; i += 3, j++) {
                            eData = DOM.createArrayInput((key + j), [oa[i], oa[i + 1], oa[i + 2]]);
                            ul.append(eData);
                        }
                    } else {
                        eData = DOM.createArrayInput(key, oa);
                        ul.append(eData);
                    }
                }
            }
        }
        form.append(ul);
        if (ov.cType === 'asset') {
            $('#entityControls').show();
            $('#move').hide();
        }else{
            $('#entityControls').show();
            $('#move').show();
        }
    });

};

//FUNCTIONS

DOM.elType = function(pickedObject) {
    var objId = pickedObject;
    var po, poID, poName;
    if (typeof objId !== 'string') {
        po = pickedObject._name.slice(0,1);
        poID = pickedObject._name;
        poName = pickedObject._name.slice(1);
        if (po == 'A') {
            return ['asset', poID, poName];
        } else if (po == 'S') {
            return ['sensor', poID, poName];
        } else if (po == 'W'){
            return ['weapon', poID, poName];
        }else{
            return ['err'];
        }
    }else{
        po = objId.slice(0, 1);
        poName = objId.slice(1);
        if (po == 'S') {
            return ['sensor', objId, poName];
        } else if (po == 'W') {
            return ['weapon', objId, poName];
        } else if (po == 'T') {
            return ['track', objId, poName];
        } else {
            return ['err'];
        }
    }
};

DOM.removeDuplicates = function(a) {
    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    for(var i = 0; i < len; i++) {
        var item = a[i];
        if(seen[item] !== 1) {
            seen[item] = 1;
            out[j++] = item;
        }
    }
    return out;
};

function pretify(name) {
    name = name.split(/(?=[A-Z])/).join(' ');
    name = name.replace(/_/g, ' ');
    name = name.charAt(0).toUpperCase() + name.slice(1);
    return name;
}
