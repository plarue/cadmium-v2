/**
 * Created by Brent on 12/7/2015.
 */

(function (exports) {


    function AdvancedSim(){
        //AdvancedSim
        //mcSeries
        //simControl
        //mcAR
    }


    AdvancedSim.prototype.mcSeries = function() {
        var self = this;
        console.log('Starting MonteCarlo Series');
        self.loggingMessage("Starting MonteCarlo Series");
        socket.emit('startMCSeries');
    };

    AdvancedSim.prototype.simControl = function(msg) {
        var self = this;
        console.log("Sending app command: " + msg);
        self.loggingMessage("Sending app command: " + msg);
        socket.emit('controlSim', msg);
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