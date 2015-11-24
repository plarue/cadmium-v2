/**
 * Created by Brent on 10/29/2015.
 */

var modelTemplates = {
    default:{
        dependencies: ['Common'],
        menu: ['File'],
        leftUtil: ['Scene'],
        rightUtil: ['entitySelect'],
        footer: [],
        modals: []
    },
    acquire:{
        dependencies: ['Common', 'Acquire'],
        menu: ['File', 'Create', 'Algorithms'],
        leftUtil: ['Scene'],
        rightUtil: ['entitySelect'],
        footer: ['surveillanceScore', 'fireControlScore', 'weaponScore', 'evaluation'],
        modals: []
    },
    vapor: {
        dependencies: ['Cs', 'Common', 'Vapor'],
        menu: ['File', 'Create', 'Vapor'],
        leftUtil: ['Prioritization'],
        rightUtil: ['sensorEditor'],
        footer: [],
        modals: []
    }
};

