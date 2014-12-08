'use strict';

describe('Service: Speak', function () {

  // load the service's module
  beforeEach(module('jonyApp'));

  // instantiate service
  var Speak;
  beforeEach(inject(function (_Speak_) {
    Speak = _Speak_;
  }));

  it('should do something', function () {
    expect(!!Speak).toBe(true);
  });

});
