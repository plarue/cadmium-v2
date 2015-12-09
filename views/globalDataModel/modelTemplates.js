/**
 * Created by Brent on 10/29/2015.
 */

var modelTemplates = {
    default:{
        dependencies: ['Common'],
        menu: ['Default'],
        leftUtil: ['Scene'],
        rightUtil: ['entitySelect'],
        footer: [],
        modals: []
    },
    acquire:{
        dependencies: ['Cs', 'Common', 'Create', 'Acquire'],
        menu: ['File', 'Create', 'Algorithms'],
        leftUtil: ['Scene'],
        rightUtil: ['entitySelect'],
        footer: ['surveillanceScore', 'fireControlScore', 'weaponScore', 'evaluation'],
        modals: []
    },
    vapor: {
        dependencies: ['Cs', 'Common', 'Create', 'Vapor'],
        menu: ['File', 'Create', 'Vapor'],
        leftUtil: ['Prioritization', 'Scene'],
        rightUtil: ['sensorEditor'],
        footer: [],
        modals: []
    },
    advancedSim: {
        dependencies: ['Cs', 'Common', 'Create', 'AdvancedSim'],
        menu: ['File', 'Create', 'Simulation'],
        leftUtil: ['Scene'],
        rightUtil: ['entitySelect'],
        footer: [],
        modals: []
    }
};

