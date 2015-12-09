/**
 * Created by Brent on 10/20/2015.
 */
function rightUtilCtrl($scope, cadmiumFactory){
    $scope.model = cadmiumFactory;
    $scope.data = $scope.model.data;
    $scope.proto = $scope.model;
}
function rightUtil(){
    return {
        restrict: 'AE',
        replace: true,
        scope: true,
        template: '<div ng-include="item.utilUrl"></div>',
        link: function (scope, element, attrs) {

        }
    };
}
angular
    .module('cadmium.rightUtil',['ui.bootstrap'])
    .directive('rightutil', rightUtil)
    .factory('cadmiumFactory', cadmiumFactory)
    .controller('rightUtilCtrl', rightUtilCtrl);