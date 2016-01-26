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
        var satAlgorithm = $("input[name=satAlgorithmRadio]:checked").val();
        var bmAlgorithm = $("input[name=bmAlgorithmRadio]:checked").val();

        console.log('Starting Simulation');
        socket.emit('startBirdsEye', satAlgorithm, bmAlgorithm);
    };

    BirdsEye.prototype.stopBirdsEye = function() {
        console.log("Stopping Simulation");
        socket.emit('bigioMsg', {
            topic: 'birds_eye_stop',
            msg: {},
            javaclass: "com.a2i.message.StopMessage"
        });
    };

    exports.BirdsEye = BirdsEye;
})(this);