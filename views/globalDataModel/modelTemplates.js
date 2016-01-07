/**
 * Created by Brent on 10/29/2015.
 */

var modelTemplates = {
    default:{
        dependencies: ['Listeners', 'Common', 'EntitySelector'],
        menu: ['Default'],
        leftUtil: ['Scene'],
        rightUtil: ['entitySelect'],
        footer: [],
        modals: []
    },
    acquire:{
        dependencies: ['Listeners', 'Cs', 'Common', 'EntitySelector', 'Create', 'Acquire'],
        menu: ['File', 'Create', 'Algorithms'],
        leftUtil: ['Scene'],
        rightUtil: ['entitySelect'],
        footer: ['surveillanceScore', 'fireControlScore', 'weaponScore', 'evaluation'],
        modals: []
    },
    vapor: {
        dependencies: ['Listeners', 'Cs', 'Common', 'Create', 'Vapor'],
        menu: ['File', 'vaporCreate', 'Vapor'],
        leftUtil: ['Prioritization', 'Scene'],
        rightUtil: ['sensorEditor'],
        footer: [],
        modals: []
    },
    advancedSim: {
        dependencies: ['Listeners', 'Cs', 'Common', 'EntitySelector', 'Create', 'AdvancedSim'],
        menu: ['File', 'Create', 'Simulation'],
        leftUtil: ['Scene'],
        rightUtil: ['entitySelect'],
        footer: ['clouds'],
        modals: []
    },
    birdsEye: {
        dependencies: ['Listeners', 'Cs', 'Common', 'EntitySelector', 'Create', 'BirdsEye'],
        menu: ['File', 'Create', 'BirdsEye'],
        leftUtil: ['Scene'],
        rightUtil: ['entitySelect'],
        footer: ['clouds'],
        modals: []
    }
};

