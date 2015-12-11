/**
 * Created by Brent on 12/11/2015.
 */

(function (exports) {


    function Listeners() {
        //INIT ALL LISTENERS FOR DEPENDENCIES
    }


    Listeners.prototype.listeners = {
        Common: function (self) {
            var pickHandler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
            pickHandler.setInputAction(function (click) {
                var pickedObjects = scene.drillPick(click.position);
                if (Cesium.defined(pickedObjects)) {
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
                        for (var i = 0; i < pickedObjects.length; i++) {
                            var elementType = self.elType(pickedObjects[i].id);
                            elements.push(elementType[0] + ' ' + elementType[1] + ' ' + elementType[2]);
                        }
                        var selections = self.removeDuplicates(elements);
                        var goodInputs = [];
                        for (var i = 0; i < selections.length; i++) {
                            var element = selections[i].match(/[^ ]+/g);
                            if (element[0] != 'track' || element[0] != 'err') {
                                goodInputs.push(element);
                            }
                        }
                        if (goodInputs.length == 1) {
                            multipleSelect.hide();
                            self.displayElementData(goodInputs[0][1], goodInputs[0][0], '#pickedO');
                        } else if (goodInputs.length > 1) {
                            for (i = 0; i < goodInputs.length; i++) {
                                var element = goodInputs[i];
                                var li = self.createSelection(element[1], element[2], element[0]);
                                ul.append(li);
                            }
                        } else {
                            noSelect.show();
                            multipleSelect.hide();
                        }
                    } else if (pickedObjects.length == 1) {
                        noSelect.hide();
                        var elementType = self.elType(pickedObjects[0].id);
                        var elementID = elementType[1];
                        if (elementType[0] != 'err' && elementType[0] != 'track') {
                            self.displayElementData(elementID, elementType[0], '#pickedO');
                        } else if (elementType[0] == 'track') {
                            noSelect.show();
                            multipleSelect.hide();
                        } else {
                            console.log('Unknown ElementType in selected Element.');
                            self.loggingMessage('Unknown ElementType in selected Element.');
                        }
                    }
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            function setupLayers() {
                addAdditionalLayerOption(
                    'Clouds',
                    new Cesium.OpenStreetMapImageryProvider({
                        url: 'http://a.tile.openweathermap.org/map/clouds',
                        fileExtension: 'png',
                        tileMatrixSetID: 'a',
                        proxy: new Cesium.DefaultProxy('/proxy/')
                    })
                );
            }
            function addAdditionalLayerOption(name, imageryProvider) {
                var layer = imageryLayers.addImageryProvider(imageryProvider);
                layer.alpha = 1.0;
                layer.show = false;
                layer.name = name;
                self.imageryModel[name] = layer;
            }
            setupLayers();

            self.initialized.Common = true;
        },
        Cs: function(self){
            socket.on('loadElement', function (dbData) {
                if (dbData) {
                    self[dbData.create]('add', dbData);
                }
            });
            socket.on('updateElement', function (dbData) {
                if (dbData) {
                    self[dbData.create]('remove', dbData);
                    self[dbData.create]('add', dbData);
                }
            });

            self.initialized.Cs = true;
        }
    };

    exports.Listeners = Listeners;
})(this);

