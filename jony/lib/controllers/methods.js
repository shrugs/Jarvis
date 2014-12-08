
exports.methods = [
    'temp_house', //0
    'temp_coffee', //1
    'lights_bed', //2
    'lights_bath', //3
    'lights_kitchen', //4
    'lights_garage', //5
    'garage', //6
    'lights_attic', //7
    'passthrough' //8
];

exports.IRL = {
    'bedroom': 'lights_bed',
    'livingroom': 'lights_bed',
    'kitchen': 'lights_kitchen',
    'bathroom': 'lights_bath',
    'thegarage': 'lights_garage',
    'garage': 'lights_garage',
    'lamp': 'passthrough',
    'desklamp': 'passthrough',
    'attic': 'lights_attic'
};