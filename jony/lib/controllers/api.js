'use strict';

var darude = '{"intent":"music","entities":{"local_search_query":{"end":21,"start":5,"value":"darude sandstorm","body":"darude sandstorm","suggested":true},"music_state":{"value":"on"}},"confidence":0.838}';
var stopMusic = '{"intent":"music","entities":{"local_search_query":{"end":15,"start":10,"value":"music","body":"music","suggested":true},"music_state":{"value":"off"}},"confidence":0.879}';

module.exports = function(io) {
    var api = {};
    var methodData = require('./methods');
    var methods = methodData.methods;
    var IRL = methodData.IRL;
    var wit = require('./wit');
    var Future = require('futures').future;
    var serialport = require('serialport');
    var SerialPort = serialport.SerialPort;
    var serialPort = new SerialPort('/dev/tty.usbserial-A60214QD', {
        baudrate: 57600,
        parser: serialport.parsers.readline('\n')
    }, false);

    io.on('connection', function() {
        updateState(undefined, undefined, true);
    });


    function handleInput(data) {
        if (data.indexOf('i:') === 0) {
            // receiving an i (input)
            data = data.replace('i:', '').split(':');
            var method = parseInt(data[0], 10);
            var arg = parseInt(data[1], 10);
            // now sync that the the client with socketio
            console.log('Would Sync Method: ' + method + ' and arg: ' + arg);
        } else {
            console.log(data);
        }
    }

    serialPort.open(function () {
        console.log('open');
        // serialPort.on('data', handleInput);
    });

    // default state, everything is off
    var state = {
        'temp_house': 0,
        'temp_coffee': 0,
        'lights_bed': 0,
        'lights_bath': 0,
        'lights_kitchen': 0,
        'lights_garage': 0,
        'garage': 0,
        'lights_attic': 0,
        'passthrough': 0
    };

    // init prevState as state
    var prevState = state;

    function updateState(key, value, shouldSendState) {
        if (key !== undefined && value !== undefined) {
            // updates state and syncs to client
            // backup state
            prevState = JSON.parse(JSON.stringify(state));
            // change state
            if (key === 'temp_house') {
                console.log(typeof state[key]);
                state[key] = state[key] + parseInt(value, 10);
            } else {
                state[key] = value;
            }
        }
        // sync that to client with socket.io
        if (shouldSendState) {
            io.sockets.emit('updateState', state);
        }
    }

    function sendString(str) {
        console.log('SENDING: ' + str);
        serialPort.write(str, function(err, result) {
            if (err) {
                console.log('err:' + err);
                console.log('results: ' + result);
            }
        });
    }

    function executeOp(op, param, shouldUpdateState) {
        if (shouldUpdateState === undefined) {
            shouldUpdateState = true;
        }

        var future = Future.create();
        if (op === undefined || param === undefined) {
            future.fulfill('No Operation or Arg', undefined);
        }

        var num = methods.indexOf(op);
        if (num === -1) {
            future.fulfill('Invalid operation', undefined);
        }

        if (op === 'temp_house') {
            if (param < 0) {
                param = (-1*param)+5000;
            }
        }

        if ((['lights_bed',
            'lights_bath',
            'lights_kitchen',
            'lights_garage',
            'lights_attic']).indexOf(op) !== -1) {
            state.lastCommand = 'lights';
        } else if (op === 'temp_coffee') {
            state.lastCommand = 'coffee';
        } else if (op === 'temp_house') {
            state.lastCommand = 'slide';
        } else if (op === 'garage') {
            state.lastCommand = 'garage';
        }

        var dwStr = num.toString() + ':' + param.toString();
        // REMOVE ME FOR PRODUCTION
        console.log(dwStr);
        // setTimeout(function() {
        //     future.fulfill(undefined, num.toString() + ":" + param.toString());
        //     console.log('updateState', op, param);
        //     updateState(op, param);
        // }, 200);
        // return future;


        sendString(dwStr);
        var t;
        function resolve(data) {
            serialPort.removeListener('data', resolve);
            // yay, got answer, update client
            if (param > 5000) {
                console.log(param, typeof param);
                param = (param-5000)*-1;
            }

            if (data !== undefined) {
                clearTimeout(t);
                updateState(op, param, shouldUpdateState);
                // console.log(data);
                future.fulfill(undefined, data.replace('\r', ''));
            } else {
                future.fulfill(undefined, num.toString() + ":" + param.toString());
                console.log('updateState', op, param);
                updateState(op, param);
            }
        }
        serialPort.on('data', resolve);
        t = setTimeout(resolve, 2000);
        return future;
    }

    api.test = function(req, res) {
        io.sockets.emit('test');
        res.send(200);
    };

    api.state = function(req, res) {
        if (req.method === 'GET') {
            // GET state
            res.json(state);
            return;
        } else if (req.method === 'POST') {
            // POST state
            // -> update state and run ops on any changed variables
            // LOW Priority
        }
    };

    api.op = function(req, res) {
        // Perform operation
        var operation, param;
        if (req.method === 'GET') {
            // param in the query string
            operation = req.query.op;
            param = req.query.param;
        } else {
            operation = req.body.op;
            param = req.body.param;
        }
        if (([2,3,4,5,7,8]).indexOf(methods.indexOf(operation)) !== -1) {
            if (param == 2) {
                param = (!state[operation]) ? 1 : 0;
            }
            console.log(state[operation]);
            console.log(param);
        }
        // now look up the operation in the array because I don't feel like dealing with strings in
        executeOp(operation, param).when(function(err, data) {
            res.send(200);
        });
    };

    function checkForOnOff(data) {
        if (data.outcome.entities.on_off === undefined) {
            return true;
        }
        return false;
    }

    function allOnOff(methodNums, value, shouldUpdateState) {
        for (var c = 0; c < methodNums.length; c++) {
            var i = methodNums[c];
            (function(cmd, p, index) {
                setTimeout(function() {
                    // issue command without sending state
                    executeOp(methods[cmd], p, shouldUpdateState);
                }, (index)*2000);
            })(i, value, c);
        }

        setTimeout(function() {
            updateState(undefined, undefined, true);
        }, methodNums.length*2000);
    }

    api.wit = function(req, res) {
        // req.query.transcript
        console.log(req.query.transcript);
        if (req.query.transcript === undefined || req.query.transcript === '') {
            res.json({error: "No Transcript"});
            return;
        }
        var operation, param;
        var wit_request = wit.request_wit(req.query.transcript);
        wit_request.when(function(err, data) {
            if (err) {
                console.log(err);
            }
            console.log(data.outcome);
            state.lastCommand = data.outcome.intent;
            switch (data.outcome.intent) {
            case 'lights':
                if (data.outcome.entities.location !== undefined) {
                    var location = data.outcome.entities.location.value.replace(' ', '');
                    operation = IRL[location];
                    // now get param
                    if (data.outcome.entities.on_off === undefined) {
                        res.send(200);
                    }
                    if (checkForOnOff(data)) {
                        res.send(200);
                        return;
                    }
                    param = data.outcome.entities.on_off.value === 'on' ? 1 : 0;
                    // prevState = state[operation]
                    // L_BED = payload.arg == 2 ? !L_BED : payload.arg;
                    param = param === 2 ? !state[operation] : param;

                    // execute and return status async
                    executeOp(operation, param).when(function(err, data) {
                        res.send(200);
                    });
                } else {
                    // turn all of the lights on/off
                    state.lastCommand = 'all_lights';
                    if (data.outcome.entities.on_off === undefined) {
                        res.send(200);
                    }
                    if (checkForOnOff(data)) {
                        res.send(200);
                        return;
                    }
                    param = data.outcome.entities.on_off.value === 'on' ? 1 : 0;
                    allOnOff([2,3,4,5,7,8], param, false);
                    updateState(undefined, undefined, true);
                    res.send(200);
                }
                break;

            case 'garage':
                if (checkForOnOff(data)) {
                    res.send(200);
                    return;
                }
                executeOp('garage', data.outcome.entities.on_off.value === 'on' ? 1 : 0).when(function(err, data) {
                    res.send(200);
                });
                break;

            case 'coffee':
                if (checkForOnOff(data)) {
                    res.send(200);
                    return;
                }
                executeOp('temp_coffee', data.outcome.entities.on_off.value === 'on' ? 1 : 0).when(function(err, data) {
                    res.send(200);
                });
                break;

            case 'slide':
                var relativeSlides;
                if (data.outcome.entities.number !== undefined) {
                    // were given number, switch to slide that way
                    // int slideDiff = TO_SLIDE - CURRENT_SLIDE;
                    relativeSlides = parseInt(data.outcome.entities.number.value, 10) - state.temp_house;
                    if (relativeSlides === 0) {
                        // do nothing
                        return;
                    }
                } else if (data.outcome.entities.slide_direction !== undefined) {
                    relativeSlides = data.outcome.entities.slide_direction.value === 'up' ? 1 : 0;
                }
                if (relativeSlides !== undefined) {
                    // if (state.temp_house + relativeSlides < 0) {
                    //     relativeSlides = relativeSlides-(Math.abs(relativeSlides-state.temp_house));
                    // }
                    executeOp('temp_house', relativeSlides).when(function(err, data) {
                        res.send(200);
                    });
                }
                break;

            case 'get':
                // used to get status of things
                // save for later
                // send client the op and param so it can do logic and talk and stuff

                break;

            case 'music':
                // music control on client
                // just send to client because this shit doesn't need to be on the server
                state.lastCommand = 'music';
                io.sockets.emit('music', data.outcome);
                res.send(200);
                break;
            case 'party':
                // do all the party things
                state.lastCommand = 'party';
                if (data.outcome.entities.party_state !== undefined) {
                    io.sockets.emit('party', data.outcome.entities.party_state.value === 'on');
                    if (data.outcome.entities.party_state.value === 'on') {
                        io.sockets.emit('music', JSON.parse(darude));
                        allOnOff([1,2,3,4,5,6,7,8], 1, false);
                    } else {
                        io.sockets.emit('music', JSON.parse(stopMusic));
                        allOnOff([1,2,3,4,5,6,7,8], 0, false);
                    }
                }
                break;

            case 'joke':
            case 'pickup':
            case 'fuck':
                state.lastCommand = data.outcome.intent;
                io.sockets.emit('respond', data.outcome.intent);
                res.send(200);
                break;
            }
        });
    };

    return api;
};