/**
 * Created by Brent on 10/20/2015.
 */
function leftUtilCtrl($scope, cadmiumFactory){
    $scope.model = cadmiumFactory;
    $scope.data = $scope.model.data;
    $scope.proto = $scope.model;
    $scope.toggle = $scope.model.toggle;
}

function leftUtil($compile){
    var tp = "tabpage_";
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            item: "=item",
            model: "=model",
            toggle: '=toggle'
        },
        template: '<div ng-include="item.contents"></div>',
        link: function (scope, element, attrs) {
            $compile(element.contents())(scope);
        }
    };
}

angular
    .module('cadmium.leftUtil', ['ui.bootstrap'])
    .directive('leftutil', leftUtil)
    .factory('cadmiumFactory', cadmiumFactory)
    .controller('leftUtilCtrl', leftUtilCtrl);