/**
 * Created by Brent on 10/20/2015.
 */
function rightUtilCtrl($scope, athenaFactory){
    $scope.data = athenaFactory.data;
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
    .module('athena.rightUtil',['ui.bootstrap'])
    .directive('rightutil', rightUtil)
    .factory('athenaFactory', athenaFactory)
    .controller('rightUtilCtrl', rightUtilCtrl);