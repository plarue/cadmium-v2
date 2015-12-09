/**
 * Created by Brent on 10/16/2015.
 */

function menuCtrl($scope, cadmiumFactory) {
    $scope.model = cadmiumFactory;
    $scope.data = $scope.model.data;
    $scope.proto = $scope.model;
}

function menu() {
    return {
        restrict: 'AE',
        scope: {
            menu: '=data',
            model: '=model'
        },
        replace: true,
        template: [
            '<ul>',
                '<li ng-repeat="item in menu" menu-item="item" model="model"></li>',
            '</ul>'
        ].join(''),
        link: function(scope, element, attrs) {

        }
    };
}

function menuItem($compile) {
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            item: '=menuItem',
            model: '=model'
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

                var $submenu = $('<div menu data="item.submenu" class="dropdown-menu" role="menu" model="model"></div>');
                element.append($submenu);
            }
            if (scope.item.click) {
                (!scope.item.val)
                ? element.find('a').attr('ng-click', 'model[item.click]()')
                : element.find('a').attr('ng-click', 'model[item.click](item.val)');
            }
            $compile(element.contents())(scope);
        }
    };
}

angular
    .module('cadmium.menu', ['ui.bootstrap'])
    .directive('menu', menu)
    .directive('menuItem', menuItem)
    .factory('cadmiumFactory', cadmiumFactory)
    .controller('menuCtrl', menuCtrl);