/**
 * Created by Brent on 12/2/2015.
 */
//Additional functionality classes
function A(){}
A.prototype.fire = function(name){
    console.log(name + ' Choochin');
};
function B(){
}
B.prototype.reFire = function(name){
    //Communicates with A
    this.fire(name);
};

//Controller class
function Controller(){
    //Load additional functionality into prototype
    loadProto();
    //Create links to prototypes so they can co-communicate
    this.link = loadLink(this);
}

function loadProto(){
    //Could be used to dynamically add/remove classes from controller
    Controller.prototype.A = new A();
    Controller.prototype.B = new B();
}

function loadLink(that){
    return {
        fire: that.A.fire,
        reFire: that.B.reFire
    };
}

var c = new Controller();

console.log('-----------------');
console.log(c);
console.log(c.link.fire('A'));
console.log(c.link.reFire('B'));