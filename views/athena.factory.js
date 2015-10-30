/**
 * Created by Brent on 10/29/2015.
 */
function athenaFactory(){
    var service = {};
    var _model = acquireModel;
    var displayModel = function(){
        return new Model(_model);
    };
    console.log(new Model(_model));
    service.getMenu = function(){
        console.log(displayModel.menu);
        return displayModel.menu;
    };
    service.getLeftUtil = function(){
        return displayModel.leftUtil
    };
    service.getRightUtil = function(){
        return displayModel.rightUtil
    };
    service.getFooter = function(){
        return displayModel.footer
    };
    service.getModals = function(){
        return displayModel.modals
    };

    service.setModel = function(model){
        _model = model;
    };

    return service
}