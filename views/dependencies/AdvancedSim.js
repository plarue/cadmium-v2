/**
 * Created by Brent on 12/7/2015.
 */

(function (exports) {

    function AdvancedSim(){
        //AdvancedSim
        //optimize
        //stopOptimization
        //generateThreats
        //evaluateScenario
        //clearHeatmap
    }

    AdvancedSim.prototype.mcSeries = function() {
        var self = this;
        console.log('Starting MonteCarlo Series');
        self.loggingMessage("Starting MonteCarlo Series");
        socket.emit('startMCSeries');
    };

    AdvancedSim.prototype.startSim = function() {
        var self = this;
        console.log("Starting Simulation");
        self.loggingMessage("Starting Simulation");
        socket.emit('startSimulation');
    };

    AdvancedSim.prototype.stopSim = function() {
        var self = this;
        console.log("Stopping Simulation");
        self.loggingMessage("Stopping Simulation");
        socket.emit('stopSimulation');
    };

    AdvancedSim.prototype.mcAR = function(pm) {
        var val = $('#seriesID').val();
        if (pm){
            $('#seriesID').val(+val + 1);
        }else if (!pm && +val >= 1){
            $('#seriesID').val(+val - 1);
        }
    };

    exports.AdvancedSim = AdvancedSim;
})(this);