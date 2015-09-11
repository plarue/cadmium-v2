/**
 * Created by Brent on 5/18/2015.
 */
var Acquire = {};
var currentGeometry = {};

Acquire.createAsset = function(){
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
                position: Cesium.Cartesian3.fromDegrees(asset.latlonalt[0], asset.latlonalt[1]),
                name : asset.name,
                ellipse : {
                    semiMinorAxis : asset.rad,
                    semiMajorAxis : asset.rad,
                    material : rgba[0],
                    outline : true,
                    outlineColor : rgba[1]
                }
            });
            var newLabel = viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(asset.latlonalt[0], asset.latlonalt[1]),
                name: asset.name,
                label: {
                    text: asset.name,
                    font : '16px Helvetica'
                }
            });
            currentGeometry[asset.name] = {shape: newEllipse, label: newLabel};
        }else{
            viewer.entities.remove(currentGeometry[asset.name].shape);
            viewer.entities.remove(currentGeometry[asset.name].label);
            delete currentGeometry[asset.name];
        }
    }else{
        if (arguments[0] == 'add'){
            var vertices = [];
            for (var i=0; i < asset.latlonalt.length; i+=3){
                vertices.push(asset.latlonalt[i], asset.latlonalt[i+1]);
            }
            var newPolygon = viewer.entities.add({
                name : asset.name,
                polygon : {
                    hierarchy : Cesium.Cartesian3.fromDegreesArray(vertices),
                    material : rgba[0],
                    outline : true,
                    outlineColor : rgba[1]
                }
            });
            var newLabel = viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(asset.latlonalt[0], asset.latlonalt[1]),
                name: asset.name,
                label: {
                    text: asset.name,
                    font : '16px Helvetica'
                }
            });
            currentGeometry[asset.name] = {shape: newPolygon, label: newLabel};
        }else{
            viewer.entities.remove(currentGeometry[asset.name].shape);
            viewer.entities.remove(currentGeometry[asset.name].label);
            delete currentGeometry[asset.name];
        }
    }
};

Acquire.createTrack = function(){
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
                id: track.name,
                attributes: {
                    show: new Cesium.ShowGeometryInstanceAttribute(true)
                }
            }),
            appearance: new Cesium.PolylineColorAppearance({
                translucent: false
            })
        });
        currentGeometry[track.name] = primitive;
        scene.primitives.add(primitive);

        //ADD VISIBILITY SLIDER
        var list = document.getElementById('entityList');
        var trackSlider = document.getElementById('tracks');
        if (trackSlider == null) {
            var li = Acquire.createSlider('tracks', 'Tracks', 'track', 1);
            list.appendChild(li);
        }
        if (list.innerHTML != '' || list.innerHTML != null){
            document.getElementById('entityTitle').style.display = 'inline';
        }
    }else if (arguments[0] == 'remove'){
        scene.primitives.remove(currentGeometry[track.name]);
        delete currentGeometry[track.name];
    }
};

Acquire.createVolume = function(){
    var volume = arguments[2];
    //ADD SENSOR VOLUME
    if (arguments[0] == 'add') {
        var faces = volume.nFaces;
        var angle = 0;
        var sweep = volume.boresight_Half_Ang_Az * faces;
        var instances = [];
        var instanceId = 0;
        var volType = [];
        var volumeColor;
        if (arguments[1] == 'sensor') {
            volType = ['sensorList', 'sensorTitle', "SFGPESR---*****"];
            volumeColor = Cesium.Color.YELLOW;
        }else if (arguments[1] == 'weapon') {
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
                Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(volume.latlonalt[0], volume.latlonalt[1])),
                new Cesium.Cartesian3(0.0, 0.0, (volume.latlonalt[2] + volume.boresightEl)),
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
                id: volume.name + instanceId,

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
        currentGeometry[volume.name] = newPrimitive;
        scene.primitives.add(newPrimitive);

        //ADD VISIBILITY SLIDER
        var list = $("#" + volType[0]);
        var li = Acquire.createSlider(volume.name, volume.id, 'volume', 0);
        list.append(li);
        if (list.innerHTML != '' || list.innerHTML != null) {
            $("#" + volType[1]).show();
        }

        //ADD ICON
        Acquire.createIcon(volType[2], volume.name, volume.id, +volume.latlonalt[0], +volume.latlonalt[1], +volume.latlonalt[2]);

    }else if(arguments[0] == 'remove'){
        //REMOVE SENSOR VOLUME
        scene.primitives.remove(currentGeometry[volume.name]);
        delete currentGeometry[volume.name];

        //REMOVE VISIBILITY SLIDER
        var item = document.getElementById(volume.name);
        if (item != null) {
            var slide = item.parentNode;
            slide.parentNode.removeChild(slide);
        }

        //REMOVE ICON
        viewer.entities.removeById(volume.name);
    }
};

Acquire.createIcon = function(icon, id, name, lon, lat, alt){
    var modifiers = {};
    modifiers[msa.SymbologyStandard] = RendererSettings.Symbology_2525C;

    var ii = armyc2.c2sd.renderer.MilStdIconRenderer.Render(icon, modifiers);

    viewer.entities.add({
        id: id,
        position: Cesium.Cartesian3.fromDegrees(lon, lat, alt),
        billboard: {
            image: ii.getImage()
        },
        label : {
            text : name,
            font : '14pt monospace',
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            outlineWidth : 2,
            verticalOrigin : Cesium.VerticalOrigin.TOP,
            pixelOffset : new Cesium.Cartesian2(0, 32)
        }
    });
};

//DOM CREATION

Acquire.createSlider = function(id, name, type, ov){
    var light, f;
    var indId = 'ind' + id;
    if (ov === 0){
        light = '#ff0000';
    }else{
        light = '#adff2f';
    }
    if (type == 'asset'){
        f = assetCollection;
    }else if(type == 'track'){
        f = trackCollection;
    }else{
        f = selectInputs;
    }
    var li = $('<li></li>')
        .append($('<label></label>')
            .attr({
                for: id
            })
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

Acquire.listItem = function(name){
    var li = document.createElement('li');
    var ckBox = document.createElement('INPUT');
    var label = document.createElement('label');
    label.setAttribute('for', name);
    label.innerHTML = name;
    ckBox.setAttribute('type', 'checkbox');
    ckBox.setAttribute('id', name);
    ckBox.checked = true;
    li.appendChild(ckBox);
    li.appendChild(label);
    return li;
};

Acquire.createInput = function(name, value){
    var label = document.createElement('label');
    label.setAttribute('for', name);
    label.innerHTML = name;
    var textBox = document.createElement('input');
    textBox.setAttribute('type', 'text');
    textBox.setAttribute('id', name);
    textBox.setAttribute('value', value);
    var li = document.createElement('li');
    li.appendChild(label);
    li.appendChild(textBox);
    return li;
};

function pretify(name) {
  name = name.split(/(?=[A-Z])/).join(' ');
  name = name.replace(/_/g, ' ');
  name = name.charAt(0).toUpperCase() + name.slice(1);
  return name;
}

Acquire.constructParameterDisplay = function(result) {
    var ul = document.createElement('ul');

    for (var key in result) {
        if (key == '_id' || key == '__v' || key == 'id') {
            continue;
        }

        var value = result[key];

        if(typeof value === 'string' || typeof value === 'number') {
            var label = document.createElement('label');
            label.setAttribute('for', key);
            label.innerHTML = pretify(key);

            var textBox = document.createElement('input');
            textBox.setAttribute('type', 'text');
            textBox.setAttribute('class', 'form-control')
            textBox.setAttribute('id', key);
            textBox.setAttribute('value', value);
            var li = document.createElement('li');
            li.appendChild(label);
            ul.appendChild(li);
            var li = document.createElement('li');
            li.appendChild(textBox);
            ul.appendChild(li);

        } else if(Array.isArray(value)) {
            var label = document.createElement('label');
            label.setAttribute('for', key);
            label.innerHTML = pretify(key);
            var li = document.createElement('li');
            li.appendChild(label);
            ul.appendChild(li);

            var oa = result[key];
            for (i = 0; i < value.length; i += 1) {
                var textBox = document.createElement('input');
                textBox.setAttribute('type', 'text');
                textBox.setAttribute('class', 'form-control')
                textBox.setAttribute('id', key);
                textBox.setAttribute('value', value[i]);
                var li = document.createElement('li');
                li.setAttribute('class', 'triplet');
                li.appendChild(textBox);
                ul.appendChild(li);
            }
        }
    }

    return ul;
};

Acquire.createROInput = function(name, value){
    var label = document.createElement('label');
    label.setAttribute('for', name);
    label.innerHTML = name;
    var textBox = document.createElement('input');
    textBox.setAttribute('type', 'text');
    textBox.setAttribute('id', name);
    textBox.setAttribute('value', value);
    textBox.style.width = '6em';
    textBox.style.color = '#000';
    textBox.readOnly = true;
    var li = document.createElement('li');
    li.appendChild(label);
    li.appendChild(textBox);
    return li;
};

Acquire.createTriInput = function(name, values){
    var label = document.createElement('p');
    label.style.fontWeight = 'bold';
    label.innerHTML = name;
    var li = document.createElement('li');
    li.appendChild(label);
    var array = [values[0], values[1], values[2]];
    for (var k=0;k<3;k++) {
        var label2 = document.createElement('label');
        label2.setAttribute('for', name + k);
        label2.setAttribute('class', 'noShow');
        label2.innerHTML = name;
        li.appendChild(label2);
        var textBox = document.createElement('input');
        textBox.setAttribute('type', 'text');
        textBox.setAttribute('id', name + k);
        textBox.setAttribute('value', array[k]);
        textBox.style.color = '#000';
        li.appendChild(textBox);
    }
    return li;
};

Acquire.createTriROInput = function(name, value, valuetwo, valuethree){
    var label = document.createElement('label');
    label.setAttribute('for', name);
    label.innerHTML = name;
    var li = document.createElement('li');
    li.appendChild(label);
    var array = [value, valuetwo, valuethree];
    for (var j=0;j<3;j++) {
        var textBox = document.createElement('input');
        textBox.setAttribute('type', 'text');
        textBox.setAttribute('id', name);
        textBox.setAttribute('value', array[j]);
        textBox.style.width = '10em';
        textBox.style.color = '#000';
        textBox.readOnly = true;
        li.appendChild(textBox);
    }
    return li;
};

Acquire.createArrayInput = function(name, ar){
    var label = document.createElement('p');
    label.style.fontWeight = 'bold';
    label.innerHTML = name;
    var li = document.createElement('li');
    li.appendChild(label);
    for (var j=0;j<ar.length;j++) {
        var label2 = document.createElement('label');
        label2.setAttribute('for', name + j);
        label2.setAttribute('class', 'noShow');
        label2.innerHTML = name;
        li.appendChild(label2);
        var textBox = document.createElement('input');
        textBox.setAttribute('type', 'text');
        textBox.setAttribute('id', name + j);
        textBox.setAttribute('value', ar[j]);
        textBox.style.color = '#000';
        li.appendChild(textBox);
    }
    return li;
};

Acquire.createSelection = function(name, type){
    var button = document.createElement('button');
    button.setAttribute('class', 'btn btn-default')
    button.setAttribute('type', 'button');
    button.setAttribute('id', name);
    button.setAttribute('value', type);
    button.innerHTML = name;
    button.addEventListener('click', entityListSelect, false);
    var li = document.createElement('li');
    li.appendChild(button);
    return li;
};

Acquire.removeDuplicates = function(a) {
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
