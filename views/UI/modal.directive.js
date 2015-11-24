/**
 * Created by Brent on 10/26/2015.
 */
function modalCtrl($scope, athenaFactory){
    $scope.model = athenaFactory;
    $scope.data = $scope.model.data;

    $scope.serveModel = function(){
        athenaFactory.modelInit($('#backEnd').val());
    };
}
function modals(){
    return {
        restrict: 'AE',
        replace: true,
        scope: true,
        template: '<div ng-include="item.modalUrl"></div>',
        link: function (scope, element, attrs) {

        }
    };
}
angular
    .module('athena.modals', ['ui.bootstrap'])
    .directive('modals', modals)
    .factory('athenaFactory', athenaFactory)
    .controller('modalCtrl', modalCtrl);
