'use strict';

angular.module('tonyApp')
.controller('MainCtrl', function ($scope, $timeout, $http, SpeechRecognition, Socket, SC, Speak, Methods) {
    // shouldSpeak is initializer boolean and re-used as logical
    $scope.shouldSpeak = false;
    Socket.on('updateState', function(serverState) {
        console.log(serverState);
        var prevState = angular.copy($scope.state) || {};
        $scope.state = serverState;
        $scope.displayState = angular.copy($scope.state);

        if ($scope.state.lastCommand === 'all_lights') {
            $scope.shouldSpeak = false;
            $scope.updateClosedCaption(Speak.allLights($scope.state.lights_kitchen));
        } else if ($scope.state.lastCommand === 'party') {
            $scope.shouldSpeak = false;
        }

        angular.forEach($scope.displayState, function(value, key) {
            if (prevState[key] !== value) {
                $scope.lastChange = Methods.indexOf(key);
            }

            if (key === 'garage') {
                if ($scope.shouldSpeak && (prevState[key] !== value)) {
                    $scope.updateClosedCaption(Speak.garage(value));

                }
                $scope.displayState[key] = value === 1 ? 'Open' : 'Closed';
            } else if (key === 'temp_house') {
                if ($scope.shouldSpeak && (prevState[key] !== value)) {
                    $scope.updateClosedCaption(Speak.slide(value));

                }
                $scope.displayState[key] = value;
            } else if (key === 'passthrough') {
                if ($scope.shouldSpeak && (prevState[key] !== value)) {
                    $scope.updateClosedCaption(Speak.passthrough(value));

                }
                $scope.displayState[key] = value === 1 ? 'ON' : 'OFF';
            } else {
                if ($scope.shouldSpeak && (prevState[key] !== value)) {
                    $scope.updateClosedCaption(Speak.onOff(key, value));

                }
                $scope.displayState[key] = value === 1 ? 'ON' : 'OFF';
            }
        });
        $scope.shouldSpeak = true;
        $scope.status = 'Updated.';
        $scope.$apply();
    });
    SpeechRecognition.onTranscript(function(transcript) {
        if (transcript.length < 7) {
            // ignore this
            return;
        }
        transcript = transcript.trim().replace('Jarvis', '');
        console.log(transcript);
        $scope.text = transcript;
        $scope.$apply();
        $timeout(function(){
            $scope.text = '';
            $scope.$apply();
        }, 600);
        $scope.issueQuery(transcript);
    });
    SpeechRecognition.onInterim(function(interim) {
        $scope.status = 'Listening...';
        interim = interim.trim();
        if (interim.length < 6) {
            // keep listening
            $scope.text = interim;
        } else if (interim.indexOf('Jarvis') === 0) {
            // keep listening
            $scope.text = interim;
        } else {
            console.log('Should IGNORE:' + interim);
            $scope.status = 'Ignoring "' + interim + '"...';
            SpeechRecognition.reset();
            $scope.text = '';
        }
        $scope.$apply();
    });

    $scope.cards = [
        {
            method: 'temp_coffee',
            title: 'Coffee Pot'
        },
        {
            method: 'lights_bed',
            title: 'Bedroom Lights'
        },
        {
            method: 'lights_bath',
            title: 'Bathroom Lights'
        },
        {
            method: 'lights_kitchen',
            title: 'Kitchen Lights'
        },
        {
            method: 'lights_garage',
            title: 'Garage Light'
        },
        {
            method: 'lights_attic',
            title: 'Attic Light'
        },
        {
            method: 'temp_house',
            title: 'Slide'
        },
        {
            method: 'garage',
            title: 'Garage Door'
        },
        {
            method: 'passthrough',
            title: 'Desk Lamp'
        }
    ];


    SC.initialize({
        client_id: 'db955a95610f1987fa559d8f35fb5587'
    });

    $scope.musicPlaying = false;
    $scope.isListening = true;

    $scope.toggleListening = function() {
        $scope.isListening = !$scope.isListening;
        if ($scope.isListening) {
            $scope.status = 'Starting Voice Recognition';
            $scope.updateClosedCaption(Speak.listening());
            SpeechRecognition.init();
        } else {
            $scope.status = 'Stopping Voice Recognition';
            $scope.updateClosedCaption(Speak.notListening());
            SpeechRecognition.stop();
        }
    };

    $scope.submitText = function() {
        var transcript = $scope.text;
        transcript = transcript.trim().replace('Jarvis', '');
        $scope.text = '';
        $scope.issueQuery(transcript);
        SpeechRecognition.reset();
    };

    $scope.musicSearch = function(query) {
        if ($scope.currentSong !== undefined) {
            $scope.currentSong.pause();
        }
        SC.get('/tracks', { q: query, streamable: true }, function(tracks) {
            if (tracks.length > 0 && tracks[0].uri !== undefined) {
                $scope.updateClosedCaption(Speak.affirmative());
                $scope.song = tracks[0];
                SC.stream(tracks[0].uri, function(sound){
                    $scope.currentSong = sound;
                    $scope.musicPlaying = true;
                    $scope.$apply();
                    $scope.currentSong.options.onfinish = function() {
                        $scope.musicPlaying = false;
                        $scope.$apply();
                    };
                    $scope.currentSong.play();
                });
            } else {
                // TODO: ERROR
                console.log('NO SONGS');
            }
        });
    };

    $scope.toggleMusic = function() {
        if ($scope.musicPlaying) {
            $scope.currentSong.pause();
        } else {
            $scope.updateClosedCaption(Speak.affirmative());
            $scope.currentSong.play();
        }
        $scope.musicPlaying = !$scope.musicPlaying;
    };

    $scope.animateMusicButton = function(btn) {
        angular.element(btn).css({fontSize: '40px'});
        $timeout(function() {
            angular.element(btn).css({fontSize: 'inherit'});
        }, 200);
    };
    $scope.animateStopBtn = function() {
        $scope.updateClosedCaption(Speak.ignore());
        angular.element('.stop-btn').css({
            height: '40px',
            width: '40px',
            top: '17px'
        });
        $timeout(function() {
            angular.element('.stop-btn').css({
                height: '35px',
                width: '35px',
                top: '20px'
            });
        }, 200);
    };
    $scope.resetSpeechRecognition = function() {
        SpeechRecognition.reset();
        $scope.text = '';
    };

    $scope.updateClosedCaption = function(text, t) {
        $scope.closedCaption = text;
        $timeout(function() {
            $scope.closedCaption = '';
        }, t || 2000);
    };


    $scope.issueQuery = function(transcript) {
        // query server, respond to results here
        $scope.status = 'Communicating with Server...';
        $http({
            method: 'GET',
            url: '/api/wit?transcript=' + encodeURIComponent(transcript),
        }).success(function(data) {
            console.log(data);
            $scope.status = 'Waiting on DumbWaiter...';
        });
    };

    Socket.on('music', function(data) {
        $scope.status = 'Waiting...';
        if (data.entities.music_state !== undefined) {
            if (data.entities.music_state.value === 'on') {
                if (data.entities.local_search_query !== undefined) {

                    if (data.entities.local_search_query.value.indexOf('some') === 0) {
                        data.entities.local_search_query.value = data.entities.local_search_query.value.replace('some ', '');
                    }
                    $scope.musicSearch(data.entities.local_search_query.value);
                }
            } else {
                $scope.currentSong.pause();
                $scope.musicPlaying = false;
            }
        } else if (data.entities.local_search_query !== undefined) {

            if (data.entities.local_search_query.value.indexOf('some') === 0) {
                data.entities.local_search_query.value = data.entities.local_search_query.value.replace('some ', '');
            }
            $scope.musicSearch(data.entities.local_search_query.value);
        }
        $scope.$apply();
    });

    Socket.on('party', function(data) {
        $scope.status = 'Waiting...';
        $scope.updateClosedCaption(Speak.party(data));
    });

    Socket.on('respond', function(provoke) {
        $scope.status = 'Waiting...';
        $scope.updateClosedCaption(Speak.respond(provoke), 7000);
        $scope.$apply();
    });
    Socket.on('disconnect', function() {
        $scope.status = 'Server Disconnected!';
        $scope.$apply();
    });
    Socket.on('reconnect', function() {
        $scope.status = 'Server Reconnected.';
        $scope.$apply();
    });

    SpeechRecognition.init();

});

