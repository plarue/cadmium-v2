/**
 * Created by Brent on 10/16/2015.
 */
function menuCtrl($scope, athenaFactory) {
    $scope.model = athenaFactory;
    $scope.data = $scope.model.data;
}

function menu() {
    return {
        restrict: 'AE',
        scope: {
            menu: '=data'
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

                var $submenu = $('<div menu data="item.submenu" class="dropdown-menu" role="menu"></div>');
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