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
        this.Acquire = function(){
            return new Acquire();
        };
        this.Vapor = function(){
            return new Vapor();
        };

        //GDM
        this.globalModel = function(that) {
            return {
                "menu": {
                    "File": {
                        "title": "File",
                        "submenu": [
                            {
                                "title": "Open Scenario",
                                "click": that.Common.openScenario,
                                "modalUrl": "views/modals/file/openModal.template.html"
                            },
                            {
                                "title": "Import File",
                                "click": that.Common.launchModal,
                                "val": "#importModal",
                                "modalUrl": "views/modals/file/importModal.template.html"
                            },
                            {
                                "title": "Save Scenario",
                                "click": that.Common.launchModal,
                                "val": "#saveModal",
                                "modalUrl": "views/modals/file/saveModal.template.html"
                            },
                            {
                                "title": "Clear Scenario",
                                "click": that.Common.launchModal,
                                "val": "#clearConfirmModal",
                                "modalUrl": "views/modals/file/clearConfirmModal.template.html"
                            },
                            {
                                "divider": "true"
                            },
                            {
                                "title": "Refresh Current",
                                "click": that.Common.refreshData
                            },
                            {
                                "title": "Screen Capture",
                                "click": that.Common.screenShotModal,
                                "modalUrl": "views/modals/file/saveImageModal.template.html"
                            },
                            {
                                "title": "Settings",
                                "click": that.Common.launchModal,
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
                                "click": that.Common.launchModal,
                                "val": "#sensorModal",
                                "modalUrl": "views/modals/create/sensorModal.template.html"
                            },
                            {
                                "title": "Weapons",
                                "click": that.Common.launchModal,
                                "val": "#weaponModal",
                                "modalUrl": "views/modals/create/weaponModal.template.html"
                            },
                            {
                                "title": "Assets",
                                "click": that.Common.launchModal,
                                "val": "#assetModal",
                                "modalUrl": "views/modals/create/assetModal.template.html"
                            }
                        ]
                    },
                    "Algorithms": {
                        "title": "Algorithms",
                        "submenu": [
                            {
                                "title": "Optimize",
                                "click": that.Common.launchModal,
                                "val": "#optimizeModal",
                                "modalUrl": "views/modals/algorithms/optimizeModal.template.html"
                            },
                            {
                                "title": "Stop Optimization",
                                "click": (typeof that.Acquire != 'undefined') ? that.Acquire.stopOptimization : null
                            },
                            {
                                "divider": "true"
                            },
                            {
                                "title": "Generate Threats",
                                "click": (typeof that.Acquire != 'undefined') ? that.Acquire.generateThreats : null
                            }
                        ]
                    },
                    "Vapor": {
                        "title": "Vapor",
                        "submenu": [
                            {
                                "title": "Start Vapor",
                                "click": (typeof that.Vapor != 'undefined') ? that.Vapor.startVapor : null
                            },
                            {
                                "title": "Stop Vapor",
                                "click": (typeof that.Vapor != 'undefined') ? that.Vapor.stopVapor : null
                            },
                            {
                                "divider": "true"
                            },
                            {
                                "title": "Metrics",
                                "click": that.Common.launchModal,
                                "val": "#vaporModal",
                                "modalUrl": "views/modals/vapor/vaporModal.template.html"
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
                        "title": "Surveillance Score",
                        "height": "-271px"
                    },
                    "fireControlScore": {
                        "id": "fireControlCont",
                        "title": "Fire Control Score",
                        "height": "-331px"
                    },
                    "weaponScore": {
                        "id": "weaponCont",
                        "title": "Weapon Score",
                        "height": "-311px"
                    },
                    "evaluation": {
                        "id": "evaluationCont",
                        "title": "Evaluation",
                        "height": "-471px"
                    }
                }
            }
        }
    }

    exports.GDM = GDM;
})(this);