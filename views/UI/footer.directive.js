/**
 * Created by Brent on 10/20/2015.
 */

function footerCtrl($scope, cadmiumFactory){
    $scope.model = cadmiumFactory;
    $scope.data = $scope.model.data;
    $scope.proto = $scope.model;
    $scope.imageryModel = $scope.model.imageryModel;
}

function footer() {
    return {
        restrict: 'AE',
        scope: true,
        replace: true,
        template: [
            '<div id="{{item.id}}">',
                '<div id="{{\'ht\' + ($index + 1)}}" class="center topHideToggle">',
                    '<a href="#" class ="bht" id="ht1ToggleA" ng-click="proto.slideDown(item.id, item.height)">{{item.title}}</a>',
                '</div>',
                '<div ng-include="item.template"></div>',
            '</div>'
        ].join(''),
        link: function(scope, element, attrs) {
            if (scope.$last && typeof scope.model.graph === 'function'){
                setTimeout(function(){
                    scope.model.graph();
                }, 1000)
            }
        }
    };
}

angular
    .module('cadmium.footer', ['ui.bootstrap'])
    .directive('footer', footer)
    .factory('cadmiumFactory', cadmiumFactory)
    .controller('footerCtrl', footerCtrl);