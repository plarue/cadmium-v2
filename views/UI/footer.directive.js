/**
 * Created by Brent on 10/20/2015.
 */

function footerCtrl($scope){

    $scope.slideDown = function(id, dist){
        var box = $('#' + id);
        ( box.css('bottom') == dist || box.css('bottom') == '' )
            ? box.css('bottom','1em')
            : box.css('bottom', dist);
    };

    $scope.footer = [
        {
            id: 'surveillanceCont',
            title: 'Surveillance Score',
            height: '-271px'
        },
        {
            id: 'fireControlCont',
            title: 'Fire Control Score',
            height: '-331px'
        },
        {
            id: 'weaponCont',
            title: 'Weapon Score',
            height: '-311px'
        },
        {
            id: 'evaluationCont',
            title: 'Evaluation',
            height: '-471px'
        }
    ];
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
    .controller('footerCtrl', footerCtrl);