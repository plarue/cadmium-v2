/**
 * Created by Brent on 10/20/2015.
 */

function footerCtrl($scope, athenaFactory){
    $scope.data = athenaFactory.data;
}

function footer() {
    return {
        restrict: 'AE',
        scope: true,
        replace: true,
        template: [
            '<div id="{{item.id}}">',
                '<div id="{{\'ht\' + ($index + 1)}}" class="center topHideToggle">',
                    '<a href="#" class ="bht" id="ht1ToggleA" ng-click="slideDown(item.id, item.height)">{{item.title}}</a>',
                '</div>',
                '<div id="{{item.id}}" class="graph"></div>',
            '</div>'
        ].join(''),
        link: function(scope, element, attrs) {

        }
    };
}

angular
    .module('athena.footer', ['ui.bootstrap'])
    .directive('footer', footer)
    .factory('athenaFactory', athenaFactory)
    .controller('footerCtrl', footerCtrl);