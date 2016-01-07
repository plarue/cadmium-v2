/**
 * Created by Brent on 11/19/2015.
 */

(function (exports) {


    function Common(){
        //MENU
            /*
            refreshData
            clearData
            newScenario
            screenShotModal
            launchModal
            saveFile
            handleFileSelect
            loadFile
            getFileType
            openScenario
            loadScenario
            */

        //SLIDE
         /*
            slideDown
            slideLeft
            slideRight
        */

        //SCREENSHOT
        /*
            screenshotDiag
            screenshot
        */

        //USER MESSAGES
        /*
            loggingMessage
        */

        //ENTITY HANDLERS
        /*
            assetCollection
            trackCollection
            selectInputs
            entityListSelect
         */
    }


    /**
     * MENU
     */

    Common.prototype.refreshData = function() {
        var self = this;
        self.clearData(function () {
            console.log('Refreshing data');
            var db = ['sensor', 'weapon', 'track', 'asset', 'truth'];
            for (var i = 0; i < 5; i++) {
                socket.emit('refreshAll', db[i], function (cb) {
                    for (var rA in cb) {
                        self[cb[rA].create]('add', cb[rA]);
                    }
                });
            }
        });
    };

    Common.prototype.clearData = function (callback) {
        console.log('Clearing existing data');
        var self = this;
        var dbType = ['sensor', 'weapon', 'track', 'truth', 'asset'];
        for (var i=0; i < dbType.length; i++){
            socket.emit('findAll', dbType[i], dbType[i], function (cb, pt) {
                if (cb.length > 0) {
                    for (var i = 0; i < cb.length; i++) {
                        self[cb[i].create]('remove', cb[i]);
                    }
                }else{console.log('Database \"' + pt + '\" contained no data')}
                if (pt == 'asset'){
                    if ($('#entityList').length > 0) {
                        self.toggle.entities = [];
                    }
                    if(callback) {
                        callback();
                    }
                }
            });
        }
    };

    Common.prototype.newScenario = function() {
        var self = this;
        self.clearData(function(){
            socket.emit('newF');
        });
    };

    Common.prototype.screenShotModal = function() {
        var ovCont = $('#scOverlay');
        ovCont.html('');
        viewer.render();
        var overlay = viewer.canvas.toDataURL('image/png');
        var image = $('<img>').attr('src', overlay);
        ovCont.appendChild(image);
        ovCont.show();
        $('#save1').show();
        $('#save2').hide();
        $('saveImgDialog').modal();
    };

    Common.prototype.launchModal = function(id) {
        $(id).modal();
    };

     //SAVING
    Common.prototype.saveFile = function() {
        document.getElementById('saveDialog').style.display = 'none';
        var name = document.getElementById('scenarioName').value;
        socket.emit('saveScenario', name, function(cb){
            console.log(cb);
        });
    };

    //IMPORT FILES

    Common.prototype.loadFile = function(){
        var self = this;
        var inp = document.getElementById('files');
        for (var i=0; i < inp.files.length; i++) {
            var file = inp.files[i];
            var r = new FileReader();
            r.i = i;
            r.ftype = self.getFileType(inp.files.item(i).name);
            r.onload = function(e) {
                var text = e.target.result;
                var dataArray = text.split(/\r\n|\n|\r/);
                for (var i=0; i < dataArray.length; i++) {
                    var line = dataArray[i];
                    socket.emit('importFile', this.ftype, line);
                }
            };
            r.readAsText(file);
        }
    };

    Common.prototype.getFileType = function(name){
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
    };

    //SCENARIO LOADING
    Common.prototype.openScenario = function() {
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
    };

    Common.prototype.loadScenario = function(){
        var self = this;
        var e = document.getElementById('scenarios');
        var sel = e.options[e.selectedIndex].value;
        self.clearData(function() {
            console.log('send scenario');
            socket.emit('getScenario', sel, function (msg) {
                $('#generateThreatsItem').removeClass('disabled');
            })
        })
    };

    /**
     * SLIDE
     */
    Common.prototype.slideDown = function(container, distance) {
        var box = document.getElementById(container);
        ( box.style.bottom == distance || box.style.bottom == '' )
            ? box.style.bottom = '1em'
            : box.style.bottom = distance;
    };
    Common.prototype.slideLeft = function() {
        var box = document.getElementById('leftHide');
        var text = document.getElementById('lhToggleA');
        if ( box.style.left == '0em' || box.style.left == '0' || box.style.left == '') {
            box.style.left = '-22.75em';
            text.innerHTML = '<span class="glyphicon glyphicon-menu-right" aria-hidden="true"></span>'
        } else {
            box.style.left = '0em';
            text.innerHTML = '<span class="glyphicon glyphicon-menu-left" aria-hidden="true"></span>'
        }
    };
    Common.prototype.slideRight = function() {
        var box = document.getElementById('rightHide');
        var text = document.getElementById('rhToggleA');
        if ( box.style.right == '0em' || box.style.right == '' ) {
            box.style.right = '-19.75em';
            text.innerHTML = '<span class="glyphicon glyphicon-menu-left" aria-hidden="true"></span>';
        }else{
            box.style.right = '0em';
            text.innerHTML = '<span class="glyphicon glyphicon-menu-right" aria-hidden="true"></span>';
        }
    };

    /**
     * SCREENSHOT
     */
    Common.prototype.screenshotDiag = function(){
        var ovCont = $('#scOverlay');
        ovCont.html('');
        viewer.render();
        var overlay = viewer.canvas.toDataURL('image/png');
        var image = $('<img/>');
        image.attr('src', overlay);
        ovCont.append(image);
        ovCont.show();
        $('#save1').show();
        $('#save2').hide();
        $('#saveImgDialog').show();
    };
    Common.prototype.screenshot = function(){
        $('#saving').show();
        $('#saveImgDialog').hide();
        $('#save1').hide();
        $('#save2').show();
        html2canvas(document.body, {
            onrendered: function(canvas) {
                $('#saving').hide();
                var img = canvas.toDataURL('image/png');
                console.log(img);
                var a = $('#screenSave');
                a.attr('href', img);
                a.attr('download', $('#imgName').val() + '.png');
                $('#saveImgDialog').show();
                $('#scOverlay').hide();
            }
        });
    };

    /**
     * USER MESSAGES
     */

    Common.prototype.loggingMessage = function (message) {
        var logging = $('#logging');
        logging.html(message);
        setTimeout(function(){
            logging.html('');
        }, 5000)
    };

    /**
     * SELECT ENTITY
     */

    Common.prototype.assetCollection = function(e){
        var indId = 'ind' + e.target.id;
        var indicator = document.getElementById(indId);
        if (e.target.value == 0) {
            viewer.dataSources.remove(assetStream);
            indicator.style.backgroundColor = '#ff0000';
        }else{
            viewer.dataSources.add(assetStream);
            indicator.style.backgroundColor = '#adff2f';
        }
    };

    Common.prototype.trackCollection = function(e, id){
        var self = this;
        var value = e;
        var keys = Object.keys(self.currentGeometry);
        var targetKey = [];
        for (var i=0; i < keys.length; i++) {
            var current = keys[i].slice(0,1);
            if (current == 'T'){
                targetKey.push(keys[i]);
            }
        }
        var indId = 'ind' + id;
        var indicator = document.getElementById(indId);
        for (var i=0; i < targetKey.length; i++) {
            var attributes = self.currentGeometry[targetKey[i]].getGeometryInstanceAttributes(targetKey[i]);
            if (value == 0) {
                attributes.show = Cesium.ShowGeometryInstanceAttribute.toValue(false);
                indicator.style.backgroundColor = '#ff0000';
            } else {
                attributes.show = Cesium.ShowGeometryInstanceAttribute.toValue(true);
                indicator.style.backgroundColor = '#adff2f';
            }
        }
    };

    Common.prototype.selectInputs = function(e, id) {
        var self = this;
        var value = e;
        var instances = self.currentGeometry[id]._numberOfInstances;
        var indId = 'ind' + id;
        var indicator = document.getElementById(indId);
        for (var i=0; i < instances; i++) {
            var targetId = ("" + id) + i;
            var attributes = self.currentGeometry[id].getGeometryInstanceAttributes(targetId);
            if (value == 0) {
                attributes.show = Cesium.ShowGeometryInstanceAttribute.toValue(false);
                indicator.style.backgroundColor = '#ff0000';
            } else {
                attributes.show = Cesium.ShowGeometryInstanceAttribute.toValue(true);
                indicator.style.backgroundColor = '#adff2f';
            }
        }
    };

    Common.prototype.entityListSelect = function(e){
        var self = this;
        var type = e.target.value;
        var id = e.target.id;
        $('#selections').html('');
        $('#pickedO').html('');
        $('#noSelect').hide();
        $('#multipleSelect').hide();
        self.displayElementData(id, type, '#pickedO');
    };

    exports.Common = Common;
})(this);