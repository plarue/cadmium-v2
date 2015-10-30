/**
 * Created by Brent on 10/29/2015.
 */

(function(exports) {

    function Model(model) {
        this.menu = fill('menu', model.menu);
        this.leftUtil = fill('tabs', model.leftUtil);
        this.rightUtil = fill('utils', model.rightUtil);
        this.footer = fill('footer', model.footer);
        this.modals = fillModals();
    }

     function fill(lookTo, modelAttr){
        var filled = [];
        for (var i = 0; i < modelAttr.length; i++) {
            console.log(gdm);
            filled.push(gdm[lookTo][modelAttr])
        }
        return filled
    }

    function fillModals(){
        var modals = [];
        var menus = this.menu;
        for (var i in menus) {
            if (menus[i].submenu) {
                for (var j in menus[i].submenu) {
                    modals.push({modalUrl: menus[i].submenu[j].modalUrl})
                }
            }
        }
        return modals
    }

    exports.Model = Model
})(this);

