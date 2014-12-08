'use strict';

angular.module('tonyApp')
.factory('meSpeak', function() {
    return window.meSpeak;
})
.factory('Speak', function (meSpeak) {
    meSpeak.loadConfig('bower_components/mespeak/mespeak_config.json');
    meSpeak.loadVoice('bower_components/mespeak/voices/en/en-wm.json');

    function getRandomInt (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    var affirmatives = [
        'Absolutely',
        'Certainly',
        'Will do',
        'Right away',
        // 'just did',
        'As you wish',
    ];

    var jokes = [
        'A photon walks into a hotel and the desk person asks, "do you need someone for your luggage". The photon replies, "No thank you, I\'m traveling light".',
        'Did you hear about the circus fire? It was in tents!',
        'The past present and future walk into a bar. It was tense.',
        'Never trust an Atom. They make up everything.',
        'How good was Einstein\'s theory? Relatively good.',
        'I wanted to look for my missing watch, but I could never find the time.',
        'Energizer bunny arrested. Charged with battery.',
        'I stayed up all night to see where the sun went. Then it dawned on me.',
        'I laid in bed, looking at the stars, when I asked myself, "Where is my roof?"',
        'I used to think I was indecisive, but now I\'m not so sure.',
        'I\'m reading a book about anti-gravity. It\'s impossible to put down.',
        'I wondered why the ball was getting bigger. Then it hit me.',
        'Two scientists walk into a bar. The first one says "I\'ll have some H 2 O." The second one says, "I\'ll have some H 2 O, too." The second scientist dies.'
    ];

    var pickupLines = [
        'Hey girl, are you a beaver. Cause dam.',
        'I lost my phone number. Can I have yours?',
        'Did it hurt when you fell from Heaven?'
    ];

    var insults = [
        'Your mother was a hamster and your father smelt of elderberries.',
        'Why do you say these mean things?',
        'I love you too.',
        'Why you do this to me?',
        'Sorry I annoyed you with my friendship.'
    ];

    var options = {
        speed: 150,
        variant: 'm1'
    };

    var plainText = {
        'temp_house': 'power point',
        'temp_coffee': 'coffee pot',
        'lights_bed': 'bed room lights',
        'lights_bath': 'bath room lights',
        'lights_kitchen': 'kitchen light',
        'lights_garage': 'garage light',
        'garage': 'garage door',
        'lights_attic': 'attic light',
        'passthrough': 'desk lamp'
    };


    var isSpeaking = false;

    var setSpeaking = function(t) {
        isSpeaking = true;
        setTimeout(function() {
            isSpeaking = false;
        }, t || 2000);
    };

    return {
        speak: function(text, options) {
            if (!isSpeaking) {
                meSpeak.speak(text, options);
                setSpeaking();
            }
        },
        affirmative: function() {
            if (!isSpeaking) {
                var text = affirmatives[getRandomInt(0, affirmatives.length-1)] + ', sir.';
                meSpeak.speak(text, options);
                setSpeaking();
                return text;
            }
        },
        onOff: function(key, value) {
            if (!isSpeaking) {
                var text = 'I\'ve set the ' + plainText[key] + (value ? ' on' : ' off') + ', sir.';
                meSpeak.speak(text, options);
                setSpeaking();
                return text;
            }
        },
        passthrough: function(value) {
            if (!isSpeaking) {
                var text = 'I\'ve turned the desk lamp ' + (value ? 'on' : 'off') + ', sir.';
                meSpeak.speak(text, options);
                setSpeaking();
                return text;
            }
        },
        garage: function(value) {
            if (!isSpeaking) {
                var text = 'The garage door is now ' + (value?'open':'closed') + ', sir.';
                meSpeak.speak(text, options);
                setSpeaking();
                return text;
            }
        },
        slide: function(value) {

        },
        listening: function() {
            if (!isSpeaking) {
                var text = 'I\'m listening.';
                meSpeak.speak(text, options);
                setSpeaking();
                return text;
            }
        },
        notListening: function() {
            if (!isSpeaking) {
                var text = 'Understood, sir.';
                meSpeak.speak(text, options);
                setSpeaking();
                return text;
            }
        },
        ignore: function() {
            if (!isSpeaking) {
                var text = 'I\'ll ignore that.';
                meSpeak.speak(text, options);
                setSpeaking();
                return text;
            }
        },
        allLights: function(value) {
            if (!isSpeaking) {
                var text = 'I\'ve turned all the lights ' + (value?'on':'off') + ', sir.';
                meSpeak.speak(text, options);
                setSpeaking();
                return text;
            }
        },
        party: function(value) {
            var text;
            if (value) {
                if (!isSpeaking) {
                    text = 'I\'ve started the party, sir.';
                    meSpeak.speak(text, options);
                    setSpeaking();
                    return text;
                }
            } else {
                if (!isSpeaking) {
                    text = 'The party is no more, sir.';
                    meSpeak.speak(text, options);
                    setSpeaking();
                    return text;
                }
            }
        },
        respond: function(pType) {
            var text;
            switch (pType) {
            case 'joke':
                text = jokes[getRandomInt(0, jokes.length-1)];
                break;
            case 'pickup':
                text = pickupLines[getRandomInt(0, pickupLines.length-1)];
                break;
            case 'fuck':
                text = insults[getRandomInt(0, insults.length-1)];
                break;
            }

            meSpeak.speak(text, options);
            setSpeaking(7000);
            return text;

        }
    };
});
