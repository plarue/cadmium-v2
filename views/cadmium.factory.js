/**
 * Created by Brent on 10/29/2015.
 */
function cadmiumFactory(){
    var _GDM = new GDM();
    var _templateModel = modelTemplates;
    var _template = _templateModel.default;
    var _model = new Model('default', _template, _GDM);
    console.log(_model);

    function modelInit(template){
        _template = _templateModel[template];
        _model.init(template, _template, _GDM);
        console.log(_model);
    }

    Model.prototype.modelInit = modelInit;

    return _model
}