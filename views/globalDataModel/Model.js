/**
 * Created by Brent on 10/29/2015.
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
        this.init(model, gdm);
    }

    Model.prototype.init = function(model, gdm){
        //Load Dependencies
        load(model.dependencies, gdm);
        //Construct Model
        var dataModel = gdm.globalModel(this);
        //Load Model
        var menu = fill('menu', model.menu, dataModel);
        this.data.getMenu = menu;
        this.data.getLeftUtil = fill('leftUtil', model.leftUtil, dataModel);
        this.data.getRightUtil = fill('rightUtil', model.rightUtil, dataModel);
        this.data.getFooter = fill('footer', model.footer, dataModel);
        this.data.getModals = fillModals(menu);
    };

    function load(modelAttr, gdm){
        for (var i = 0; i < modelAttr.length; i++) {
            if(gdm[modelAttr[i]]) {
                var p = gdm[modelAttr[i]];
                Model.prototype[modelAttr[i]] = p();
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

