/**
 * Created by Brent on 10/21/2015.
 */

var viewer = new Cesium.Viewer('cesiumContainer', {
    scene3DOnly : true,
    baseLayerPicker : false,
    infoBox : false,
    animation : false,
    timeline : false,
    navigationHelpButton : false,
    geocoder : true,
    //OFFLINE IMAGERY PROVIDER
    /*imageryProvider : new Cesium.TileMapServiceImageryProvider({
        //url : Cesium.buildModuleUrl('/Cesium/Assets/Textures/NaturalEarthII')
        url : ('../../public/javascripts/Cesium/Assets/Textures/NaturalEarthII'),
        maximumLevel : 5
    }),*/
    //ONLINE IMAGERY PROVIDER
    imageryProvider : new Cesium.BingMapsImageryProvider({
     url : '//dev.virtualearth.net',
     mapStyle : Cesium.BingMapsStyle.AERIAL_WITH_LABELS
     }),
    /*imageryProvider : new Cesium.WebMapTileServiceImageryProvider({
     url : 'http://map1.vis.earthdata.nasa.gov/wmts-geo/wmts.cgi?SERVICE=WMTS&request=GetCapabilities',
     layer : 'MODIS_Terra_SurfaceReflectance_Bands121',
     style : 'default',
     format : 'image/jpeg',
     tileMatrixSetID : 'EPSG4326_250m',
     // tileMatrixLabels : ['default028mm:0', 'default028mm:1', 'default028mm:2' ...],
     maximumLevel: 9,
     credit : new Cesium.Credit('U. S. Geological Survey'),
     proxy: new Cesium.DefaultProxy('/proxy/')
     }),*/
    terrainProvider : new Cesium.CesiumTerrainProvider({
        url : '//assets.agi.com/stk-terrain/world'
    })
    //creditContainer: "hidden"
});

var scene = viewer.scene;
var terrainProvider = new Cesium.CesiumTerrainProvider({
    url : '//assets.agi.com/stk-terrain/world'
});
var ellipsoid = scene.globe.ellipsoid;
var handler;
var i = 0;
var msg = 'default';
var socket = io();
var camera = scene.camera;
var imageryLayers = viewer.scene.imageryLayers;

var imageryModel = [];

/*var blackMarble = imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
    url : 'http://a.tile.openweathermap.org/map/clouds/0/0/0',
    layer: 'clouds',
    style: 'default',
    format : 'image/png',
    tileMatrixSetID : 'a'
}));

blackMarble.alpha = 0.5;

blackMarble.brightness = 2.0;*/

function setupLayers(){
    addAdditionalLayerOption(
        'USA NEXRAD - Base Reflectivity',
        new Cesium.WebMapServiceImageryProvider({
            url : '//mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi?',
            layers : 'nexrad-n0r',
            parameters : {
                transparent : 'true',
                format : 'image/png'
            },
            proxy : new Cesium.DefaultProxy('/proxy/')
        })
    );
    addAdditionalLayerOption(
        'USA NEXRAD - Ridge2 Mosaics',
        new Cesium.WebMapServiceImageryProvider({
            url: 'http://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer',
            parameters: {
                transparent: 'true',
                format: 'image/png'
            }
        })
    );
}

function addAdditionalLayerOption(name, imageryProvider) {
    var layer = imageryLayers.addImageryProvider(imageryProvider);
    layer.alpha = 1.0;
    layer.show = true;
    layer.name = name;
    imageryModel.push({layer: layer, properties: ['alpha', 'show', 'name']});
}

//MIL STD 2525
var RendererSettings = armyc2.c2sd.renderer.utilities.RendererSettings;
var msa = armyc2.c2sd.renderer.utilities.MilStdAttributes;

/**
 * PAGE LOAD
 */
function start() {
    //LOAD MIL STD 2525 FONTS
    if (armyc2.c2sd.renderer.utilities.RendererUtilities.fontsLoaded()) {
        console.log("fonts loaded fast");
        fontsLoaded = true;
    }
    else {
        fontCheckTimer = setTimeout(checkFonts, 1000);
    }
    //TABS
    var container = document.getElementById("tabContainer");
    var tabcon = document.getElementById("tabscontent");
    var navitem = document.getElementById("tabHeader_1");
    var ident = navitem.id.split("_")[1];

    navitem.parentNode.setAttribute("data-current", ident);
    navitem.setAttribute("class", "tabActiveHeader");
    var pages = tabcon.getElementsByClassName("tabpage");

    for (i = 1; i < pages.length; i++) {
        pages.item(i).style.display = "none";
    }

    var tabs = container.getElementsByTagName("li");
    for (i = 0; i < tabs.length; i++) {
        tabs[i].onclick = displayPage;
    }

    // on click of one of tabs
    function displayPage() {
        var current = this.parentNode.getAttribute("data-current");
        //remove class of activetabheader and hide old contents
        document.getElementById("tabHeader_" + current).removeAttribute("class");
        document.getElementById("tabpage_" + current).style.display = "none";

        var ident = this.id.split("_")[1];
        //add class of activetabheader to new active tab and show contents
        this.setAttribute("class", "tabActiveHeader");
        document.getElementById("tabpage_" + ident).style.display = "block";
        this.parentNode.setAttribute("data-current", ident);
    }
}

/**
 * FUNCTIONS
 */
var logging = $('#logging');
function loggingMessage(message) {
    logging.html(message);
    setTimeout(function(){
        logging.html('');
    }, 5000)
}
var fontCheckTimer = null;
var retries = 15;
var attempts = 0;
var fontsLoaded = false;

function checkFonts()
{
    if(armyc2.c2sd.renderer.utilities.RendererUtilities.fontsLoaded())
    {
        console.log("fonts loaded");
        fontsLoaded = true;
    }
    else if(attempts < retries)
    {
        attempts++;
        fontCheckTimer = setTimeout(checkFonts, 1000);
        console.log("fonts loading...");
        //sometimes font won't register until after a render attempt
        armyc2.c2sd.renderer.MilStdIconRenderer.Render("SHAPWMSA-------",{});
    }
    else
    {
        console.log("fonts didn't load or status couldn't be determined for " + retries + " seconds.");
        //Do actions to handle font failure to load scenario
    }
}
