/**
 * Created by Brent on 10/20/2015.
 */
function leftUtilCtrl($scope, athenaFactory){
    $scope.data = athenaFactory.data;
}

function leftUtil(){
    return {
        restrict: 'AE',
        replace: true,
        scope: true,
        template: '<div ng-include="item.contents"></div>',
        link: function (scope, element, attrs) {

        }
    };
}
angular
    .module('athena.leftUtil', ['ui.bootstrap'])
    .directive('leftutil', leftUtil)
    .factory('athenaFactory', athenaFactory)
    .controller('leftUtilCtrl', leftUtilCtrl);