/**
 * Created by Brent on 10/26/2015.
 */
function modalCtrl($scope){
    $scope.getTemplate = function(){
        console.log($scope.modals.modalUrl);
        return $scope.modals.modalUrl;
    };

    $scope.modals = [
        {
            modalUrl: 'views/modals/file/openModal.template.html'
        },
        {
            modalUrl: 'views/modals/file/importModal.template.html'
        },
        {
            modalUrl: 'views/modals/file/saveModal.template.html'
        },
        {
            modalUrl: 'views/modals/file/clearConfirmModal.template.html'
        },
        {
            modalUrl: 'views/modals/file/saveImageModal.template.html'
        },
        {
            modalUrl: 'views/modals/create/assetModal.template.html'
        },
        {
            modalUrl: 'views/modals/create/sensorModal.template.html'
        },
        {
            modalUrl: 'views/modals/create/weaponModal.template.html'
        },
        {
            modalUrl: 'views/modals/algorithms/optimizeModal.template.html'
        }
    ];
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
    .controller('modalCtrl', modalCtrl);
