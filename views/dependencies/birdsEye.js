/**
 * Created by Brent on 12/11/2015.
 */

(function(exports){


    function BirdsEye(){
        /*
            startBirdsEye
            stopBirdsEye
         */
    }


    BirdsEye.prototype.startBirdsEye = function() {
        console.log('Starting Simulation');
        socket.emit('startOptimization', null, null);
    };

    BirdsEye.prototype.stopBirdsEye = function() {
        console.log("Stopping Simulation");
        socket.emit('stopOptimization');
    };

    exports.BirdsEye = BirdsEye;
})(this);