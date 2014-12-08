'use strict';

angular.module('tonyApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ngAnimate'
])
.config(function ($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
    })
    .otherwise({
        redirectTo: '/'
    });
})
.factory('Methods', function() {
    return [
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
})
.factory('Socket', function() {
    return window.io.connect('https://0.0.0.0:9000');
})
.factory('SC', function() {
    return window.SC;
})
.factory('Physics', function() {
    return window.Physics;
})
.factory('TWEEN', function() {
    return window.TWEEN;
});
