/**
 * Created by Brent on 11/19/2015.
 */

(function (exports) {
    function Acquire(){
        //ACQUIRE
        //optimize
        //stopOptimization
        //generateThreats
        //evaluateScenario
        //clearHeatmap
    }

    Acquire.prototype.optimize = function() {
        var algorithm = $("#optimizeModal").find("#psoAlgorithm").is(':checked') ? 'PARTICLE_SWARM' :
            $("#optimizeModal").find("#evolutionaryAlgorithm").is(':checked') ? 'EVOLUTIONARY' :
            $("#optimizeModal").find("#greedyAlgorithm").is(':checked') ? 'GREEDY' :
            $("#optimizeModal").find("#stadiumAlgorithm").is(':checked') ? 'STADIUM' : '';

        var type = $("#optimizeModal").find("#sensorsType").is(':checked') ? 'SENSORS' :
            $("#optimizeModal").find("#sensorsTypeTwo").is(':checked') ? 'SENSORS' :
            $("#optimizeModal").find("#weaponsType").is(':checked') ? 'WEAPONS' :
            $("#optimizeModal").find("#weaponsSensorsType").is(':checked') ? 'WEAPONS_SENSORS' :
            $("#optimizeModal").find("#stadiumType").is(':checked') ? 'STADIUM' : '';

        console.log('Optimizing ' + type + ' and ' + algorithm);
        socket.emit('startOptimization', algorithm, type);
    };

    Acquire.prototype.stopOptimization = function() {
        console.log("Stopping optimization");
        socket.emit('stopOptimization');
    };

    Acquire.prototype.generateThreats = function() {
        if (!$("#generateThreatsItem").hasClass("disabled")) {
            console.log("Generating threats");
            socket.emit('generateThreats');
        }
    };

    Acquire.prototype.evaluateScenario = function() {
        console.log("Evaluating scenario");
        clearHeatmap();
        socket.emit('evaluateScenario');
    };

    Acquire.prototype.clearHeatmap = function() {
        for(var p in heatMap) {
            scene.primitives.remove(heatMap[p]);
        }
        heatMap = [];
    };

    exports.Acquire = Acquire;
})(this);

$(document).ready(function() {
    $('input[type=radio][name=algorithmRadio]').change(function() {
        if (this.value == 'algStadium') {
            $('#algOne').hide();
            $('#algTwo').show();
            $('#sensorsTypeTwo').prop('checked','true');
        }
        else{
            $('#algOne').show();
            $('#algTwo').hide();
            $('#sensorsType').prop('checked','true');
        }
    });
});