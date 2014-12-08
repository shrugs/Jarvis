'use strict';

describe('Service: SpeechRecognition', function () {

  // load the service's module
  beforeEach(module('jonyApp'));

  // instantiate service
  var SpeechRecognition;
  beforeEach(inject(function (_SpeechRecognition_) {
    SpeechRecognition = _SpeechRecognition_;
  }));

  it('should do something', function () {
    expect(!!SpeechRecognition).toBe(true);
  });

});
