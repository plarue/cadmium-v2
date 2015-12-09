/**
 * Created by Brent on 11/18/2015.
 */

(function (exports) {

    function GDM() {
        //DEPENDENCIES
        this.Cs = function(){
            return new Cs();
        };
        this.Common = function(){
            return new Common();
        };
        this.Create = function(){
            return new Create();
        };
        this.Acquire = function(){
            return new Acquire();
        };
        this.Vapor = function(){
            return new Vapor();
        };
        this.AdvancedSim = function(){
            return new AdvancedSim();
        };

        //GDM
        this.globalModel = function() {
            return {
                "menu": {
                    "Default": {
                        "title": "File",
                        "submenu": [
                            {
                                "title": "Settings",
                                "click": 'launchModal',
                                "val": "#settingsModal",
                                "modalUrl": "views/modals/file/settingsModal.template.html"
                            }
                        ]
                    },
                    "File": {
                        "title": "File",
                        "submenu": [
                            {
                                "title": "Open Scenario",
                                "click": 'openScenario',
                                "modalUrl": "views/modals/file/openModal.template.html"
                            },
                            {
                                "title": "Import File",
                                "click": 'launchModal',
                                "val": "#importModal",
                                "modalUrl": "views/modals/file/importModal.template.html"
                            },
                            {
                                "title": "Save Scenario",
                                "click": 'launchModal',
                                "val": "#saveModal",
                                "modalUrl": "views/modals/file/saveModal.template.html"
                            },
                            {
                                "title": "Clear Scenario",
                                "click": 'launchModal',
                                "val": "#clearConfirmModal",
                                "modalUrl": "views/modals/file/clearConfirmModal.template.html"
                            },
                            {
                                "divider": "true"
                            },
                            {
                                "title": "Refresh Current",
                                "click": 'refreshData'
                            },
                            {
                                "title": "Screen Capture",
                                "click": 'screenShotModal',
                                "modalUrl": "views/modals/file/saveImageModal.template.html"
                            },
                            {
                                "title": "Settings",
                                "click": 'launchModal',
                                "val": "#settingsModal",
                                "modalUrl": "views/modals/file/settingsModal.template.html"
                            }
                        ]
                    },
                    "Create": {
                        "title": "Create",
                        "submenu": [
                            {
                                "title": "Sensors",
                                "click": 'createModal',
                                "val": "sensor",
                                "modalUrl": "views/modals/create/sensorModal.template.html"
                            },
                            {
                                "title": "Weapons",
                                "click": 'createModal',
                                "val": "weapon",
                                "modalUrl": "views/modals/create/weaponModal.template.html"
                            },
                            {
                                "title": "Assets",
                                "click": 'createModal',
                                "val": "asset",
                                "modalUrl": "views/modals/create/assetModal.template.html"
                            }
                        ]
                    },
                    "Algorithms": {
                        "title": "Algorithms",
                        "submenu": [
                            {
                                "title": "Optimize",
                                "click": 'launchModal',
                                "val": "#optimizeModal",
                                "modalUrl": "views/modals/algorithms/optimizeModal.template.html"
                            },
                            {
                                "title": "Stop Optimization",
                                "click": 'stopOptimization'
                            },
                            {
                                "divider": "true"
                            },
                            {
                                "title": "Generate Threats",
                                "click": 'generateThreats'
                            }
                        ]
                    },
                    "Vapor": {
                        "title": "Vapor",
                        "submenu": [
                            {
                                "title": "Start Vapor",
                                "click": 'startVapor'
                            },
                            {
                                "title": "Stop Vapor",
                                "click": 'stopVapor'
                            },
                            {
                                "divider": "true"
                            },
                            {
                                "title": "Metrics",
                                "click": 'launchModal',
                                "val": "#vaporModal",
                                "modalUrl": "views/modals/vapor/vaporModal.template.html"
                            }
                        ]
                    },
                    "Simulation": {
                        "title": "Simulation",
                        "submenu": [
                            {
                                "title": "Start Sim",
                                "click": 'startSim'
                            },
                            {
                                "title": "Stop Vapor",
                                "click": 'stopSim'
                            },
                            {
                                "title": "Monte Carlo Series",
                                "click": 'launchModal',
                                "val": "#mcSeriesModal",
                                "modalUrl": "views/modals/advancedSim/mcSeriesModal.template.html"
                            }
                        ]
                    }
                },
                "leftUtil": {
                    "Scene": {
                        "title": "Scene",
                        "contents": "views/leftUtil/scene.template.html"
                    },
                    "Prioritization": {
                        "title": "Prioritization",
                        "contents": "views/leftUtil/prioritization.template.html"
                    }
                },
                "rightUtil": {
                    "entitySelect": {
                        "utilUrl": "views/RightUtil/entitySelector.template.html"
                    },
                    "sensorEditor": {
                        "utilUrl": "views/rightUtil/sensorSelector.template.html"
                    }
                },
                "footer": {
                    "surveillanceScore": {
                        "id": "surveillanceCont",
                        "graphId": "surveillanceScore",
                        "title": "Surveillance Score",
                        "height": "-271px"
                    },
                    "fireControlScore": {
                        "id": "fireControlCont",
                        "graphId": "fireControlScore",
                        "title": "Fire Control Score",
                        "height": "-331px"
                    },
                    "weaponScore": {
                        "id": "weaponCont",
                        "graphId": "weaponScore",
                        "title": "Weapon Score",
                        "height": "-311px"
                    },
                    "evaluation": {
                        "id": "evaluationCont",
                        "graphId": "evaluation",
                        "title": "Evaluation",
                        "height": "-471px"
                    }
                }
            }
        }
    }

    exports.GDM = GDM;
})(this);