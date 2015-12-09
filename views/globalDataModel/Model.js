/**
 * Created by Brent on 11/30/2015.
 */

(function(exports) {

    function Model(model, gdm) {
        this.data = {
            getMenu: [],
            getLeftUtil: [],
            getRightUtil: [],
            getFooter: [],
            getModals: []
        };
        this.dependencies = [];
        this.currentGeometry = {};
        this.toggle = {
            entities: [],
            weapons: [],
            sensors: []
        };
        this.init(model, gdm);
    }

    Model.prototype.init = function(model, gdm){
        //Clear Unused Dependencies
        var oldDependencies = $(this.dependencies).not(model.dependencies).get();
        console.log(oldDependencies);
        if (oldDependencies.length > 0) {
            dropUnused(oldDependencies, gdm);
        }
        //Load New Dependencies
        var newDependencies = $(model.dependencies).not(this.dependencies).get();
        console.log(newDependencies);
        load(newDependencies, gdm);
        //Construct Model
        var dataModel = gdm.globalModel();
        //Load Model
        var menu = fill('menu', model.menu, dataModel);
        this.data.getMenu = menu;
        this.data.getLeftUtil = fill('leftUtil', model.leftUtil, dataModel);
        this.data.getRightUtil = fill('rightUtil', model.rightUtil, dataModel);
        this.data.getFooter = fill('footer', model.footer, dataModel);
        this.data.getModals = fillModals(menu);

        this.dependencies = model.dependencies;

        if (typeof this.listeners === 'function'){
            this.listeners = this.listeners();
            if (!this.listeners.initialized) {
                this.listeners.init();
                this.listeners.initialized = true;
            }
        }
    };

    function dropUnused(a, gdm){
        for (var i=0; i < a.length; i++){
            var d = gdm[a[i]]();
            var proto = Object.getPrototypeOf(d);
            for (var key in proto){
                delete Model.prototype[key];
            }
        }
    }
    function load(modelAttr, gdm){
        for (var i = 0; i < modelAttr.length; i++) {
            if(gdm[modelAttr[i]]) {
                var d = gdm[modelAttr[i]](this);
                var proto = Object.getPrototypeOf(d);
                for (var key in proto){
                    Model.prototype[key] = proto[key];
                }
            }
        }
    }

    function fill(lookTo, modelAttr, gdm){
        var filled = [];
        for (var i = 0; i < modelAttr.length; i++) {
            filled.push(gdm[lookTo][modelAttr[i]])
        }
        return filled
    }

    function fillModals(menu){
        var modals = [];
        var menus = menu;
        for (var i in menus) {
            if (menus[i].submenu) {
                for (var j in menus[i].submenu) {
                    if (menus[i].submenu[j].modalUrl) {
                        modals.push({modalUrl: menus[i].submenu[j].modalUrl})
                    }
                }
            }
        }
        return modals
    }

    exports.Model = Model
})(this);

