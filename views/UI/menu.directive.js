/**
 * Created by Brent on 10/16/2015.
 */
function menuCtrl($scope, athenaFactory) {
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
    $scope.menu = athenaFactory.getMenu();
}

function menu() {
    return {
        restrict: 'AE',
        scope: {
            menu: '=menu'
        },
        replace: true,
        template: [
            '<ul>',
                '<li ng-repeat="item in menu" menu-item="item"></li>',
            '</ul>'
        ].join(''),
        link: function(scope, element, attrs) {
            //element.addClass(attrs.class);
            //element.addClass(scope.cls);
        }
    };
}

function menuItem($compile) {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            item: '=menuItem'
        },
        template: [
            '<li active-link >',
                '<a href=#>{{item.title}}</a>',
            '</li>'
        ].join(''),
        link: function (scope, element, attrs) {
            if (scope.item.divider) {
                element.addClass('divider');
                element.addClass('bb');
                element.attr('role', 'separator');
                element.empty();
            }
            if (scope.item.submenu) {
                element.addClass('dropdown');

                var text = element.children('a').text();
                element.empty();
                var $a = $('<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">'+text+'<span class="caret"></span></a>');
                element.append($a);

                var $submenu = $('<div menu="item.submenu" class="dropdown-menu" role="menu"></div>');
                element.append($submenu);
            }
            if (scope.item.click) {
                (!scope.item.val)
                ? element.find('a').attr('ng-click', 'item.click()')
                : element.find('a').attr('ng-click', 'item.click(item.val)');
            }
            $compile(element.contents())(scope);
        }
    };
}

angular
    .module('athena.menu', ['ui.bootstrap'])
    .directive('menu', menu)
    .directive('menuItem', menuItem)
    .factory('athenaFactory', athenaFactory)
    .controller('menuCtrl', menuCtrl);