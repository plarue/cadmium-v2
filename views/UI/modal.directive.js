/**
 * Created by Brent on 10/26/2015.
 */
function modalCtrl($scope, cadmiumFactory){
    $scope.model = cadmiumFactory;
    $scope.data = $scope.model.data;
    $scope.proto = $scope.model;

    $scope.serveModel = function(){
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
        cadmiumFactory.modelInit($('#backEnd').val());
    };
}
function modals(){
    return {
        restrict: 'AE',
        replace: true,
        scope: {
            modals: '=data',
            model: '=model'
        },
        template: [
            '<div ng-repeat="item in modals" >',
                '<div ng-include="item.modalUrl" model="model"></div>',
            '</div>'
        ].join(''),
        link: function (scope, element, attrs) {
        }
    };
}
angular
    .module('cadmium.modals', ['ui.bootstrap'])
    .directive('modals', modals)
    .factory('cadmiumFactory', cadmiumFactory)
    .controller('modalCtrl', modalCtrl);
