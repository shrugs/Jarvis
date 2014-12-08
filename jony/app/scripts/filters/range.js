'use strict';

angular.module('tonyApp')
.filter('range', function() {
    return function(input) {
        var lowBound, highBound;
        switch (input.length) {
        case 1:
            lowBound = 0;
            highBound = parseInt(input[0], 10) - 1;
            break;
        case 2:
            lowBound = parseInt(input[0], 10);
            highBound = parseInt(input[1], 10);
            break;
        default:
            return input;
        }
        var result = [];
        for (var i = lowBound; i <= highBound; i++) {
            result.push(i);
        }
        return result;
    };
});