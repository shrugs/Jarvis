'use strict';

angular.module('tonyApp')
.factory('SpeechRecognition', function() {

    var SR = {
        finalTranscript: '',
        lastRecognition: 0,
        timeBetweenCommands: 3000,

        init: function() {

            if (!('webkitSpeechRecognition' in window)) {
                this.notSupportedMessage();
            } else {
                this.recognition = new webkitSpeechRecognition();
                this.recognition.continuous = true;
                this.recognition.interimResults = true;
                this.recognition.lang = 'en-US';


                //is called several times if while speeking... builds a string
                this.recognition.onresult = function(event) {
                    //If the last word is a certain time ago, start a new sentence
                    this.isNewCommand();

                    //concat the single workds
                    this.concatSpeechResults(event);

                    if (this.finalTranscript !== '') {
                        this.cb(this.finalTranscript);
                    }
                }.bind(this);

                //The speech this.recognition seems to end without any reason -> simply restarting it
                this.recognition.onend = function(evt) {
                    console.log('end', evt);
                    // this.recognition.start();
                    this.reset();
                }.bind(this);

                this.recognition.start();
            }
        },

        concatSpeechResults: function(event) {
            var interimTranscript = '';
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    this.finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            this.it(interimTranscript);

            return interimTranscript;

        },

        //Check if the last word is too old in order to start a new sentence
        //Resets the stored sentence
        isNewCommand: function() {
            var tmpTime = new Date().getTime();
            if (tmpTime - this.lastRecognition > this.timeBetweenCommands) {
                this.lastRecognition = tmpTime;
                this.finalTranscript = '';
                return true;
            } else {
                return false;
            }
        },

        cb: function(command) {
            this.callback(command);
        },
        it: function(command) {
            this.interimCallback(command);
        },
        onInterim: function(t) {
            this.interimCallback = t;
        },
        onTranscript: function(t) {
            this.callback = t;
        },
        notSupportedMessage: function() {
            console.log('Speech Recognition is only supported by Chrome');
        },
        reset: function() {
            this.recognition.onend = undefined;
            this.init();
        },
        stop: function() {
            this.recognition.onend = undefined;
            this.recognition.stop();
        }
    };


    return SR;
});