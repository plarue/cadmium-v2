/**
 * Created by Brent on 10/19/2015.
 */
function athenaCtrl($scope) {
    $scope.openScenario = function(){
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
    $scope.refreshData = function(){
        clearData(function() {
            console.log('Refreshing data');
            var db = ['sensor', 'weapon', 'track', 'asset', 'truth'];
            for (var i=0; i < 5; i++) {
                socket.emit('refreshAll', db[i], function (cb) {
                    for (var rA in cb) {
                        DOM[cb[rA].create]('add', cb[rA]);
                    }
                });
            }
        });
    };
    $scope.screenShotModal = function() {
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
    $scope.launchModal = function(id){
        $(id).modal();
    };
    $scope.stopOptimization = function() {
        console.log("Stopping optimization");
        socket.emit('stopOptimization');
    };
    $scope.generateThreats = function() {
        if(!$("#generateThreatsItem").hasClass("disabled")) {
            console.log("Generating threats");
            socket.emit('generateThreats');
        }
    };
    $scope.menu = [
        {
            title: 'File',
            submenu: [
                {
                    title: 'Open Scenario',
                    click: $scope.openScenario
                },
                {
                    title: 'Import File',
                    click: $scope.launchModal,
                    val: '#importModal'
                },
                {
                    title: 'Save Scenario',
                    click: $scope.launchModal,
                    val: '#saveModal'
                },
                {
                    title: 'Clear Scenario',
                    click: $scope.launchModal,
                    val: '#clearConfirmModal'
                },
                {
                    divider: 'true'
                },
                {
                    title: 'Refresh Current',
                    click: $scope.refreshData
                },
                {
                    title: 'Screen Capture',
                    click: $scope.screenShotModal
                }
            ]
        },
        {
            title: 'Create',
            submenu: [
                {
                    title: 'Sensors',
                    click: $scope.launchModal,
                    val: '#sensorModal'
                },
                {
                    title: 'Weapons',
                    click: $scope.launchModal,
                    val: '#weaponModal'
                },
                {
                    title: 'Assets',
                    click: $scope.launchModal,
                    val: '#assetModal'
                }
            ]
        },
        {
            title: 'Algorithms',
            submenu: [
                {
                    title: 'Optimize',
                    click: $scope.launchModal,
                    val: '#optimizeModal'
                },
                {
                    title: 'Stop Optimization',
                    click: $scope.stopOptimization
                },
                {
                    divider: 'true'
                },
                {
                    title: 'Generate Threats',
                    click: $scope.generateThreats
                }
            ]
        }
    ];
    $scope.tabs = [
        {
            title: 'Scene',
            contents: 'views/tabs/scene.template.html'
        }
    ];
    $scope.utils = [
        {
            utilUrl: 'views/tabs/sensorSelector.template.html'
        }
    ];
    $scope.modals = [
        {
            modalUrl: 'views/modals/file/openModal.template.html'
        },
        {
            modalUrl: 'views/modals/file/importModal.template.html'
        },
        {
            modalUrl: 'views/modals/file/saveModal.template.html'
        },
        {
            modalUrl: 'views/modals/file/clearConfirmModal.template.html'
        },
        {
            modalUrl: 'views/modals/file/saveImageModal.template.html'
        },
        {
            modalUrl: 'views/modals/create/assetModal.template.html'
        },
        {
            modalUrl: 'views/modals/create/sensorModal.template.html'
        },
        {
            modalUrl: 'views/modals/create/weaponModal.template.html'
        },
        {
            modalUrl: 'views/modals/algorithms/optimizeModal.template.html'
        }
    ];
    $scope.footer = [
        {
            id: 'surveillanceCont',
            title: 'Surveillance Score',
            height: '-271px'
        },
        {
            id: 'fireControlCont',
            title: 'Fire Control Score',
            height: '-331px'
        },
        {
            id: 'weaponCont',
            title: 'Weapon Score',
            height: '-311px'
        },
        {
            id: 'evaluationCont',
            title: 'Evaluation',
            height: '-471px'
        }
    ];
}
