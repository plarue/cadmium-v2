/**
 * Created by Brent on 10/19/2015.
 */
function athenaCtrl($scope) {
    $scope.menu = [
        {
            title: 'File',
            submenu: [
                {
                    title: 'Open Scenario',
                    funct: 'openScenario'
                },
                {
                    title: 'Import File',
                    funct: 'importFile'
                },
                {
                    title: 'Save Scenario',
                    funct: 'saveScenario'
                },
                {
                    title: 'Clear Scenario',
                    funct: 'clearScenario'
                },
                {
                    divider: 'true'
                },
                {
                    title: 'Refresh Current',
                    funct: 'refreshCurrent'
                },
                {
                    title: 'Screen Capture',
                    funct: 'screenCapture'
                }
            ]
        },
        {
            title: 'Create',
            submenu: [
                {
                    title: 'Sensors',
                    funct: 'openScenario'
                },
                {
                    title: 'Weapons',
                    funct: 'importFile'
                },
                {
                    title: 'Assets',
                    funct: 'saveScenario'
                }
            ]
        },
        {
            title: 'Algorithms',
            submenu: [
                {
                    title: 'Optimize',
                    funct: 'openScenario'
                },
                {
                    title: 'Stop Optimization',
                    funct: 'importFile'
                },
                {
                    divider: 'true'
                },
                {
                    title: 'Generate Threats',
                    funct: 'clearScenario'
                }
            ]
        }
    ];
}
