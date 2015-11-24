/**
 * Created by Brent on 11/19/2015.
 */

(function (exports) {

    function Common(){
        //MENU
        //openScenario
        //loadScenario
        //refreshData
        //screenShotModal
        //launchModal

        //SLIDE
        //slideDown
        //slideLeft
        //slideRight

        //SCREENSHOT
        //screenshotDiag
        //screenshot
    }

    /**
     * MENU
     */
    Common.prototype.openScenario = function(){
        console.log('clicked');
        socket.emit('openFile', function (dirs) {
            if (dirs.length > 0) {
                var scene = $('#scenarios').html('');
                for (var i = 0; i < dirs.length; i++) {
                    var opt = $('<option></option>')
                        .attr({
                            value: dirs[i],
                            required: true
                        })
                        .html(dirs[i]);
                    scene.attr('size', i + 1).append(opt);
                }
            }
            $('#openModal').modal();
        })
    };

    Common.prototype.loadScenario = function(){
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
    };

    Common.prototype.refreshData = function() {
        clearData(function () {
            console.log('Refreshing data');
            var db = ['sensor', 'weapon', 'track', 'asset', 'truth'];
            for (var i = 0; i < 5; i++) {
                socket.emit('refreshAll', db[i], function (cb) {
                    for (var rA in cb) {
                        DOM[cb[rA].create]('add', cb[rA]);
                    }
                });
            }
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

    exports.Common = Common;
})(this);