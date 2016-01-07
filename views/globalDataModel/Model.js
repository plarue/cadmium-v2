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
        this.initialized = {
            Common: false,
            Acquire: false,
            Cs: false,
            Vapor: false
        };
        this.heatMap = [];
        this.currentGeometry = {};
        this.imageryModel = {};
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
        if (oldDependencies.length > 0) {
            dropUnused(oldDependencies, gdm);
        }

        //Load New Dependencies
        var newDependencies = $(model.dependencies).not(this.dependencies).get();
        load(newDependencies, gdm, this);

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

    function load(a, gdm, self){
        for (var i = 0; i < a.length; i++) {
            if(gdm[a[i]]) {
                var d = gdm[a[i]]();
                var proto = Object.getPrototypeOf(d);
                for (var key in proto){
                    Model.prototype[key] = proto[key];
                }
                if (self.listeners) {
                    if (typeof self.listeners[a[i]] === 'function' && self.initialized[a[i]] === false) {
                        self.listeners[a[i]](self);
                        self.initialized[a[i]] = true;
                    }
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

