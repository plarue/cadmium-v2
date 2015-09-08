/**
 * Created by Brent on 5/20/2015.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var weaponTypes = new Schema({
    id: Number,
    name: String,
    Msl_Id: Number,
    Dt_Lead: Number,
    Dt_Max_Coast: Number,
    Dt_Orient: Number,
    Dt_Deploy: Number,
    Dt_Acquire: Number,
    Dt_Min_Tof: Number,
    Dt_Max_Tof: Number,
    Dt_pre_bo: Number,
    Dt_post_bo: Number,
    Pen_bo: Number,
    Pen_pre_bo: Number,
    Dt_Radar_FC: Number,
    Dt_FC_Processing: Number,
    Dt_Launch_Spacing: Number,
    Dt_Comm_after_Launch: Number,
    Dt_Comm_before_Int: Number,
    Load_Comm: Number,
    Dt_Lead_Comm: Number,
    Dt_Comm_Event: Number,
    Dt_Last_Comm: Number,
    Dt_sen_support: Number,
    Load_sen_support: Number,
    Rel_KV: Number,
    Close_Speed0: Number,
    Close_Speed1: Number,
    FOF_halfangle: Number,
    Deadzone_Radius: Number,
    Min_Alt_Stage3: Number,
    Min_Alt_Int: Number,
    Eff_Alt: Number,
    Max_Alt: Number,
    Check_Earth_BG: Number,
    PK_Strike0: Number,
    Strike_Angle0: Number,
    Strike_Angle1: Number,
    Look_Angle0: Number,
    Inventory: Number
});

mongoose.model('weaponTypes', weaponTypes, 'weaponTypes');
